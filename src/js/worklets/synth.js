//@format
import Module from "../bundle-wasm.js";

class SynthWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.kernel = Module();
    this.voiceManager = new this.kernel.VoiceManager(sampleRate, 64);
    this.n = 0;

    this.port.onmessage = this.handleEvents.bind(this);
    console.log("Worklet launched successfully");
  }

  handleEvents({ data }) {
    if (data.name === "NoteOn") {
      this.voiceManager.onNoteOn(data.key, 1, 1, 1, 1);
    } else if (data.name === "NoteOff") {
      this.voiceManager.onNoteOff(data.key);
    }
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    for (
      let channel = 0, numberOfChannels = output.length;
      channel < numberOfChannels;
      channel++
    ) {
      const outputChannel = output[channel];

      const sample = this.voiceManager.nextSample(this.n, outputChannel.length);
      for (let i = 0; i < sample.size(); i++) {
        outputChannel[i] = sample.get(i) * 0.2;
      }
    }
    this.n++;
    return true;
  }
}

registerProcessor("SynthWorklet", SynthWorklet);
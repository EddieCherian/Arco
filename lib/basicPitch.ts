// lib/basicPitch.ts
import * as basicPitch from '@spotify/basic-pitch';

let modelInstance: any = null;

async function getModel(): Promise<any> {
  if (!modelInstance) {
    // Use the correct BasicPitch API
    const modelURL = `${window.location.origin}/model/model.json`;
    modelInstance = await basicPitch.BasicPitch.load(modelURL);
  }
  return modelInstance;
}

function toMono(audioBuffer: AudioBuffer): AudioBuffer {
  if (audioBuffer.numberOfChannels === 1) return audioBuffer;

  const mono = new Float32Array(audioBuffer.length);

  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      mono[i] += data[i] / audioBuffer.numberOfChannels;
    }
  }

  const ctx = new AudioContext();
  const newBuffer = ctx.createBuffer(1, mono.length, audioBuffer.sampleRate);
  newBuffer.copyToChannel(mono, 0);

  return newBuffer;
}

export interface BasicPitchNote {
  pitchMidi: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  amplitude?: number;
}

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<BasicPitchNote[]> {
  const monoBuffer = toMono(audioBuffer);
  
  // Get audio data as Float32Array
  const audioData = monoBuffer.getChannelData(0);
  const sampleRate = monoBuffer.sampleRate;
  
  // Use BasicPitch's predict function
  const predictions = await basicPitch.predict(audioData, sampleRate);
  
  // Convert predictions to notes
  const notes: BasicPitchNote[] = predictions.notes.map((note: any) => ({
    pitchMidi: note.pitch,
    startTimeSeconds: note.startTimeSeconds,
    endTimeSeconds: note.endTimeSeconds,
    amplitude: note.amplitude
  }));
  
  return notes;
}
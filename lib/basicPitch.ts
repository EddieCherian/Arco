// lib/basicPitch.ts
import * as basicPitch from '@spotify/basic-pitch';

export interface BasicPitchNote {
  pitchMidi: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  amplitude?: number;
}

function toMono(audioBuffer: AudioBuffer): Float32Array {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }

  const mono = new Float32Array(audioBuffer.length);
  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    const channelData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < channelData.length; i++) {
      mono[i] += channelData[i] / audioBuffer.numberOfChannels;
    }
  }
  return mono;
}

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<BasicPitchNote[]> {
  const monoAudio = toMono(audioBuffer);
  const sampleRate = audioBuffer.sampleRate;
  
  // Use the correct BasicPitch API
  const notes = await basicPitch.predict(monoAudio, sampleRate);
  
  return notes.map((note: any) => ({
    pitchMidi: note.pitch,
    startTimeSeconds: note.startTimeSeconds,
    endTimeSeconds: note.endTimeSeconds,
    amplitude: note.amplitude
  }));
}
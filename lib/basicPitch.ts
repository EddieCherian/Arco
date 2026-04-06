// lib/basicPitch.ts
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

// Model URL (you need to host this or use the raw GitHub URL)
// For production, download the model files and host them yourself
const MODEL_URL = 'https://raw.githubusercontent.com/spotify/basic-pitch-ts/main/model/model.json';

export interface BasicPitchNote {
  pitchMidi: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  amplitude?: number;
  pitchBends?: number[];
}

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<BasicPitchNote[]> {
  // Ensure audio is at correct sample rate (Basic Pitch expects 22050 Hz)
  let processedBuffer = audioBuffer;
  if (audioBuffer.sampleRate !== 22050) {
    const offlineCtx = new OfflineAudioContext(1, audioBuffer.length * 22050 / audioBuffer.sampleRate, 22050);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();
    processedBuffer = await offlineCtx.startRendering();
  }

  // Convert to mono if needed
  let monoBuffer = processedBuffer;
  if (processedBuffer.numberOfChannels > 1) {
    const monoData = new Float32Array(processedBuffer.length);
    for (let ch = 0; ch < processedBuffer.numberOfChannels; ch++) {
      const channelData = processedBuffer.getChannelData(ch);
      for (let i = 0; i < channelData.length; i++) {
        monoData[i] += channelData[i] / processedBuffer.numberOfChannels;
      }
    }
    const offlineCtx = new OfflineAudioContext(1, monoData.length, processedBuffer.sampleRate);
    const newBuffer = offlineCtx.createBuffer(1, monoData.length, processedBuffer.sampleRate);
    newBuffer.copyToChannel(monoData, 0);
    monoBuffer = newBuffer;
  }

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  // Initialize BasicPitch model
  const basicPitch = new BasicPitch(MODEL_URL);

  // Run inference
  await basicPitch.evaluateModel(
    monoBuffer,
    (frame: number[][], onset: number[][], contour: number[][]) => {
      frames.push(...frame);
      onsets.push(...onset);
      contours.push(...contour);
    },
    (progress: number) => {
      console.log(`Basic Pitch progress: ${Math.round(progress * 100)}%`);
    }
  );

  // Convert model outputs to notes
  const notes = noteFramesToTime(
    addPitchBendsToNoteEvents(
      contours,
      outputToNotesPoly(frames, onsets, 0.5, 0.3, 5) // onset threshold, frame threshold, min note length
    )
  );

  return notes.map((note: any) => ({
    pitchMidi: note.pitchMidi,
    startTimeSeconds: note.startTimeSeconds,
    endTimeSeconds: note.endTimeSeconds,
    amplitude: note.amplitude,
    pitchBends: note.pitchBends
  }));
}
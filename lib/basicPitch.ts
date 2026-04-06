// lib/basicPitch.ts
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

const MODEL_URL = '/model/model.json';

export interface BasicPitchNote {
  pitchMidi: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  amplitude?: number;
  pitchBends?: number[];
}

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<BasicPitchNote[]> {
  console.log('🎵 Starting Basic Pitch transcription...');
  console.log('Audio buffer:', {
    duration: audioBuffer.duration,
    sampleRate: audioBuffer.sampleRate,
    channels: audioBuffer.numberOfChannels,
    length: audioBuffer.length
  });

  try {
    // Resample to 22050 Hz if needed
    let processedBuffer = audioBuffer;
    if (audioBuffer.sampleRate !== 22050) {
      console.log(`Resampling from ${audioBuffer.sampleRate}Hz to 22050Hz...`);
      const offlineCtx = new OfflineAudioContext(1, audioBuffer.length * 22050 / audioBuffer.sampleRate, 22050);
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start();
      processedBuffer = await offlineCtx.startRendering();
      console.log('Resampled buffer:', { duration: processedBuffer.duration, sampleRate: processedBuffer.sampleRate });
    }

    // Convert to mono
    let monoBuffer = processedBuffer;
    if (processedBuffer.numberOfChannels > 1) {
      console.log('Converting stereo to mono...');
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

    // Initialize model
    console.log('Loading Basic Pitch model from:', MODEL_URL);
    const basicPitch = new BasicPitch(MODEL_URL);
    
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];

    console.log('Running inference...');
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

    console.log(`Inference complete. Frames: ${frames.length}, Onsets: ${onsets.length}, Contours: ${contours.length}`);

    if (frames.length === 0) {
      throw new Error('No audio frames detected');
    }

    // Convert to notes
    const notes = noteFramesToTime(
      addPitchBendsToNoteEvents(
        contours,
        outputToNotesPoly(frames, onsets, 0.5, 0.3, 5)
      )
    );

    console.log(`Detected ${notes.length} notes`);
    
    if (notes.length === 0) {
      throw new Error('No notes detected in audio');
    }

    return notes.map((note: any) => ({
      pitchMidi: note.pitchMidi,
      startTimeSeconds: note.startTimeSeconds,
      endTimeSeconds: note.endTimeSeconds,
      amplitude: note.amplitude,
      pitchBends: note.pitchBends
    }));

  } catch (error) {
    console.error('Basic Pitch error:', error);
    throw error;
  }
}
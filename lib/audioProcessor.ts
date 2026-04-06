import { MidiData } from './types';
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

let modelInstance: BasicPitch | null = null;

async function getModel(): Promise<BasicPitch> {
  if (!modelInstance) {
    modelInstance = new BasicPitch(`${window.location.origin}/model/model.json`);
  }
  return modelInstance;
}

function resampleAudioBuffer(audioBuffer: AudioBuffer, targetSampleRate: number): AudioBuffer {
  const ratio = audioBuffer.sampleRate / targetSampleRate;
  const newLength = Math.round(audioBuffer.length / ratio);
  const offlineCtx = new OfflineAudioContext(1, newLength, targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  // Return a mono buffer at target sample rate
  const monoBuffer = new AudioBuffer({
    length: newLength,
    sampleRate: targetSampleRate,
    numberOfChannels: 1,
  });
  // Copy first channel data resampled
  const inputData = audioBuffer.getChannelData(0);
  const outputData = monoBuffer.getChannelData(0);
  for (let i = 0; i < newLength; i++) {
    const srcIdx = Math.min(Math.floor(i * ratio), inputData.length - 1);
    outputData[i] = inputData[srcIdx];
  }
  return monoBuffer;
}

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];

    // Basic Pitch requires 22050 Hz sample rate
    const processBuffer = audioBuffer.sampleRate !== 22050
      ? resampleAudioBuffer(audioBuffer, 22050)
      : audioBuffer;

    const model = await getModel();

    await model.evaluateModel(
      processBuffer,
      (f: number[][], o: number[][], c: number[][]) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
      },
      () => {}
    );

    if (frames.length === 0) {
      throw new Error('No audio data detected. Please try recording again.');
    }

    const notes = noteFramesToTime(
      addPitchBendsToNoteEvents(
        contours,
        outputToNotesPoly(frames, onsets, 0.25, 0.25, 5)
      )
    );

    if (notes.length === 0) {
      throw new Error('No notes detected. Try playing louder or closer to the microphone.');
    }

    return {
      notes: notes.map((n: any) => ({
        pitch: n.pitchMidi,
        startTime: n.startTimeSeconds,
        endTime: n.endTimeSeconds,
        velocity: Math.round((n.amplitude ?? 0.8) * 127),
      })),
      tempo: AudioProcessor.estimateTempo(notes),
      timeSignature: [4, 4],
      key: AudioProcessor.detectKey(notes),
      clef: 'treble',
      instrument: 'piano',
      octaveShift: 0,
    };
  }

  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    // Convert to audio/wav if possible for better compatibility
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    try {
      const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
      return decoded;
    } catch {
      // Try again with a fresh context at 22050
      const ctx2 = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 22050 });
      const copy = arrayBuffer.slice(0);
      return await ctx2.decodeAudioData(copy);
    }
  }

  static estimateTempo(notes: any[]): number {
    if (notes.length < 2) return 120;
    const intervals: number[] = [];
    for (let i = 1; i < Math.min(notes.length, 12); i++) {
      const interval = notes[i].startTimeSeconds - notes[i - 1].startTimeSeconds;
      if (interval > 0.1 && interval < 2) intervals.push(interval);
    }
    if (intervals.length === 0) return 120;
    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60 / avg);
    return Math.min(200, Math.max(60, bpm));
  }

  static detectKey(notes: any[]): string {
    if (notes.length === 0) return 'C';
    const majorKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    const freq = new Array(12).fill(0);
    notes.forEach((n: any) => freq[n.pitchMidi % 12]++);
    return majorKeys[freq.indexOf(Math.max(...freq))];
  }
}

export class HumModeProcessor extends AudioProcessor {
  static async transcribeHumming(audioBuffer: AudioBuffer): Promise<MidiData> {
    const result = await AudioProcessor.transcribeAudio(audioBuffer);
    return {
      ...result,
      instrument: 'soprano',
      key: AudioProcessor.detectKey(result.notes.map(n => ({ pitchMidi: n.pitch }))),
    };
  }
}

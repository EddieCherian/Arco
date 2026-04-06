import { MidiData } from './types';
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];

    const model = new BasicPitch('/model/model.json');

    await model.evaluateModel(
      audioBuffer,
      (f: number[][], o: number[][], c: number[][]) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
      },
      () => {}
    );

    const notes = noteFramesToTime(
      addPitchBendsToNoteEvents(
        contours,
        outputToNotesPoly(frames, onsets, 0.25, 0.25, 5)
      )
    );

    return {
      notes: notes.map((n: any) => ({
        pitch: n.pitchMidi,
        startTime: n.startTimeSeconds,
        endTime: n.endTimeSeconds,
        velocity: Math.round((n.amplitude ?? 0.8) * 127),
      })),
      tempo: 120,
      timeSignature: [4, 4],
      key: 'C',
      clef: 'treble',
      instrument: 'piano',
      octaveShift: 0,
    };
  }

  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
}

export class HumModeProcessor extends AudioProcessor {
  static async transcribeHumming(audioBuffer: AudioBuffer): Promise<MidiData> {
    const result = await AudioProcessor.transcribeAudio(audioBuffer);
    return {
      ...result,
      instrument: 'soprano',
      key: this.detectKey(result.notes),
    };
  }

  static detectKey(notes: Array<{ pitch: number }>): string {
    if (notes.length === 0) return 'C';
    const majorKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    const freq = new Array(12).fill(0);
    notes.forEach(n => freq[n.pitch % 12]++);
    return majorKeys[freq.indexOf(Math.max(...freq))];
  }
}

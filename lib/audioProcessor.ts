import { MidiData } from './types';
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

let modelInstance: BasicPitch | null = null;

async function getModel(): Promise<BasicPitch> {
  if (!modelInstance) {
    modelInstance = new BasicPitch(`${window.location.origin}/model/model.json`);
  }
  return modelInstance;
}

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];

    const model = await getModel();

    await model.evaluateModel(
      audioBuffer,
      (f: number[][], o: number[][], c: number[][]) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
      },
      () => {}
    );

    if (frames.length === 0) {
      throw new Error('No audio data detected.');
    }

    const rawNotes = noteFramesToTime(
      addPitchBendsToNoteEvents(
        contours,
        outputToNotesPoly(frames, onsets, 0.6, 0.6, 5)
      )
    );

    if (rawNotes.length === 0) {
      throw new Error('No notes detected.');
    }

    // 🔥 CLEAN BUT KEEP ALL NOTES
    const notes = rawNotes
      .filter((n: any) => (n.endTimeSeconds - n.startTimeSeconds) > 0.08)
      .filter((n: any) => (n.amplitude ?? 0.8) > 0.15)
      .sort((a: any, b: any) => a.startTimeSeconds - b.startTimeSeconds);

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
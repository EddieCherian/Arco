import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

let modelInstance: BasicPitch | null = null;

async function getModel(): Promise<BasicPitch> {
  if (!modelInstance) {
    modelInstance = new BasicPitch(`${window.location.origin}/model/model.json`);
  }
  return modelInstance;
}

export interface BasicPitchNote {
  pitchMidi: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  amplitude?: number;
}

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<BasicPitchNote[]> {
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

  if (!rawNotes || rawNotes.length === 0) {
    throw new Error('No notes detected.');
  }

  return rawNotes;
}

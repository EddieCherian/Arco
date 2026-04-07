import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

// 🔥 USE YOUR LOCAL MODEL (THIS IS THE FIX)
const MODEL_URL = '/model/model.json';

let cachedModel: BasicPitch | null = null;

async function getModel(): Promise<BasicPitch> {
  if (!cachedModel) {
    cachedModel = new BasicPitch(MODEL_URL);
  }
  return cachedModel;
}

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<any[]> {
  console.log('🎵 Running Basic Pitch...');

  const model = await getModel();

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  await model.evaluateModel(
    audioBuffer,
    (frame: number[][], onset: number[][], contour: number[][]) => {
      frames.push(...frame);
      onsets.push(...onset);
      contours.push(...contour);
    },
    (progress: number) => {
      console.log(`Basic Pitch progress: ${Math.round(progress * 100)}%`);
    }
  );

  console.log(`Frames: ${frames.length}, Onsets: ${onsets.length}`);

  if (frames.length === 0) {
    throw new Error('No audio frames detected. Try recording louder or closer to the mic.');
  }

  const notes = noteFramesToTime(
    addPitchBendsToNoteEvents(
      contours,
      outputToNotesPoly(
        frames,
        onsets,
        0.4,
        0.3,
        1
      )
    )
  );

  console.log(`✅ Detected ${notes.length} notes`);

  if (notes.length === 0) {
    throw new Error('No notes detected. Try playing more clearly or increasing recording volume.');
  }

  return notes.map((note: any) => ({
    pitch: note.pitchMidi,
    startTime: note.startTimeSeconds,
    endTime: note.endTimeSeconds,
    velocity: Math.floor((note.amplitude || 0.5) * 127),
  }));
}
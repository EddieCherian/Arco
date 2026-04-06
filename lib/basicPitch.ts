import {
  BasicPitch,
  noteFramesToTime,
  addPitchBendsToNoteEvents,
  outputToNotesMono
} from '@spotify/basic-pitch';

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

// 🔥 Convert to mono (IMPORTANT)
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

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<BasicPitchNote[]> {
  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  const model = await getModel();

  // 🔥 FORCE MONO INPUT
  const monoBuffer = toMono(audioBuffer);

  await model.evaluateModel(
    monoBuffer,
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

  // 🔥 MUCH STRICTER + MONO MODE
  const rawNotes = noteFramesToTime(
    addPitchBendsToNoteEvents(
      contours,
      outputToNotesMono(frames, onsets, 0.95, 0.95)
    )
  );

  if (!rawNotes || rawNotes.length === 0) {
    throw new Error('No notes detected.');
  }

  return rawNotes;
}
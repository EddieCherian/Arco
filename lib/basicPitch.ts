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

  // 🔥 TRIM AUDIO (max ~10s)
  if (audioBuffer.duration > 10) {
    const ctx = new AudioContext();
    const trimmed = ctx.createBuffer(
      audioBuffer.numberOfChannels,
      10 * audioBuffer.sampleRate,
      audioBuffer.sampleRate
    );

    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const oldData = audioBuffer.getChannelData(ch);
      const newData = trimmed.getChannelData(ch);
      newData.set(oldData.slice(0, 10 * audioBuffer.sampleRate));
    }

    audioBuffer = trimmed;
    console.log('✂️ Trimmed to 10s');
  }

  // 🔥 FORCE MONO
  if (audioBuffer.numberOfChannels > 1) {
    const ctx = new AudioContext();
    const mono = ctx.createBuffer(
      1,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    const out = mono.getChannelData(0);

    for (let i = 0; i < audioBuffer.length; i++) {
      out[i] = (left[i] + right[i]) / 2;
    }

    audioBuffer = mono;
    console.log('🎚️ Converted to mono');
  }

  // 🔥 NORMALIZE AUDIO
  const data = audioBuffer.getChannelData(0);

  let max = 0;
  for (let i = 0; i < data.length; i++) {
    const val = Math.abs(data[i]);
    if (val > max) max = val;
  }

  if (max > 0) {
    for (let i = 0; i < data.length; i++) {
      data[i] /= max;
    }
    console.log('🔊 Normalized audio');
  }

  // 🔥 RESAMPLE TO 22050 Hz (CRITICAL)
  if (audioBuffer.sampleRate !== 22050) {
    const targetRate = 22050;

    const offlineCtx = new OfflineAudioContext(
      1,
      Math.ceil(audioBuffer.length * targetRate / audioBuffer.sampleRate),
      targetRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    audioBuffer = await offlineCtx.startRendering();

    console.log('🔁 Resampled to 22050 Hz');
  }

  const model = await getModel();

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  // 🔥 TIMEOUT PROTECTION
  await Promise.race([
    model.evaluateModel(
      audioBuffer,
      (frame: number[][], onset: number[][], contour: number[][]) => {
        frames.push(...frame);
        onsets.push(...onset);
        contours.push(...contour);
      },
      (progress: number) => {
        console.log(`Basic Pitch progress: ${Math.round(progress * 100)}%`);
      }
    ),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Basic Pitch timeout')), 15000)
    )
  ]);

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
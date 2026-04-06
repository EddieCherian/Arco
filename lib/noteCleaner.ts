export interface RawNote {
  pitchMidi: number;
  startTimeSeconds: number;
  endTimeSeconds: number;
  amplitude?: number;
}

export interface CleanNote {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
}

export function cleanAndStabilizeNotes(rawNotes: RawNote[]): CleanNote[] {
  if (!rawNotes || rawNotes.length === 0) return [];

  // 1. basic filtering
  const filtered = rawNotes
    .filter(n => (n.endTimeSeconds - n.startTimeSeconds) > 0.12)
    .filter(n => (n.amplitude ?? 0.8) > 0.3)
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);

  // 2. remove duplicates / jitter
  const stabilized: RawNote[] = [];
  const timeThreshold = 0.05;

  for (const note of filtered) {
    const last = stabilized[stabilized.length - 1];

    if (
      last &&
      Math.abs(note.startTimeSeconds - last.startTimeSeconds) < timeThreshold &&
      Math.abs(note.pitchMidi - last.pitchMidi) <= 1
    ) {
      continue;
    }

    stabilized.push(note);
  }

  // 3. group by time slice and keep strongest (melody)
  const groups: Record<string, RawNote[]> = {};

  stabilized.forEach(note => {
    const key = Math.round(note.startTimeSeconds / 0.1).toString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(note);
  });

  const finalNotes: RawNote[] = [];

  Object.values(groups).forEach(group => {
    const best = group.reduce((a, b) =>
      (a.amplitude ?? 0.8) > (b.amplitude ?? 0.8) ? a : b
    );
    finalNotes.push(best);
  });

  // 4. convert format
  return finalNotes.map(n => ({
    pitch: n.pitchMidi,
    startTime: n.startTimeSeconds,
    endTime: n.endTimeSeconds,
    velocity: Math.round((n.amplitude ?? 0.8) * 127),
  }));
}

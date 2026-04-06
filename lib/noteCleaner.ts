export function cleanAndStabilizeNotes(rawNotes: any[]) {
  // 🔥 STEP 1: filter garbage
  let notes = rawNotes
    .filter(n => (n.endTime - n.startTime) > 0.1)
    .filter(n => (n.velocity ?? 80) > 50)
    .sort((a, b) => a.startTime - b.startTime);

  // 🔥 STEP 2: group notes close in time
  const grouped: any[] = [];

  for (const note of notes) {
    if (grouped.length === 0) {
      grouped.push(note);
      continue;
    }

    const last = grouped[grouped.length - 1];

    if (Math.abs(note.startTime - last.startTime) < 0.06) {
      // keep stronger note
      if ((note.velocity ?? 80) > (last.velocity ?? 80)) {
        grouped[grouped.length - 1] = note;
      }
    } else {
      grouped.push(note);
    }
  }

  // 🔥 STEP 3: smooth pitch jumps
  const smoothed = grouped.map((note, i, arr) => {
    if (i === 0) return note;

    const prev = arr[i - 1];

    if (Math.abs(note.pitch - prev.pitch) > 12) {
      return { ...note, pitch: prev.pitch };
    }

    return note;
  });

  return smoothed;
}
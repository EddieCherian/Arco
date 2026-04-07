// lib/noteCleaner.ts
export function cleanAndStabilizeNotes(notes: any[]): any[] {
  if (!notes || notes.length === 0) return [];
  
  console.log('🔧 Cleaning notes. Input count:', notes.length);
  console.log('First raw note sample:', notes[0]);
  
  // Normalize note properties
  const normalizedNotes = notes.map(note => {
    const pitch = note.pitchMidi !== undefined ? note.pitchMidi : 
                  note.pitch !== undefined ? note.pitch : 
                  note.midi !== undefined ? note.midi : 60;
    
    const startTime = note.startTimeSeconds !== undefined ? note.startTimeSeconds : 
                      note.startTime !== undefined ? note.startTime : 0;
    
    const endTime = note.endTimeSeconds !== undefined ? note.endTimeSeconds : 
                    note.endTime !== undefined ? note.endTime : startTime + 0.5;
    
    const velocity = note.amplitude !== undefined ? Math.floor(note.amplitude * 127) : 
                     note.velocity !== undefined ? note.velocity : 80;
    
    return {
      pitch: Math.round(pitch),
      startTime: startTime,
      endTime: endTime,
      velocity: Math.min(127, Math.max(20, velocity))
    };
  });
  
  console.log('Normalized notes sample:', normalizedNotes.slice(0, 3));
  
  // Remove impossibly short notes
  const minDuration = 0.03;
  let cleaned = normalizedNotes.filter(note => 
    (note.endTime - note.startTime) >= minDuration
  );
  
  console.log(`After duration filter: ${cleaned.length} notes (removed ${normalizedNotes.length - cleaned.length})`);
  
  // Deduplicate same-time notes (keep strongest)
  const uniqueByTime = new Map();
  for (const note of cleaned) {
    const timeKey = note.startTime.toFixed(2);
    if (!uniqueByTime.has(timeKey) || uniqueByTime.get(timeKey).velocity < note.velocity) {
      uniqueByTime.set(timeKey, note);
    }
  }
  cleaned = Array.from(uniqueByTime.values());
  
  console.log(`After deduplication: ${cleaned.length} notes`);
  
  // Sort
  cleaned.sort((a, b) => a.startTime - b.startTime);
  
  // Fallback
  if (cleaned.length === 0 && normalizedNotes.length > 0) {
    console.warn('⚠️ All notes filtered! Returning first 10 raw notes as fallback.');
    return normalizedNotes.slice(0, 10);
  }
  
  // Limit
  if (cleaned.length > 50) {
    console.log(`Limiting to 50 notes (from ${cleaned.length})`);
    cleaned = cleaned.slice(0, 50);
  }

  // =========================
  // 🔥 RHYTHM FIX (QUANTIZATION)
  // =========================

  const tempo = 120; // you can replace this later with detected tempo
  const secondsPerBeat = 60 / tempo;

  // snap to 8th notes (you can tweak this)
  const quantize = (time: number) => {
    const beats = time / secondsPerBeat;
    const snapped = Math.round(beats * 2) / 2; // 1/8 notes
    return snapped * secondsPerBeat;
  };

  const quantized = cleaned.map(note => {
    const start = quantize(note.startTime);
    const end = quantize(note.endTime);

    return {
      ...note,
      startTime: start,
      endTime: Math.max(start + 0.1, end), // prevent zero-length notes
    };
  });

  console.log('🎯 Quantized notes sample:', quantized.slice(0, 5));
  console.log(`✅ Final cleaned notes: ${quantized.length}`);

  return quantized;
}
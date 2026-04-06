// lib/noteCleaner.ts
export function cleanAndStabilizeNotes(notes: any[]): any[] {
  if (!notes || notes.length === 0) return [];
  
  console.log('🔧 Cleaning notes. Input count:', notes.length);
  console.log('First raw note sample:', notes[0]);
  
  // Normalize note properties (Basic Pitch uses different property names)
  const normalizedNotes = notes.map(note => {
    // Handle different property naming conventions
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
  
  // Only remove notes that are impossibly short (< 30ms)
  const minDuration = 0.03;
  let cleaned = normalizedNotes.filter(note => 
    (note.endTime - note.startTime) >= minDuration
  );
  
  console.log(`After duration filter: ${cleaned.length} notes (removed ${normalizedNotes.length - cleaned.length})`);
  
  // Remove duplicate notes at exact same time (keep the highest velocity)
  const uniqueByTime = new Map();
  for (const note of cleaned) {
    const timeKey = note.startTime.toFixed(2);
    if (!uniqueByTime.has(timeKey) || uniqueByTime.get(timeKey).velocity < note.velocity) {
      uniqueByTime.set(timeKey, note);
    }
  }
  cleaned = Array.from(uniqueByTime.values());
  
  console.log(`After deduplication: ${cleaned.length} notes`);
  
  // Sort by start time
  cleaned.sort((a, b) => a.startTime - b.startTime);
  
  // If we lost all notes but had input, return first 10 notes as fallback
  if (cleaned.length === 0 && normalizedNotes.length > 0) {
    console.warn('⚠️ All notes filtered! Returning first 10 raw notes as fallback.');
    return normalizedNotes.slice(0, 10);
  }
  
  // Limit to first 50 notes to avoid overwhelming the renderer
  if (cleaned.length > 50) {
    console.log(`Limiting to 50 notes (from ${cleaned.length})`);
    cleaned = cleaned.slice(0, 50);
  }
  
  console.log(`✅ Final cleaned notes: ${cleaned.length}`);
  return cleaned;
}
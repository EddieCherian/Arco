// lib/noteCleaner.ts
export function cleanAndStabilizeNotes(notes: any[]): any[] {
  if (!notes || notes.length === 0) return [];
  
  console.log('🔧 Cleaning notes. Input:', notes.length);
  console.log('First few raw notes:', notes.slice(0, 3));
  
  // Basic Pitch returns notes with different property names
  // Let's normalize them first
  const normalizedNotes = notes.map(note => ({
    pitch: note.pitchMidi !== undefined ? note.pitchMidi : note.pitch,
    startTime: note.startTimeSeconds !== undefined ? note.startTimeSeconds : note.startTime,
    endTime: note.endTimeSeconds !== undefined ? note.endTimeSeconds : note.endTime,
    velocity: note.amplitude ? Math.floor(note.amplitude * 127) : 80
  }));
  
  console.log('Normalized notes:', normalizedNotes.slice(0, 3));
  
  // Filter out notes that are too short (less than 50ms)
  const minDuration = 0.05;
  let cleaned = normalizedNotes.filter(note => 
    (note.endTime - note.startTime) >= minDuration
  );
  
  console.log(`After duration filter: ${cleaned.length} notes (removed ${normalizedNotes.length - cleaned.length})`);
  
  // Remove duplicate notes at the exact same time
  const uniqueNotes = [];
  const timeMap = new Map();
  
  for (const note of cleaned) {
    const timeKey = Math.round(note.startTime * 10);
    if (!timeMap.has(timeKey)) {
      timeMap.set(timeKey, note);
      uniqueNotes.push(note);
    }
  }
  
  cleaned = uniqueNotes;
  console.log(`After duplicate filter: ${cleaned.length} notes`);
  
  // Don't be too aggressive - keep notes even if they're short or low velocity
  // Just ensure they're in valid range
  cleaned = cleaned.filter(note => 
    note.pitch >= 40 && note.pitch <= 96 && // Valid MIDI range
    note.startTime >= 0 &&
    note.endTime > note.startTime
  );
  
  console.log(`After range filter: ${cleaned.length} notes`);
  
  // Only remove if there are no notes at all
  if (cleaned.length === 0 && normalizedNotes.length > 0) {
    console.warn('All notes were filtered out! Using original notes as fallback.');
    return normalizedNotes.slice(0, 30); // Return first 30 notes as fallback
  }
  
  return cleaned;
}
import { Note } from './types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 🎵 MIDI → note name
function midiToNote(pitch: number) {
  const note = NOTE_NAMES[pitch % 12];
  const octave = Math.floor(pitch / 12) - 1;
  return `${note}${octave}`;
}

// 🎯 note name → MIDI
function noteToMidi(note: string) {
  const name = note.slice(0, -1);
  const octave = parseInt(note.slice(-1));

  const index = NOTE_NAMES.indexOf(name);
  return index + (octave + 1) * 12;
}

// 🤖 MAIN AI FUNCTION
export async function generateBassFromAI(melody: Note[]): Promise<Note[]> {
  if (!melody || melody.length === 0) return [];

  // 🔥 Send note + duration (important)
  const noteData = melody.map(n => ({
    note: midiToNote(n.pitch),
    duration: +(n.endTime - n.startTime).toFixed(2),
  }));

  const res = await fetch('/api/music', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes: noteData }),
  });

  const data = await res.json();

  if (!data || !data.bass) {
    console.error('AI failed:', data);
    return [];
  }

  // 🎵 Convert AI bass → timed notes
  const bass: Note[] = melody.map((n, i) => {
    const noteName = data.bass[i % data.bass.length];
    const pitch = noteToMidi(noteName);

    return {
      pitch,
      startTime: n.startTime,
      endTime: n.endTime,
      velocity: 80,
    };
  });

  return bass;
}

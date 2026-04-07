import { Note } from './types';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
  'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B',
};

function midiToNote(pitch: number): string {
  const note = NOTE_NAMES[pitch % 12];
  const octave = Math.floor(pitch / 12) - 1;
  return `${note}${octave}`;
}

function noteToMidi(note: string): number {
  try {
    // Match note name (1-2 chars) + optional sharp/flat + octave number
    const match = note.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) {
      console.warn('Could not parse note:', note);
      return 48; // fallback to C3
    }

    let name = match[1];
    const octave = parseInt(match[2]);

    // Convert flats to sharps
    if (FLAT_TO_SHARP[name]) {
      name = FLAT_TO_SHARP[name];
    }

    const index = NOTE_NAMES.indexOf(name);
    if (index === -1) {
      console.warn('Unknown note name:', name);
      return 48;
    }

    return index + (octave + 1) * 12;
  } catch {
    return 48;
  }
}

export async function generateBassFromAI(melody: Note[]): Promise<Note[]> {
  if (!melody || melody.length === 0) return [];

  const noteData = melody.map(n => ({
    note: midiToNote(n.pitch),
    duration: +(n.endTime - n.startTime).toFixed(2),
  }));

  try {
    const res = await fetch('/api/music', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: noteData }),
    });

    if (!res.ok) {
      console.error('Music API failed with status:', res.status);
      return [];
    }

    const data = await res.json();

    if (!data || !data.bass || !Array.isArray(data.bass) || data.bass.length === 0) {
      console.error('AI returned no bass:', data);
      return [];
    }

    const bass: Note[] = melody.map((n, i) => {
      const noteName = data.bass[i % data.bass.length];
      const pitch = noteToMidi(noteName);

      return {
        pitch: Math.max(24, Math.min(60, pitch)), // clamp to bass range C1-C4
        startTime: n.startTime,
        endTime: n.endTime,
        velocity: 80,
      };
    });

    console.log('✅ Bass generated:', bass.length, 'notes');
    return bass;

  } catch (err) {
    console.error('generateBassFromAI error:', err);
    return [];
  }
}

// 🎵 Single note structure
export interface Note {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
  clef?: 'treble' | 'bass'; // Which staff it belongs to (for rendering)
}

// 🎼 Main MIDI data - Uses single notes array (treble + AI bass combined)
export interface MidiData {
  notes: Note[];  // All notes (melody + AI generated bass)
  
  tempo: number;
  timeSignature: [number, number];
  key: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor';
  instrument: string;
  octaveShift: number;
}

// 💾 Saved piece
export interface SavedPiece {
  id: string;
  userId: string;
  name: string;
  midiData: MidiData;
  instrument: string;
  key: string;
  bpm: number;
  timeSignature: string;
  createdAt: Date;
  updatedAt: Date;
  shared: boolean;
  shareId?: string;
}

// 📤 API result
export interface TranscriptionResult {
  success: boolean;
  midiData?: MidiData;
  error?: string;
}
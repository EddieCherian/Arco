// 🎵 Single note structure
export interface Note {
  pitch: number;
  startTime: number;
  endTime: number;
  velocity: number;
}

// 🎼 Main MIDI data (NOW supports two clefs)
export interface MidiData {
  treble: Note[]; // melody (right hand)
  bass: Note[];   // bassline (left hand)

  tempo: number;
  timeSignature: [number, number];
  key: string;

  instrument: string;
  octaveShift: number;
}

// 💾 Saved piece (still works fine)
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
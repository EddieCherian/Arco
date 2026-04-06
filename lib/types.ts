export interface MidiData {
  notes: Array<{
    pitch: number;
    startTime: number;
    endTime: number;
    velocity: number;
  }>;
  tempo: number;
  timeSignature: [number, number];
  key: string;
  clef: 'treble' | 'bass' | 'alto' | 'tenor';
  instrument: string;
  octaveShift: number;
}

export interface SavedPiece {
  id: string;
  userId: string;
  name: string;
  midiData: MidiData;
  instrument: string;
  clef: string;
  key: string;
  bpm: number;
  timeSignature: string;
  createdAt: Date;
  updatedAt: Date;
  shared: boolean;
  shareId?: string;
}

export interface TranscriptionResult {
  success: boolean;
  midiData?: MidiData;
  error?: string;
}

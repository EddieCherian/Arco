import * as mm from '@magenta/music';
import { MidiData } from './types';

export class MidiConverter {
  private static instrumentRanges: Record<string, [number, number]> = {
    piano: [21, 108],
    violin: [55, 88],
    cello: [36, 72],
    viola: [48, 79],
    flute: [60, 96],
    trumpet: [55, 87],
    clarinet: [50, 82],
    saxophone: [53, 85],
    guitar: [40, 76],
    bass: [28, 60],
    soprano: [60, 84],
    alto: [58, 80],
    tenor: [55, 76],
    bass_voice: [50, 70]
  };
  
  static async convertInstrument(
    midiData: MidiData,
    targetInstrument: string
  ): Promise<MidiData> {
    const sourceInstrument = midiData.instrument;
    const targetRange = this.instrumentRanges[targetInstrument] || [21, 108];
    
    let convertedNotes = midiData.notes.map(note => {
      let newPitch = note.pitch;
      
      if (targetInstrument.includes('voice') && midiData.notes.length > 1) {
        const highestPitch = Math.max(...midiData.notes.map(n => n.pitch));
        newPitch = highestPitch;
      }
      
      newPitch = Math.max(targetRange[0], Math.min(targetRange[1], newPitch));
      
      return { ...note, pitch: newPitch };
    });
    
    if (midiData.notes.length > 1 && targetInstrument.includes('voice')) {
      convertedNotes = [convertedNotes[0]];
    }
    
    return {
      ...midiData,
      instrument: targetInstrument,
      notes: convertedNotes
    };
  }
  
  static transpose(midiData: MidiData, semitones: number): MidiData {
    return {
      ...midiData,
      notes: midiData.notes.map(note => ({
        ...note,
        pitch: note.pitch + semitones
      }))
    };
  }
  
  static shiftOctave(midiData: MidiData, octaves: number): MidiData {
    return this.transpose(midiData, octaves * 12);
  }
  
  static changeKey(midiData: MidiData, newKey: string): MidiData {
    const keyMap: Record<string, number> = {
      'C': 0, 'Cm': 0, 'G': 1, 'Gm': 1, 'D': 2, 'Dm': 2, 'A': 3, 'Am': 3,
      'E': 4, 'Em': 4, 'B': 5, 'Bm': 5, 'F#': 6, 'F#m': 6, 'Db': 7, 'C#m': 7,
      'Ab': 8, 'G#m': 8, 'Eb': 9, 'D#m': 9, 'Bb': 10, 'A#m': 10, 'F': 11, 'Fm': 11
    };
    
    const currentKeyNum = keyMap[midiData.key] || 0;
    const targetKeyNum = keyMap[newKey] || 0;
    const semitoneShift = targetKeyNum - currentKeyNum;
    
    return {
      ...midiData,
      key: newKey,
      notes: midiData.notes.map(note => ({
        ...note,
        pitch: note.pitch + semitoneShift
      }))
    };
  }
}

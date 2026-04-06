import { MidiData } from './types';
import { runBasicPitch } from './basicPitch';
import { cleanAndStabilizeNotes } from './noteCleaner';

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    // 🔥 USE BASIC PITCH (moved out to its own file)
    const rawNotes = await runBasicPitch(audioBuffer);

    if (!rawNotes || rawNotes.length === 0) {
      throw new Error('No notes detected.');
    }

    // 🔥 CLEAN + STABILIZE
    const notes = cleanAndStabilizeNotes(rawNotes);

    return {
      notes,
      tempo: 120,
      timeSignature: [4, 4],
      key: 'C',
      clef: 'treble',
      instrument: 'piano',
      octaveShift: 0,
    };
  }

  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
}
import { MidiData } from './types';
import { runBasicPitch } from './basicPitch';
import { cleanAndStabilizeNotes } from './noteCleaner';

// 🔥 TEMP bass generator (replace with AI later)
function generateBassFromMelody(melody: any[]) {
  return melody.map((n: any) => ({
    pitch: 36, // C2 (safe bass note)
    startTime: n.startTime,
    endTime: n.endTime,
    velocity: 80,
  }));
}

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    console.log('🎧 Starting transcription...');

    // 🔥 RUN BASIC PITCH
    const rawNotes = await runBasicPitch(audioBuffer);
    console.log('🧠 Raw notes:', rawNotes?.slice(0, 10));

    if (!rawNotes || rawNotes.length === 0) {
      throw new Error('No notes detected.');
    }

    // 🔥 CLEAN + STABILIZE
    const cleanedNotes = cleanAndStabilizeNotes(rawNotes);
    console.log('✨ Cleaned notes:', cleanedNotes.slice(0, 10));

    if (!cleanedNotes || cleanedNotes.length === 0) {
      throw new Error('Notes removed during cleaning (too noisy input).');
    }

    // 🎹 TREBLE (melody)
    const melodyNotes = cleanedNotes.map((n: any) => ({
      pitch: n.pitch,
      startTime: n.startTime,
      endTime: n.endTime,
      velocity: n.velocity ?? 100,
    }));

    // 🎵 BASS (for second clef)
    const bassNotes = generateBassFromMelody(melodyNotes);

    // 🔥 RETURN BOTH CLEFS
    return {
      treble: melodyNotes,
      bass: bassNotes,
      tempo: 120,
      timeSignature: [4, 4],
      key: 'C',
      instrument: 'piano',
      octaveShift: 0,
    };
  }

  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    return await audioContext.decodeAudioData(arrayBuffer);
  }
}
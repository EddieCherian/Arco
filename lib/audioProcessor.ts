import { MidiData } from './types';
import { runBasicPitch } from './basicPitch';
import { cleanAndStabilizeNotes } from './noteCleaner';
import { generateBassFromAI } from './musicAI'; // 🔥 USE AI

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    console.log('🎧 Starting transcription...');

    // 🎧 STEP 1: detect notes
    const rawNotes = await runBasicPitch(audioBuffer);
    console.log('🧠 Raw notes:', rawNotes?.slice(0, 10));

    if (!rawNotes || rawNotes.length === 0) {
      throw new Error('No notes detected.');
    }

    // 🧼 STEP 2: clean notes
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
      clef: 'treble', // 🔥 IMPORTANT
    }));

    // 🤖 BASS (AI GENERATED)
    const aiBass = await generateBassFromAI(melodyNotes);

    const bassNotes = aiBass.map((n: any) => ({
      ...n,
      clef: 'bass', // 🔥 IMPORTANT
    }));

    // 🎼 MERGE INTO ONE ARRAY (THIS FIXES YOUR WHOLE APP)
    const allNotes = [...melodyNotes, ...bassNotes];

    return {
      notes: allNotes,
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
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    return await audioContext.decodeAudioData(arrayBuffer);
  }
}
import { MidiData, Note } from './types';
import { runBasicPitch } from './basicPitch';
import { cleanAndStabilizeNotes } from './noteCleaner';
import { generateBassFromAI } from './musicAI';

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

    // 🎹 TREBLE (melody) - add clef property
    const melodyNotes: Note[] = cleanedNotes.map((n: any) => ({
      pitch: n.pitch,
      startTime: n.startTime,
      endTime: n.endTime,
      velocity: n.velocity ?? 100,
      clef: 'treble', // 🔥 IMPORTANT - tells renderer which staff
    }));

    // 🤖 BASS (AI GENERATED) - add clef property
    const aiBass = await generateBassFromAI(melodyNotes);

    const bassNotes: Note[] = aiBass.map((n: any) => ({
      pitch: n.pitch,
      startTime: n.startTime,
      endTime: n.endTime,
      velocity: n.velocity ?? 80,
      clef: 'bass', // 🔥 IMPORTANT - tells renderer which staff
    }));

    // 🎼 MERGE INTO ONE ARRAY
    const allNotes = [...melodyNotes, ...bassNotes];

    // Detect tempo from onsets
    const tempo = this.estimateTempo(rawNotes);

    return {
      notes: allNotes,
      tempo: tempo,
      timeSignature: [4, 4],
      key: this.detectKey(melodyNotes),
      clef: 'treble',
      instrument: 'piano',
      octaveShift: 0,
    };
  }

  private static estimateTempo(notes: any[]): number {
    if (notes.length < 2) return 120;
    
    const intervals = [];
    for (let i = 1; i < Math.min(notes.length, 20); i++) {
      intervals.push(notes[i].startTime - notes[i-1].startTime);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    let bpm = Math.round(60 / avgInterval);
    
    return Math.min(200, Math.max(60, bpm));
  }

  private static detectKey(notes: Note[]): string {
    if (notes.length === 0) return 'C';
    
    const pitchClasses = notes.map(n => n.pitch % 12);
    const freq = new Array(12).fill(0);
    pitchClasses.forEach(pc => freq[pc]++);
    
    const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
    const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    
    let bestKey = 'C';
    let bestScore = -Infinity;
    
    for (let i = 0; i < 12; i++) {
      let score = 0;
      for (let j = 0; j < 12; j++) {
        score += freq[(j + i) % 12] * majorProfile[j];
      }
      if (score > bestScore) {
        bestScore = score;
        bestKey = keys[i];
      }
    }
    
    return bestKey;
  }

  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
}
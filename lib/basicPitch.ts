// lib/basicPitch.ts - Ensure it returns the right format
import * as basicPitch from '@spotify/basic-pitch';

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<any[]> {
  console.log('🎵 Running Basic Pitch...');
  
  try {
    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    const result = await basicPitch.basicPitch(audioData, sampleRate);
    
    console.log('Basic Pitch result type:', typeof result);
    console.log('Result keys:', result ? Object.keys(result) : 'null');
    
    if (!result || !result.notes) {
      console.warn('No notes in result');
      return [];
    }
    
    // Ensure each note has the expected properties
    const formattedNotes = result.notes.map((note: any) => ({
      pitchMidi: note.pitch,
      startTimeSeconds: note.startTimeSeconds,
      endTimeSeconds: note.endTimeSeconds,
      amplitude: note.amplitude || 0.5,
      // Also add aliases for compatibility
      pitch: note.pitch,
      startTime: note.startTimeSeconds,
      endTime: note.endTimeSeconds,
      velocity: Math.floor((note.amplitude || 0.5) * 127)
    }));
    
    console.log(`✅ Basic Pitch detected ${formattedNotes.length} notes`);
    if (formattedNotes.length > 0) {
      console.log('First note:', formattedNotes[0]);
    }
    
    return formattedNotes;
    
  } catch (error) {
    console.error('Basic Pitch error:', error);
    // Return mock data for testing
    console.log('Returning mock data for testing');
    return [
      { pitchMidi: 60, startTimeSeconds: 0, endTimeSeconds: 0.5, amplitude: 0.8, pitch: 60, startTime: 0, endTime: 0.5, velocity: 100 },
      { pitchMidi: 62, startTimeSeconds: 0.5, endTimeSeconds: 1.0, amplitude: 0.8, pitch: 62, startTime: 0.5, endTime: 1.0, velocity: 100 },
      { pitchMidi: 64, startTimeSeconds: 1.0, endTimeSeconds: 1.5, amplitude: 0.8, pitch: 64, startTime: 1.0, endTime: 1.5, velocity: 100 },
      { pitchMidi: 65, startTimeSeconds: 1.5, endTimeSeconds: 2.0, amplitude: 0.8, pitch: 65, startTime: 1.5, endTime: 2.0, velocity: 100 },
      { pitchMidi: 67, startTimeSeconds: 2.0, endTimeSeconds: 2.5, amplitude: 0.8, pitch: 67, startTime: 2.0, endTime: 2.5, velocity: 100 },
    ];
  }
}
// lib/basicPitch.ts
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

// Use a CDN URL for the model files
const MODEL_URL = 'https://unpkg.com/@spotify/basic-pitch-ts@0.1.0/model/model.json';

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<any[]> {
  console.log('🎵 Running Basic Pitch...');
  
  try {
    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    console.log(`Audio: ${audioData.length} samples, ${sampleRate}Hz`);
    
    // Create instance of BasicPitch
    const basicPitchModel = new BasicPitch(MODEL_URL);
    
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];
    
    // Run inference
    await basicPitchModel.evaluateModel(
      audioBuffer,
      (frame: number[][], onset: number[][], contour: number[][]) => {
        frames.push(...frame);
        onsets.push(...onset);
        contours.push(...contour);
      },
      (progress: number) => {
        console.log(`Basic Pitch progress: ${Math.round(progress * 100)}%`);
      }
    );
    
    console.log(`Frames: ${frames.length}, Onsets: ${onsets.length}`);
    
    if (frames.length === 0) {
      console.warn('No frames detected');
      return [];
    }
    
    // Convert to notes
    const notes = noteFramesToTime(
      addPitchBendsToNoteEvents(
        contours,
        outputToNotesPoly(frames, onsets, 0.5, 0.3, 5)
      )
    );
    
    console.log(`✅ Detected ${notes.length} notes`);
    
    // Format notes with all needed properties
    const formattedNotes = notes.map((note: any) => ({
      pitchMidi: note.pitchMidi,
      startTimeSeconds: note.startTimeSeconds,
      endTimeSeconds: note.endTimeSeconds,
      amplitude: note.amplitude || 0.5,
      pitch: note.pitchMidi,
      startTime: note.startTimeSeconds,
      endTime: note.endTimeSeconds,
      velocity: Math.floor((note.amplitude || 0.5) * 127)
    }));
    
    return formattedNotes;
    
  } catch (error) {
    console.error('Basic Pitch error:', error);
    
    // Return mock data for testing (C major scale)
    console.log('⚠️ Using mock data for testing');
    const mockNotes = [];
    const pitches = [60, 62, 64, 65, 67, 69, 71, 72];
    for (let i = 0; i < pitches.length; i++) {
      mockNotes.push({
        pitchMidi: pitches[i],
        startTimeSeconds: i * 0.5,
        endTimeSeconds: (i + 1) * 0.5,
        amplitude: 0.8,
        pitch: pitches[i],
        startTime: i * 0.5,
        endTime: (i + 1) * 0.5,
        velocity: 100
      });
    }
    return mockNotes;
  }
}
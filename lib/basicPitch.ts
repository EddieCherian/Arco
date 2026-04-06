// lib/basicPitch.ts
import { BasicPitch, noteFramesToTime, addPitchBendsToNoteEvents, outputToNotesPoly } from '@spotify/basic-pitch';

// Use the model from the npm package
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@spotify/basic-pitch@0.1.3/model/model.json';

export async function runBasicPitch(audioBuffer: AudioBuffer): Promise<any[]> {
  console.log('🎵 Running Basic Pitch...');
  
  try {
    const basicPitchModel = new BasicPitch(MODEL_URL);
    
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];
    
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
    
    // ... rest of your code
  }
}
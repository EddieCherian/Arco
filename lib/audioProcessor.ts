import * as basicPitch from '@spotify/basic-pitch';
import { MidiData } from './types';

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    const audioData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    const modelOutput = await basicPitch.predict(audioData, sampleRate);
    
    const notes = [];
    for (const note of modelOutput.notes) {
      notes.push({
        pitch: note.pitch,
        startTime: note.startTimeSeconds,
        endTime: note.endTimeSeconds,
        velocity: note.amplitude * 127
      });
    }
    
    return {
      notes,
      tempo: 120,
      timeSignature: [4, 4],
      key: 'C',
      clef: 'treble',
      instrument: 'piano',
      octaveShift: 0
    };
  }
  
  static async recordAudio(stream: MediaStream): Promise<MediaRecorder> {
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    
    return new Promise((resolve) => {
      mediaRecorder.start();
      resolve(mediaRecorder);
    });
  }
}

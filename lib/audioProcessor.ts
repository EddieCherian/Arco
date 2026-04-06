import { MidiData } from './types';

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Detect onsets (note beginnings) using amplitude threshold
    const onsets = this.detectOnsets(channelData, sampleRate);
    const notes = this.extractNotes(channelData, sampleRate, onsets);
    
    return {
      notes: notes,
      tempo: this.estimateTempo(onsets, sampleRate),
      timeSignature: [4, 4],
      key: 'C',
      clef: 'treble',
      instrument: 'piano',
      octaveShift: 0
    };
  }
  
  private static detectOnsets(audioData: Float32Array, sampleRate: number): number[] {
    const onsets: number[] = [];
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms window
    const threshold = 0.02;
    let lastOnset = -windowSize;
    
    for (let i = 0; i < audioData.length - windowSize; i += windowSize / 2) {
      let sum = 0;
      for (let j = 0; j < windowSize && i + j < audioData.length; j++) {
        sum += Math.abs(audioData[i + j]);
      }
      const avgAmplitude = sum / windowSize;
      
      if (avgAmplitude > threshold && (i - lastOnset) > windowSize) {
        onsets.push(i / sampleRate);
        lastOnset = i;
      }
    }
    
    return onsets;
  }
  
  private static extractNotes(audioData: Float32Array, sampleRate: number, onsets: number[]): Array<{pitch: number, startTime: number, endTime: number, velocity: number}> {
    const notes = [];
    
    for (let i = 0; i < onsets.length - 1; i++) {
      const startTime = onsets[i];
      const endTime = onsets[i + 1];
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      
      // Extract segment for this note
      const segment = audioData.slice(startSample, Math.min(endSample, audioData.length));
      
      if (segment.length < sampleRate * 0.05) continue; // Skip too short segments
      
      // Estimate pitch using autocorrelation
      const pitch = this.estimatePitch(segment, sampleRate);
      
      // Calculate velocity (amplitude)
      let maxAmp = 0;
      for (let j = 0; j < segment.length; j++) {
        maxAmp = Math.max(maxAmp, Math.abs(segment[j]));
      }
      const velocity = Math.min(127, Math.floor(maxAmp * 127 * 10));
      
      if (pitch > 60 && pitch < 2000) { // Filter valid pitch range (E2 to C6)
        const midiNote = Math.round(this.frequencyToMidi(pitch));
        if (midiNote >= 40 && midiNote <= 96) { // Piano range
          notes.push({
            pitch: midiNote,
            startTime: startTime,
            endTime: endTime,
            velocity: Math.max(20, velocity)
          });
        }
      }
    }
    
    return notes;
  }
  
  static estimatePitch(audioSegment: Float32Array, sampleRate: number): number {
    // Autocorrelation method for pitch detection
    const minSamples = Math.floor(sampleRate / 1000); // 1000Hz max
    const maxSamples = Math.floor(sampleRate / 80); // 80Hz min
    
    let bestOffset = -1;
    let bestCorrelation = 0;
    
    for (let offset = minSamples; offset < maxSamples && offset < audioSegment.length / 2; offset++) {
      let correlation = 0;
      let sum1 = 0, sum2 = 0;
      
      for (let i = 0; i < audioSegment.length - offset; i++) {
        correlation += audioSegment[i] * audioSegment[i + offset];
        sum1 += audioSegment[i] * audioSegment[i];
        sum2 += audioSegment[i + offset] * audioSegment[i + offset];
      }
      
      const normalizedCorrelation = correlation / (Math.sqrt(sum1 * sum2) + 0.0001);
      
      if (normalizedCorrelation > bestCorrelation && normalizedCorrelation > 0.3) {
        bestCorrelation = normalizedCorrelation;
        bestOffset = offset;
      }
    }
    
    if (bestOffset > 0) {
      return sampleRate / bestOffset;
    }
    
    return 440; // Default to A4
  }
  
  private static frequencyToMidi(frequency: number): number {
    return 69 + 12 * Math.log2(frequency / 440);
  }
  
  public static estimateTempo(onsets: number[], sampleRate: number): number {
    if (onsets.length < 2) return 120;
    
    const intervals = [];
    for (let i = 1; i < Math.min(onsets.length, 10); i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    let bpm = Math.round(60 / avgInterval);
    
    // Clamp to reasonable tempo range
    bpm = Math.min(200, Math.max(60, bpm));
    
    return bpm;
  }
  
  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
}

// Hum mode - optimized for single melody line
export class HumModeProcessor extends AudioProcessor {
  static async transcribeHumming(audioBuffer: AudioBuffer): Promise<MidiData> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // More sensitive onset detection for humming
    const onsets = this.detectOnsetsHumming(channelData, sampleRate);
    const notes = this.extractNotesHumming(channelData, sampleRate, onsets);
    
    return {
      notes: notes,
      tempo: this.estimateTempo(onsets, sampleRate),
      timeSignature: [4, 4],
      key: this.detectKey(notes),
      clef: 'treble',
      instrument: 'soprano',
      octaveShift: 0
    };
  }
  
  private static detectOnsetsHumming(audioData: Float32Array, sampleRate: number): number[] {
    const onsets: number[] = [];
    const windowSize = Math.floor(sampleRate * 0.03); // 30ms window for faster detection
    const threshold = 0.01; // Lower threshold for humming
    let lastOnset = -windowSize;
    
    for (let i = 0; i < audioData.length - windowSize; i += windowSize / 3) {
      let sum = 0;
      for (let j = 0; j < windowSize && i + j < audioData.length; j++) {
        sum += Math.abs(audioData[i + j]);
      }
      const avgAmplitude = sum / windowSize;
      
      if (avgAmplitude > threshold && (i - lastOnset) > windowSize / 2) {
        onsets.push(i / sampleRate);
        lastOnset = i;
      }
    }
    
    return onsets;
  }
  
  private static extractNotesHumming(audioData: Float32Array, sampleRate: number, onsets: number[]): Array<{pitch: number, startTime: number, endTime: number, velocity: number}> {
    const notes = [];
    
    for (let i = 0; i < onsets.length; i++) {
      const startTime = onsets[i];
      const endTime = i < onsets.length - 1 ? onsets[i + 1] : startTime + 1;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      
      const segment = audioData.slice(startSample, Math.min(endSample, audioData.length));
      
      if (segment.length < sampleRate * 0.1) continue;
      
      // Use multiple windows for more accurate pitch detection
      const pitches = [];
      const windowStep = Math.floor(segment.length / 5);
      for (let w = 0; w < 5; w++) {
        const start = w * windowStep;
        const end = Math.min(start + windowStep, segment.length);
        const windowSegment = segment.slice(start, end);
        if (windowSegment.length > sampleRate * 0.02) {
          const pitch = this.estimatePitch(windowSegment, sampleRate);
          if (pitch > 100 && pitch < 1000) {
            pitches.push(pitch);
          }
        }
      }
      
      if (pitches.length > 0) {
        const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length;
        const midiNote = Math.round(this.frequencyToMidi(avgPitch));
        
        if (midiNote >= 55 && midiNote <= 84) { // Voice range (A3 to C6)
          notes.push({
            pitch: midiNote,
            startTime: startTime,
            endTime: endTime,
            velocity: 80 // Default velocity for humming
          });
        }
      }
    }
    
    return notes;
  }
  
  private static detectKey(notes: Array<{pitch: number}>): string {
    if (notes.length === 0) return 'C';
    
    const majorKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    const pitchClasses = notes.map(n => n.pitch % 12);
    const freq = new Array(12).fill(0);
    pitchClasses.forEach(pc => freq[pc]++);
    
    const maxFreq = Math.max(...freq);
    const tonic = freq.indexOf(maxFreq);
    
    return majorKeys[tonic];
  }
}
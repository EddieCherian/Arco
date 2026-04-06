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
      const segment = audioData.slice(startSample, endSample);
      
      // Estimate pitch using autocorrelation
      const pitch = this.estimatePitch(segment, sampleRate);
      
      // Calculate velocity (amplitude)
      let maxAmp = 0;
      for (let j = 0; j < segment.length; j++) {
        maxAmp = Math.max(maxAmp, Math.abs(segment[j]));
      }
      const velocity = Math.min(127, Math.floor(maxAmp * 127 * 10));
      
      if (pitch > 20 && pitch < 5000) { // Filter valid pitch range
        const midiNote = this.frequencyToMidi(pitch);
        if (midiNote >= 21 && midiNote <= 108) { // Piano range
          notes.push({
            pitch: midiNote,
            startTime: startTime,
            endTime: endTime,
            velocity: velocity
          });
        }
      }
    }
    
    return notes;
  }
  
  private static estimatePitch(audioSegment: Float32Array, sampleRate: number): number {
    // Autocorrelation method for pitch detection
    const minSamples = Math.floor(sampleRate / 2000); // 2000Hz max
    const maxSamples = Math.floor(sampleRate / 50); // 50Hz min
    
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
      
      if (normalizedCorrelation > bestCorrelation) {
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
  
  private static estimateTempo(onsets: number[], sampleRate: number): number {
    if (onsets.length < 2) return 120;
    
    const intervals = [];
    for (let i = 1; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60 / avgInterval);
    
    return Math.min(240, Math.max(40, bpm));
  }
  
  static async recordAudio(stream: MediaStream): Promise<MediaRecorder> {
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    return new Promise((resolve) => {
      mediaRecorder.start(100);
      resolve(mediaRecorder);
    });
  }
  
  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
}
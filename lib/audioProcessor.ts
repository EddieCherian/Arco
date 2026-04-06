import { MidiData } from './types';

export class AudioProcessor {
  static async transcribeAudio(audioBuffer: AudioBuffer): Promise<MidiData> {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Improved onset detection
    const onsets = this.detectOnsetsImproved(channelData, sampleRate);
    const notes = this.extractNotesImproved(channelData, sampleRate, onsets);
    
    // Quantize notes to musical grid
    const quantizedNotes = this.quantizeNotes(notes, 0.125); // 1/8th note quantization
    
    // Detect key and adjust
    const key = this.detectKey(quantizedNotes);
    const tempo = this.estimateTempoImproved(onsets, sampleRate);
    
    return {
      notes: quantizedNotes,
      tempo: Math.max(60, Math.min(200, tempo)),
      timeSignature: [4, 4],
      key: key,
      clef: 'treble',
      instrument: 'piano',
      octaveShift: 0
    };
  }
  
  private static detectOnsetsImproved(audioData: Float32Array, sampleRate: number): number[] {
    const onsets: number[] = [];
    const hopSize = Math.floor(sampleRate * 0.01); // 10ms hops
    const windowSize = Math.floor(sampleRate * 0.05); // 50ms window
    
    // Calculate spectral flux
    let prevEnergy = 0;
    
    for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
      let energy = 0;
      for (let j = 0; j < windowSize; j++) {
        energy += Math.abs(audioData[i + j]);
      }
      energy /= windowSize;
      
      const flux = Math.max(0, energy - prevEnergy);
      
      if (flux > 0.015 && (onsets.length === 0 || (i / sampleRate - onsets[onsets.length - 1]) > 0.1)) {
        onsets.push(i / sampleRate);
      }
      
      prevEnergy = energy;
    }
    
    return onsets;
  }
  
  private static extractNotesImproved(audioData: Float32Array, sampleRate: number, onsets: number[]): Array<{pitch: number, startTime: number, endTime: number, velocity: number}> {
    const notes = [];
    
    for (let i = 0; i < onsets.length; i++) {
      const startTime = onsets[i];
      const endTime = i < onsets.length - 1 ? onsets[i + 1] : startTime + 0.5;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.min(Math.floor(endTime * sampleRate), audioData.length);
      
      const segment = audioData.slice(startSample, endSample);
      if (segment.length < sampleRate * 0.05) continue;
      
      // YIN algorithm for pitch detection
      const pitch = this.yinPitchDetection(segment, sampleRate);
      
      if (pitch > 80 && pitch < 2000) {
        const midiNote = Math.round(69 + 12 * Math.log2(pitch / 440));
        if (midiNote >= 40 && midiNote <= 96) {
          // Calculate velocity (loudness)
          let maxAmp = 0;
          for (let j = 0; j < segment.length; j++) {
            maxAmp = Math.max(maxAmp, Math.abs(segment[j]));
          }
          const velocity = Math.min(127, Math.floor(maxAmp * 127 * 8));
          
          notes.push({
            pitch: midiNote,
            startTime: startTime,
            endTime: endTime,
            velocity: Math.max(40, velocity)
          });
        }
      }
    }
    
    return notes;
  }
  
  private static yinPitchDetection(buffer: Float32Array, sampleRate: number): number {
    const threshold = 0.1;
    const bufferSize = buffer.length;
    let yinBuffer = new Float32Array(Math.floor(bufferSize / 2));
    
    // Difference function
    for (let tau = 0; tau < yinBuffer.length; tau++) {
      yinBuffer[tau] = 0;
      for (let i = 0; i < yinBuffer.length; i++) {
        const delta = buffer[i] - buffer[i + tau];
        yinBuffer[tau] += delta * delta;
      }
    }
    
    // Cumulative mean normalization
    let runningSum = 0;
    yinBuffer[0] = 1;
    for (let tau = 1; tau < yinBuffer.length; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] = yinBuffer[tau] * tau / runningSum;
    }
    
    // Find smallest dip below threshold
    let tau = 2;
    while (tau < yinBuffer.length) {
      if (yinBuffer[tau] < threshold) {
        while (tau + 1 < yinBuffer.length && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        return sampleRate / tau;
      }
      tau++;
    }
    
    return 440; // Default to A4
  }
  
  private static quantizeNotes(notes: Array<{pitch: number, startTime: number, endTime: number, velocity: number}>, quantizationStep: number): Array<{pitch: number, startTime: number, endTime: number, velocity: number}> {
    return notes.map(note => ({
      ...note,
      startTime: Math.round(note.startTime / quantizationStep) * quantizationStep,
      endTime: Math.round(note.endTime / quantizationStep) * quantizationStep
    }));
  }
  
  private static detectKey(notes: Array<{pitch: number}>): string {
    if (notes.length === 0) return 'C';
    
    const pitchClasses = notes.map(n => n.pitch % 12);
    const freq = new Array(12).fill(0);
    pitchClasses.forEach(pc => freq[pc]++);
    
    const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
    const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
    
    let bestKey = 'C';
    let bestScore = -Infinity;
    const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
    const minors = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];
    
    for (let i = 0; i < 12; i++) {
      let majorScore = 0;
      let minorScore = 0;
      for (let j = 0; j < 12; j++) {
        majorScore += freq[(j + i) % 12] * majorProfile[j];
        minorScore += freq[(j + i) % 12] * minorProfile[j];
      }
      if (majorScore > bestScore) {
        bestScore = majorScore;
        bestKey = keys[i];
      }
      if (minorScore > bestScore) {
        bestScore = minorScore;
        bestKey = minors[i];
      }
    }
    
    return bestKey;
  }
  
  private static estimateTempoImproved(onsets: number[], sampleRate: number): number {
    if (onsets.length < 4) return 120;
    
    const intervals = [];
    for (let i = 4; i < onsets.length; i++) {
      intervals.push(onsets[i] - onsets[i - 1]);
    }
    
    intervals.sort((a, b) => a - b);
    const medianInterval = intervals[Math.floor(intervals.length / 2)];
    let bpm = Math.round(60 / medianInterval);
    
    // Find most common BPM
    const bpmCount: Record<number, number> = {};
    intervals.forEach(interval => {
      const candidateBpm = Math.round(60 / interval);
      bpmCount[candidateBpm] = (bpmCount[candidateBpm] || 0) + 1;
    });
    
    let maxCount = 0;
    for (const [candidate, count] of Object.entries(bpmCount)) {
      if (count > maxCount) {
        maxCount = count;
        bpm = parseInt(candidate);
      }
    }
    
    return Math.min(200, Math.max(60, bpm));
  }
  
  static async blobToAudioBuffer(blob: Blob): Promise<AudioBuffer> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    return await audioContext.decodeAudioData(arrayBuffer);
  }
}
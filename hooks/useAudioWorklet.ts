'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AudioWorkletNodeWithPort extends AudioWorkletNode {
  port: MessagePort;
}

export function useAudioWorklet() {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNodeWithPort | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'audioWorklet' in AudioContext.prototype;
      setIsSupported(supported);
      
      if (supported) {
        await initializeWorklet();
      }
    };
    
    checkSupport();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeWorklet = async () => {
    if (audioContextRef.current) return;
    
    try {
      audioContextRef.current = new AudioContext();
      
      await audioContextRef.current.audioWorklet.addModule(`
        class AudioProcessor extends AudioWorkletProcessor {
          constructor() {
            super();
            this.bufferSize = 2048;
            this.buffer = new Float32Array(this.bufferSize);
            this.bufferIndex = 0;
            
            this.port.onmessage = (event) => {
              if (event.data.command === 'clear') {
                this.bufferIndex = 0;
                this.buffer.fill(0);
              }
            };
          }
          
          process(inputs, outputs, parameters) {
            const input = inputs[0];
            if (input && input.length > 0) {
              const channelData = input[0];
              
              for (let i = 0; i < channelData.length; i++) {
                this.buffer[this.bufferIndex] = channelData[i];
                this.bufferIndex++;
                
                if (this.bufferIndex >= this.bufferSize) {
                  this.port.postMessage({
                    type: 'audio-data',
                    data: this.buffer.slice(),
                    timestamp: currentTime
                  });
                  this.bufferIndex = 0;
                }
              }
            }
            
            return true;
          }
        }
        
        registerProcessor('audio-processor', AudioProcessor);
      `);
      
      workletNodeRef.current = new AudioWorkletNode(
        audioContextRef.current,
        'audio-processor'
      ) as AudioWorkletNodeWithPort;
      
      workletNodeRef.current.port.onmessage = (event) => {
        if (event.data.type === 'audio-data') {
          onAudioDataReceived(event.data.data);
        }
      };
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize audio worklet:', error);
    }
  };

  const onAudioDataReceived = (audioData: Float32Array) => {
    const event = new CustomEvent('audioWorkletData', {
      detail: { data: audioData, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  };

  const startProcessing = async (stream: MediaStream) => {
    if (!audioContextRef.current || !workletNodeRef.current) {
      await initializeWorklet();
    }
    
    if (sourceNodeRef.current) {
      stopProcessing();
    }
    
    if (audioContextRef.current && workletNodeRef.current && stream) {
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceNodeRef.current.connect(workletNodeRef.current);
      workletNodeRef.current.connect(audioContextRef.current.destination);
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    }
  };

  const stopProcessing = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    if (workletNodeRef.current) {
      workletNodeRef.current.port.postMessage({ command: 'clear' });
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.suspend();
    }
  };

  const cleanup = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const getAmplitude = useCallback((): number => {
    if (!isInitialized) return 0;
    
    let maxAmplitude = 0;
    const checkAmplitude = () => {
      const event = new CustomEvent('requestAmplitude');
      window.dispatchEvent(event);
    };
    
    checkAmplitude();
    return maxAmplitude;
  }, [isInitialized]);

  const setWorkletParameter = (parameterName: string, value: number) => {
    if (workletNodeRef.current && workletNodeRef.current.parameters) {
      const param = workletNodeRef.current.parameters.get(parameterName);
      if (param) {
        param.setValueAtTime(value, audioContextRef.current!.currentTime);
      }
    }
  };

  const visualizeFrequency = useCallback(() => {
    if (!isInitialized || !audioContextRef.current) return null;
    
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    if (sourceNodeRef.current) {
      sourceNodeRef.current.connect(analyser);
    }
    
    const getFrequencyData = () => {
      analyser.getByteFrequencyData(dataArray);
      return Array.from(dataArray);
    };
    
    return { getFrequencyData, bufferLength };
  }, [isInitialized]);

  return {
    isSupported,
    isInitialized,
    startProcessing,
    stopProcessing,
    cleanup,
    getAmplitude,
    setWorkletParameter,
    visualizeFrequency,
    audioContext: audioContextRef.current
  };
}

// Custom hook for real-time audio visualization
export function useRealTimeAudioVisualization() {
  const [amplitudes, setAmplitudes] = useState<number[]>(Array(50).fill(0));
  const [frequencies, setFrequencies] = useState<number[]>(Array(128).fill(0));
  const { isSupported, visualizeFrequency, getAmplitude } = useAudioWorklet();

  useEffect(() => {
    if (!isSupported) return;

    const interval = setInterval(() => {
      const amp = getAmplitude();
      setAmplitudes(prev => [...prev.slice(1), amp * 100]);
      
      const freqVisualizer = visualizeFrequency();
      if (freqVisualizer) {
        const freqData = freqVisualizer.getFrequencyData();
        setFrequencies(freqData);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isSupported, getAmplitude, visualizeFrequency]);

  return {
    amplitudes,
    frequencies,
    isSupported,
    maxAmplitude: Math.max(...amplitudes),
    averageAmplitude: amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length
  };
}

// Hook for audio recording with worklet processing
export function useAudioRecordingWithWorklet() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Float32Array[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { startProcessing, stopProcessing, isInitialized } = useAudioWorklet();

  useEffect(() => {
    const handleAudioData = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.data && isRecording) {
        setAudioChunks(prev => [...prev, customEvent.detail.data]);
      }
    };

    window.addEventListener('audioWorkletData', handleAudioData);
    return () => window.removeEventListener('audioWorkletData', handleAudioData);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      await startProcessing(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // Handle blob data for export
          console.log('Audio chunk available:', event.data.size);
        }
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
      setAudioChunks([]);
    } catch (error) {
      console.error('Failed to start recording with worklet:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      stopProcessing();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
    }
  };

  const getAudioBuffer = (): Float32Array => {
    const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const buffer = new Float32Array(totalLength);
    let offset = 0;
    
    for (const chunk of audioChunks) {
      buffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    return buffer;
  };

  return {
    isRecording,
    isInitialized,
    startRecording,
    stopRecording,
    audioChunks,
    getAudioBuffer,
    chunkCount: audioChunks.length
  };
}

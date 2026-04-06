'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Upload, Loader2 } from 'lucide-react';
import { AudioProcessor } from '@/lib/audioProcessor';
import { WaveformVisualizer } from './WaveformVisualizer';

interface AudioRecorderProps {
  onTranscriptionComplete: (midiData: any) => void;
}

export function AudioRecorder({ onTranscriptionComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        await processAudio(blob);
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        setError('Error stopping recording');
      }
    }
  };
  
  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    try {
      const audioBuffer = await AudioProcessor.blobToAudioBuffer(blob);
      const midiData = await AudioProcessor.transcribeAudio(audioBuffer);
      onTranscriptionComplete(midiData);
    } catch (error) {
      console.error('Transcription failed:', error);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const audioBuffer = await AudioProcessor.blobToAudioBuffer(file);
      const midiData = await AudioProcessor.transcribeAudio(audioBuffer);
      onTranscriptionComplete(midiData);
    } catch (error) {
      console.error('File processing failed:', error);
      setError('Failed to process audio file. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20">
      <h3 className="text-lg font-semibold mb-4 text-[#C9A84C]">Audio Input</h3>
      
      <div className="space-y-4">
        <div className="flex gap-3">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-[#05080F] rounded-lg hover:bg-[#b8943a] transition-colors"
            >
              <Mic size={18} />
              Record
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Square size={18} />
              Stop Recording
            </button>
          )}
          
          <label className="flex items-center gap-2 px-4 py-2 bg-[#1a2030] text-[#EEF2FF] rounded-lg cursor-pointer hover:bg-[#202838] transition-colors">
            <Upload size={18} />
            Upload File
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {audioBlob && !isProcessing && <WaveformVisualizer audioBlob={audioBlob} />}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-[#C9A84C]">
            <Loader2 className="animate-spin" size={18} />
            <span>Transcribing audio...</span>
          </div>
        )}
      </div>
    </div>
  );
}
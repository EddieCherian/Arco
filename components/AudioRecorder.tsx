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
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => { 
        if (e.data.size > 0) chunksRef.current.push(e.data); 
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        await processAudio(blob);
      };
      
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error(err);
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
      } catch (err) {
        setError('Error stopping recording');
        console.error(err);
      }
    }
  };
  
  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    setError(null);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      audioContextRef.current = new AudioContext();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const midiData = await AudioProcessor.transcribeAudio(audioBuffer);
      
      if (midiData.notes.length === 0) {
        setError('No notes detected. Please try recording a clearer melody.');
      } else {
        onTranscriptionComplete(midiData);
      }
    } catch (err) {
      console.error('Transcription failed:', err);
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      audioContextRef.current = new AudioContext();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      const midiData = await AudioProcessor.transcribeAudio(audioBuffer);
      
      if (midiData.notes.length === 0) {
        setError('No notes detected in file. Please try a different audio file.');
      } else {
        onTranscriptionComplete(midiData);
      }
    } catch (err) {
      console.error('File processing failed:', err);
      setError('Failed to process audio file. Please try a different file.');
    } finally {
      setIsProcessing(false);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-[#0A0F1A] to-[#05080F] rounded-2xl border border-[#C9A84C]/20 p-6">
      <div className="flex gap-3 flex-wrap">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] text-[#05080F] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#C9A84C]/25 transition-all duration-300"
          >
            <Mic size={18} />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl font-semibold hover:bg-red-500/30 transition-all duration-300"
          >
            <Square size={18} />
            Stop Recording
          </button>
        )}
        
        <label className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 font-semibold cursor-pointer hover:bg-white/10 hover:border-[#C9A84C]/30 transition-all duration-300">
          <Upload size={18} />
          Upload Audio
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}
      
      {isProcessing && (
        <div className="mt-4 flex items-center gap-2 text-[#C9A84C]">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm">Transcribing audio with AI...</span>
        </div>
      )}
      
      {audioBlob && !isProcessing && (
        <div className="mt-4">
          <WaveformVisualizer audioBlob={audioBlob} />
        </div>
      )}
    </div>
  );
}
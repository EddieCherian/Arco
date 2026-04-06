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
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        await processAudio(blob);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch {
      setError('Mic access denied. Enable permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        streamRef.current?.getTracks().forEach(t => t.stop());
      } catch {
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
    } catch {
      setError('Transcription failed');
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
    } catch {
      setError('File failed to process');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#0f172a] border border-white/10 rounded-2xl p-5 shadow-lg">
      
      <div className="flex gap-3 mb-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-medium"
          >
            <Mic size={18} /> Record
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition font-medium"
          >
            <Square size={18} /> Stop
          </button>
        )}

        <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition">
          <Upload size={18} />
          Upload
          <input type="file" accept="audio/*" onChange={handleFileUpload} hidden />
        </label>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-3">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-white/70 mb-3">
          <Loader2 className="animate-spin" size={16} />
          Processing audio...
        </div>
      )}

      {audioBlob && !isProcessing && (
        <div className="mt-4 bg-black/30 rounded-xl p-3">
          <WaveformVisualizer audioBlob={audioBlob} />
        </div>
      )}
    </div>
  );
}
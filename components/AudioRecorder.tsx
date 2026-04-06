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
      setError('Could not access microphone. Please check permissions.');
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
    } catch {
      setError('Failed to process audio file. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const css = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&family=Crimson+Pro:ital,wght@0,300;1,300&display=swap');
  .recorder { background: #07090E; border: 1px solid #C9A84C18; position: relative; padding: 28px; }`;

  return (
    <>
      <style>{css}</style>

      <div className="recorder">
        <div className="recorder-row">
          {!isRecording ? (
            <button className="rec-btn-record" onClick={startRecording}>
              <Mic size={13} /> Record
            </button>
          ) : (
            <button className="rec-btn-stop" onClick={stopRecording}>
              <Square size={10} /><span className="stop-label">Stop</span>
            </button>
          )}

          <label className="rec-btn-upload">
            <Upload size={13} /> Upload File
            <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {error && <div className="rec-error">{error}</div>}

        {isProcessing && (
          <div className="rec-processing">
            <Loader2 size={13} className="spin" /> Transcribing audio...
          </div>
        )}

        {audioBlob && !isProcessing && (
          <div className="rec-waveform">
            <WaveformVisualizer audioBlob={audioBlob} />
          </div>
        )}
      </div>
    </>
  );
}
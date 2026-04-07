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
  const [processingStep, setProcessingStep] = useState('');
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
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        await processAudio(blob);
      };
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
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
      setProcessingStep('Analyzing audio...');
      const arrayBuffer = await blob.arrayBuffer();
      audioContextRef.current = new AudioContext();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      setProcessingStep('Detecting melody...');
      const midiData = await AudioProcessor.transcribeAudio(audioBuffer);

      if (midiData.notes.length === 0) {
        setError('No notes detected. Try recording a clearer melody.');
      } else {
        onTranscriptionComplete(midiData);
      }
    } catch (err) {
      setError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      audioContextRef.current?.close();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    try {
      setProcessingStep('Reading file...');
      const arrayBuffer = await file.arrayBuffer();
      audioContextRef.current = new AudioContext();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      setProcessingStep('Detecting melody...');
      const midiData = await AudioProcessor.transcribeAudio(audioBuffer);

      if (midiData.notes.length === 0) {
        setError('No notes detected. Try a different audio file.');
      } else {
        onTranscriptionComplete(midiData);
      }
    } catch {
      setError('Failed to process file. Please try a different audio file.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      audioContextRef.current?.close();
    }
  };

  const css = `
    .rec-wrap { position: relative; }
    .rec-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .rec-btn { display: flex; align-items: center; gap: 8px; padding: 12px 28px; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; transition: background 0.2s, transform 0.1s; position: relative; }
    .rec-btn:active { transform: scale(0.98); }
    .rec-btn-record { background: #C9A84C; color: #05080F; }
    .rec-btn-record:hover { background: #E8C96A; }
    .rec-btn-stop { background: transparent; color: #ff6666; border: 1px solid #ff444430; padding-left: 36px; }
    .rec-btn-stop:hover { background: #ff444408; }
    .rec-pulse { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 7px; height: 7px; background: #ff6666; border-radius: 50%; animation: recpulse 1s ease-in-out infinite; }
    @keyframes recpulse { 0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); } 50% { opacity: 0.4; transform: translateY(-50%) scale(0.7); } }
    .rec-btn-upload { background: transparent; color: #EEF2FF44; border: 1px solid #C9A84C18; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; padding: 12px 28px; display: flex; align-items: center; gap: 8px; transition: border-color 0.2s, color 0.2s, background 0.2s; }
    .rec-btn-upload:hover { border-color: #C9A84C44; color: #EEF2FF99; background: #C9A84C06; }
    .rec-processing { display: flex; align-items: center; gap: 12px; margin-top: 20px; padding: 14px 18px; border: 1px solid #C9A84C15; background: #C9A84C06; }
    .rec-processing-text { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #C9A84C; opacity: 0.8; }
    .rec-processing-bar { flex: 1; height: 1px; background: #C9A84C15; position: relative; overflow: hidden; }
    .rec-processing-fill { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, #C9A84C, transparent); animation: recbar 1.5s ease-in-out infinite; }
    @keyframes recbar { from { left: -100%; } to { left: 100%; } }
    .rec-error { margin-top: 16px; padding: 12px 16px; border: 1px solid #ff444430; background: #ff444406; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: #ff6666; }
    .rec-waveform { margin-top: 20px; border-top: 1px solid #C9A84C10; padding-top: 20px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="rec-wrap">
        <div className="rec-row">
          {!isRecording ? (
            <button className="rec-btn rec-btn-record" onClick={startRecording} disabled={isProcessing}>
              <Mic size={13} /> Record
            </button>
          ) : (
            <button className="rec-btn rec-btn-stop" onClick={stopRecording}>
              <span className="rec-pulse" />
              Stop
            </button>
          )}
          <label className="rec-btn-upload">
            <Upload size={13} /> Upload Audio
            <input type="file" accept="audio/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>

        {isProcessing && (
          <div className="rec-processing">
            <Loader2 size={12} className="spin" color="#C9A84C" />
            <span className="rec-processing-text">{processingStep}</span>
            <div className="rec-processing-bar">
              <div className="rec-processing-fill" />
            </div>
          </div>
        )}

        {error && <div className="rec-error">{error}</div>}

        {audioBlob && !isProcessing && (
          <div className="rec-waveform">
            <WaveformVisualizer audioBlob={audioBlob} />
          </div>
        )}
      </div>
    </>
  );
}

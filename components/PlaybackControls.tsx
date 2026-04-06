'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Repeat, Volume2 } from 'lucide-react';
import { MidiData } from '@/lib/types';

interface PlaybackControlsProps {
  midiData: MidiData;
  onPlaybackStart?: () => void;
  onPlaybackStop?: () => void;
  onCurrentNoteChange?: (noteIndex: number) => void;
}

export function PlaybackControls({ 
  midiData, 
  onPlaybackStart, 
  onPlaybackStop,
  onCurrentNoteChange 
}: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentNoteIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const scheduledTimesRef = useRef<number[]>([]);
  
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  const stopPlayback = () => {
    if (audioContextRef.current) {
      // Cancel all scheduled sounds
      scheduledTimesRef.current.forEach(time => {
        // Can't easily cancel scheduled events, so we just stop the context
      });
      audioContextRef.current.close();
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    setIsPlaying(false);
    isPlayingRef.current = false;
    currentNoteIndexRef.current = 0;
    if (onPlaybackStop) onPlaybackStop();
  };
  
  const playNote = (pitch: number, startTime: number, duration: number, velocity: number) => {
    if (!audioContextRef.current || !isPlayingRef.current) return;
    
    const now = audioContextRef.current.currentTime;
    const scheduleTime = Math.max(now, startTime / speed);
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = velocity / 127 * volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start(scheduleTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, scheduleTime + duration);
    oscillator.stop(scheduleTime + duration);
  };
  
  const scheduleNotes = () => {
    if (!audioContextRef.current) return;
    
    let currentTime = audioContextRef.current.currentTime;
    
    for (let i = 0; i < midiData.notes.length; i++) {
      const note = midiData.notes[i];
      const duration = (note.endTime - note.startTime) / speed;
      
      setTimeout(() => {
        if (isPlayingRef.current) {
          playNote(note.pitch, performance.now() / 1000, duration, note.velocity);
          if (onCurrentNoteChange) {
            onCurrentNoteChange(i);
          }
        }
      }, currentTime * 1000);
      
      currentTime += duration;
    }
    
    // Schedule loop
    if (isLooping) {
      setTimeout(() => {
        if (isPlayingRef.current && isLooping) {
          scheduleNotes();
        }
      }, currentTime * 1000);
    }
  };
  
  const startPlayback = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    await audioContextRef.current.resume();
    isPlayingRef.current = true;
    currentNoteIndexRef.current = 0;
    
    scheduleNotes();
    setIsPlaying(true);
    if (onPlaybackStart) onPlaybackStart();
  };
  
  const pausePlayback = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
  };
  
  return (
    <div className="bg-[#0a0f1a] rounded-lg p-4 border border-[#C9A84C]/20">
      <div className="flex items-center gap-3">
        <button
          onClick={startPlayback}
          disabled={isPlaying}
          className="p-2 rounded-full bg-[#C9A84C] text-[#05080F] hover:bg-[#b8943a] transition-colors disabled:opacity-50"
        >
          <Play size={20} />
        </button>
        
        <button
          onClick={pausePlayback}
          disabled={!isPlaying}
          className="p-2 rounded-full bg-[#1a2030] text-[#EEF2FF] hover:bg-[#202838] transition-colors disabled:opacity-50"
        >
          <Pause size={20} />
        </button>
        
        <button
          onClick={stopPlayback}
          className="p-2 rounded-full bg-[#1a2030] text-[#EEF2FF] hover:bg-[#202838] transition-colors"
        >
          <Square size={20} />
        </button>
        
        <button
          onClick={() => setIsLooping(!isLooping)}
          className={`p-2 rounded-full transition-colors ${
            isLooping ? 'bg-[#C9A84C] text-[#05080F]' : 'bg-[#1a2030] text-[#EEF2FF]'
          }`}
        >
          <Repeat size={20} />
        </button>
        
        <div className="flex items-center gap-2 ml-4">
          <Volume2 size={16} className="text-[#EEF2FF]/60" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24"
          />
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <span className="text-sm text-[#EEF2FF]/60">Speed:</span>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.01"
            value={speed}
            onChange={(e) => {
              setSpeed(parseFloat(e.target.value));
            }}
            className="w-24"
          />
          <span className="text-sm text-[#C9A84C]">{Math.round(speed * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
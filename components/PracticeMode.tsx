'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Target } from 'lucide-react';
import { SheetMusicRenderer } from './SheetMusicRenderer';
import { MidiData } from '@/lib/types';

interface PracticeModeProps {
  midiData: MidiData;
}

export function PracticeMode({ midiData }: PracticeModeProps) {
  const [isActive, setIsActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1);
  const [speed, setSpeed] = useState(0.7);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isPlayingRef = useRef(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isActive) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      return () => {
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        timeoutsRef.current.forEach(clearTimeout);
      };
    }
  }, [isActive]);

  const stopPractice = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentNoteIndex(-1);
  };
  
  const playNote = (pitch: number, startTime: number, duration: number, velocity: number, index: number) => {
    if (!audioContextRef.current || !isPlayingRef.current) return;
    
    const now = audioContextRef.current.currentTime;
    const scheduleTime = Math.max(now, startTime / speed);
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    const frequency = 440 * Math.pow(2, (pitch - 69) / 12);
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = velocity / 127 * 0.5;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.start(scheduleTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, scheduleTime + duration);
    oscillator.stop(scheduleTime + duration);
    
    setCurrentNoteIndex(index);
  };
  
  const schedulePracticeNotes = () => {
    if (!audioContextRef.current) return;
    
    let currentTime = 0;
    
    for (let i = 0; i < midiData.notes.length; i++) {
      const note = midiData.notes[i];
      const duration = (note.endTime - note.startTime) / speed;
      
      const timeout = setTimeout(() => {
        if (isPlayingRef.current) {
          playNote(note.pitch, performance.now() / 1000, duration, note.velocity, i);
        }
      }, currentTime * 1000);
      
      timeoutsRef.current.push(timeout);
      currentTime += duration;
    }
  };
  
  const startPractice = async () => {
    if (!isActive) {
      setIsActive(true);
      return;
    }
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    await audioContextRef.current.resume();
    isPlayingRef.current = true;
    schedulePracticeNotes();
    setIsPlaying(true);
  };
  
  const pausePractice = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
  };

  if (!isActive) {
    return (
      <button
        onClick={startPractice}
        className="w-full bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20 hover:border-[#C9A84C] transition-all group"
      >
        <Target size={24} className="text-[#C9A84C] mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-center text-[#C9A84C]">Practice Mode</h3>
        <p className="text-sm text-[#EEF2FF]/60 text-center mt-2">
          Follow along with highlighted notes
        </p>
      </button>
    );
  }

  return (
    <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#C9A84C]">Practice Mode</h3>
        <button
          onClick={() => {
            setIsActive(false);
            stopPractice();
          }}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Exit
        </button>
      </div>
      
      <div className="mb-4">
        <SheetMusicRenderer midiData={midiData} currentNoteIndex={currentNoteIndex} />
      </div>
      
      <div className="flex items-center justify-center gap-3 mb-4">
        <button
          onClick={startPractice}
          disabled={isPlaying}
          className="p-2 rounded-full bg-[#C9A84C] text-[#05080F] hover:bg-[#b8943a] transition-colors disabled:opacity-50"
        >
          <Play size={20} />
        </button>
        <button
          onClick={pausePractice}
          disabled={!isPlaying}
          className="p-2 rounded-full bg-[#1a2030] text-[#EEF2FF] hover:bg-[#202838] transition-colors disabled:opacity-50"
        >
          <Pause size={20} />
        </button>
        <button
          onClick={stopPractice}
          className="p-2 rounded-full bg-[#1a2030] text-[#EEF2FF] hover:bg-[#202838] transition-colors"
        >
          <Square size={20} />
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
          Practice Speed: {Math.round(speed * 100)}%
        </label>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.01"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
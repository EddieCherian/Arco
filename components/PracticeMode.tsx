'use client';

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
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
  const synthRef = useRef<any>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (isActive) {
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      synthRef.current = synth;
      
      return () => {
        if (synthRef.current) {
          synthRef.current.dispose();
        }
        Tone.Transport.stop();
        Tone.Transport.cancel();
      };
    }
  }, [isActive]);

  const stopPractice = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentNoteIndex(-1);
  };
  
  const schedulePracticeNotes = () => {
    let currentTime = 0;
    
    for (let i = 0; i < midiData.notes.length; i++) {
      const note = midiData.notes[i];
      const duration = note.endTime - note.startTime;
      const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
      
      Tone.Transport.schedule((time) => {
        if (synthRef.current && isPlayingRef.current) {
          synthRef.current.triggerAttackRelease(frequency, duration, time);
          setCurrentNoteIndex(i);
        }
      }, currentTime);
      
      currentTime += duration;
    }
  };
  
  const startPractice = async () => {
    if (!isActive) {
      setIsActive(true);
      return;
    }
    
    await Tone.start();
    Tone.Transport.bpm.value = midiData.tempo * speed;
    Tone.Destination.volume.value = -6;
    
    isPlayingRef.current = true;
    schedulePracticeNotes();
    Tone.Transport.start();
    setIsPlaying(true);
  };
  
  const pausePractice = () => {
    Tone.Transport.pause();
    setIsPlaying(false);
    isPlayingRef.current = false;
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
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setSpeed(val);
            if (isPlaying) {
              Tone.Transport.bpm.value = midiData.tempo * val;
            }
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
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
  const synthRef = useState<Tone.PolySynth | null>(null)[0];

  useEffect(() => {
    if (isActive) {
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      synthRef = synth;
      
      return () => {
        synth.dispose();
      };
    }
  }, [isActive]);

  const startPractice = async () => {
    if (!isActive) {
      setIsActive(true);
      return;
    }
    
    await Tone.start();
    Tone.Transport.bpm.value = midiData.tempo * speed;
    
    let currentIdx = 0;
    
    const playNote = (time: number, index: number) => {
      if (index >= midiData.notes.length) {
        stopPractice();
        return;
      }
      
      const note = midiData.notes[index];
      const frequency = Tone.Frequency(note.pitch, 'midi').toFrequency();
      synthRef.triggerAttackRelease(frequency, note.endTime - note.startTime, time);
      setCurrentNoteIndex(index);
      
      const nextTime = time + (note.endTime - note.startTime);
      Tone.Transport.schedule((t) => playNote(t, index + 1), nextTime);
    };
    
    Tone.Transport.schedule((time) => {
      playNote(time, currentIdx);
    }, 0);
    
    Tone.Transport.start();
    setIsPlaying(true);
  };
  
  const stopPractice = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setIsPlaying(false);
    setCurrentNoteIndex(-1);
  };
  
  const pausePractice = () => {
    Tone.Transport.pause();
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
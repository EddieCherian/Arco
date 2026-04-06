'use client';

import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
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
  const [volume, setVolume] = useState(-6);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const scheduleIdsRef = useRef<number[]>([]);
  
  useEffect(() => {
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synthRef.current = synth;
    
    return () => {
      synth.dispose();
    };
  }, []);
  
  const play = async () => {
    await Tone.start();
    Tone.Transport.bpm.value = midiData.tempo * speed;
    Tone.Destination.volume.value = volume;
    
    let currentNoteIndex = 0;
    
    const scheduleNote = (time: number, index: number) => {
      if (index >= midiData.notes.length) {
        if (isLooping) {
          currentNoteIndex = 0;
          scheduleNote(time + 0.1, 0);
        }
        return;
      }
      
      const note = midiData.notes[index];
      if (synthRef.current) {
        const frequency = Tone.Frequency(note.pitch, 'midi').toFrequency();
        synthRef.current.triggerAttackRelease(frequency, note.endTime - note.startTime, time);
      }
      
      if (onCurrentNoteChange) {
        onCurrentNoteChange(index);
      }
      
      const nextTime = time + (note.endTime - note.startTime);
      const scheduleId = Tone.Transport.schedule((t) => scheduleNote(t, index + 1), nextTime);
      scheduleIdsRef.current.push(scheduleId);
    };
    
    const scheduleId = Tone.Transport.schedule((time) => {
      scheduleNote(time, currentNoteIndex);
    }, 0);
    scheduleIdsRef.current.push(scheduleId);
    
    Tone.Transport.start();
    setIsPlaying(true);
    if (onPlaybackStart) onPlaybackStart();
  };
  
  const stop = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    scheduleIdsRef.current.forEach(id => Tone.Transport.clear(id));
    scheduleIdsRef.current = [];
    setIsPlaying(false);
    if (onPlaybackStop) onPlaybackStop();
  };
  
  const pause = () => {
    Tone.Transport.pause();
    setIsPlaying(false);
  };
  
  return (
    <div className="bg-[#0a0f1a] rounded-lg p-4 border border-[#C9A84C]/20">
      <div className="flex items-center gap-3">
        <button
          onClick={play}
          disabled={isPlaying}
          className="p-2 rounded-full bg-[#C9A84C] text-[#05080F] hover:bg-[#b8943a] transition-colors disabled:opacity-50"
        >
          <Play size={20} />
        </button>
        
        <button
          onClick={pause}
          disabled={!isPlaying}
          className="p-2 rounded-full bg-[#1a2030] text-[#EEF2FF] hover:bg-[#202838] transition-colors disabled:opacity-50"
        >
          <Pause size={20} />
        </button>
        
        <button
          onClick={stop}
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
            min="-60"
            max="6"
            value={volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              Tone.Destination.volume.value = val;
            }}
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
              const val = parseFloat(e.target.value);
              setSpeed(val);
              if (isPlaying) {
                Tone.Transport.bpm.value = midiData.tempo * val;
              }
            }}
            className="w-24"
          />
          <span className="text-sm text-[#C9A84C]">{Math.round(speed * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
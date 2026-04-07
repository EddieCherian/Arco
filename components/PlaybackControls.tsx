'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Repeat, Volume2, Gauge } from 'lucide-react';
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
  onCurrentNoteChange,
}: PlaybackControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(0.7);
  const [progress, setProgress] = useState(0);

  const synthRef = useRef<any>(null);
  const partRef = useRef<any>(null);
  const toneRef = useRef<any>(null);
  const progressIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => stopPlayback();
  }, []);

  const midiToNote = (midi: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    return `${notes[midi % 12]}${Math.max(0, octave)}`;
  };

  const getSafeEndTime = (note: any) => {
    return note.endTime ?? (note.startTime + 0.5);
  };

  const stopPlayback = async () => {
    if (partRef.current) {
      partRef.current.stop();
      partRef.current.dispose();
      partRef.current = null;
    }

    if (synthRef.current) {
      synthRef.current.releaseAll?.();
      synthRef.current.dispose();
      synthRef.current = null;
    }

    if (toneRef.current) {
      toneRef.current.Transport.stop();
      toneRef.current.Transport.cancel();
    }

    clearInterval(progressIntervalRef.current);

    setIsPlaying(false);
    setProgress(0);
    onCurrentNoteChange?.(-1);
    onPlaybackStop?.();
  };

  const startPlayback = async () => {
    if (!midiData?.notes?.length) return;

    try {
      const Tone = await import('tone');
      toneRef.current = Tone;

      await Tone.start();

      // cleanup
      if (partRef.current) {
        partRef.current.stop();
        partRef.current.dispose();
      }

      if (synthRef.current) {
        synthRef.current.dispose();
      }

      Tone.Transport.stop();
      Tone.Transport.cancel();
      Tone.Transport.seconds = 0;

      // synth (ONLY transcribed playback)
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      synth.volume.value = Tone.gainToDb(volume);
      synthRef.current = synth;

      const totalDuration = Math.max(
        ...midiData.notes.map(n => getSafeEndTime(n))
      );

      const events = midiData.notes.map((note, idx) => {
        const end = getSafeEndTime(note);

        return {
          time: note.startTime,
          note: midiToNote(note.pitch),
          duration: Math.max(0.05, end - note.startTime),
          velocity: (note.velocity ?? 100) / 127,
          idx,
        };
      });

      const part = new Tone.Part((time: number, event: any) => {
        synth.triggerAttackRelease(
          event.note,
          event.duration,
          time,
          event.velocity
        );

        Tone.getDraw().schedule(() => {
          onCurrentNoteChange?.(event.idx);
        }, time);
      }, events);

      part.loop = isLooping;
      if (isLooping) part.loopEnd = totalDuration;

      partRef.current = part;

      Tone.Transport.bpm.value = midiData.tempo || 120;

      part.start(0);
      Tone.Transport.start();

      setIsPlaying(true);
      onPlaybackStart?.();

      clearInterval(progressIntervalRef.current);

      progressIntervalRef.current = setInterval(() => {
        const pos = Tone.Transport.seconds;
        const pct = Math.min((pos / totalDuration) * 100, 100);

        setProgress(pct);

        if (pct >= 100 && !isLooping) {
          stopPlayback();
        }
      }, 100);

    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const pausePlayback = async () => {
    if (!toneRef.current) return;

    toneRef.current.Transport.pause();
    clearInterval(progressIntervalRef.current);
    setIsPlaying(false);
  };

  const css = `
    .playback { display: flex; flex-direction: column; gap: 16px; }
    .playback-btns { display: flex; align-items: center; gap: 8px; }
    .pb-btn { width: 40px; height: 40px; border: 1px solid #C9A84C25; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #EEF2FF55; transition: 0.2s; }
    .pb-btn.primary { background: #C9A84C; color: #05080F; border-color: #C9A84C; }
    .pb-btn.active { border-color: #C9A84C; color: #C9A84C; }
    .pb-divider { width: 1px; height: 24px; background: #C9A84C15; margin: 0 4px; }
    .pb-control { display: flex; align-items: center; gap: 10px; }
    .pb-slider { width: 80px; }
    .pb-progress-wrap { height: 2px; background: #C9A84C12; position: relative; }
    .pb-progress-bar { height: 100%; background: #C9A84C; }
    .pb-progress-dot { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 8px; height: 8px; background: #C9A84C; border-radius: 50%; }
  `;

  return (
    <>
      <style>{css}</style>

      <div className="playback">
        <div className="pb-progress-wrap">
          <div className="pb-progress-bar" style={{ width: `${progress}%` }} />
          <div className="pb-progress-dot" style={{ left: `${progress}%` }} />
        </div>

        <div className="playback-btns">
          {!isPlaying ? (
            <button className="pb-btn primary" onClick={startPlayback}>
              <Play size={16} />
            </button>
          ) : (
            <button className="pb-btn primary" onClick={pausePlayback}>
              <Pause size={16} />
            </button>
          )}

          <button className="pb-btn" onClick={stopPlayback}>
            <Square size={14} />
          </button>

          <button
            className={`pb-btn ${isLooping ? 'active' : ''}`}
            onClick={() => setIsLooping(!isLooping)}
          >
            <Repeat size={14} />
          </button>

          <div className="pb-divider" />

          <div className="pb-control">
            <Volume2 size={12} />
            <input
              className="pb-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>

          <div className="pb-divider" />

          <div className="pb-control">
            <Gauge size={12} />
            <input
              className="pb-slider"
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </>
  );
}
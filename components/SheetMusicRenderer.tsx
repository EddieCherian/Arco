'use client';

import { useEffect, useRef } from 'react';
import VexFlow from 'vexflow';
import { MidiData } from '@/lib/types';

const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VexFlow;

interface SheetMusicRendererProps {
  midiData: MidiData;
  currentNoteIndex?: number;
}

export function SheetMusicRenderer({ midiData, currentNoteIndex = -1 }: SheetMusicRendererProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const renderMusic = () => {
      canvasRef.current!.innerHTML = '';
      const renderer = new Renderer(canvasRef.current!, Renderer.Backends.SVG);
      renderer.resize(800, 200);
      const context = renderer.getContext();
      
      const stave = new Stave(10, 40, 780);
      
      const clefMap = {
        treble: 'treble',
        bass: 'bass',
        alto: 'alto',
        tenor: 'tenor'
      };
      
      stave.addClef(clefMap[midiData.clef as keyof typeof clefMap] || 'treble');
      stave.addTimeSignature(`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`);
      stave.setContext(context).draw();
      
      const notes = midiData.notes.slice(0, 20).map((note, idx) => {
        const pitch = note.pitch;
        const noteName = this.midiToNoteName(pitch);
        const isCurrent = idx === currentNoteIndex;
        
        const vexNote = new StaveNote({
          keys: [noteName],
          duration: 'q',
          auto_stem: true,
        });
        
        if (isCurrent) {
          vexNote.setStyle({ fillStyle: '#C9A84C', strokeStyle: '#C9A84C' });
        }
        
        return vexNote;
      });
      
      const voice = new Voice({ num_beats: 4, beat_value: 4 });
      voice.addTickables(notes);
      
      new Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(context, stave);
    };
    
    renderMusic();
  }, [midiData, currentNoteIndex]);
  
  const midiToNoteName = (midi: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const noteName = notes[midi % 12];
    return `${noteName}/${octave}`;
  };
  
  return <div ref={canvasRef} className="w-full overflow-x-auto" />;
}
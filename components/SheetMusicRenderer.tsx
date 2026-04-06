'use client';

import { useEffect, useRef } from 'react';
import VexFlow from 'vexflow';
import { MidiData } from '@/lib/types';

const { Renderer, Stave, StaveNote, Voice, Formatter } = VexFlow;

interface SheetMusicRendererProps {
  midiData: MidiData;
  currentNoteIndex?: number;
}

const midiToNoteName = (midi: number): string => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midi / 12) - 1;
  const noteName = notes[midi % 12];
  return `${noteName}/${Math.max(0, octave)}`;
};

export function SheetMusicRenderer({ midiData, currentNoteIndex = -1 }: SheetMusicRendererProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || midiData.notes.length === 0) return;

    try {
      canvasRef.current.innerHTML = '';
      const renderer = new Renderer(canvasRef.current, Renderer.Backends.SVG);
      renderer.resize(780, 200);
      const context = renderer.getContext();

      const stave = new Stave(10, 40, 760);
      stave.addClef(midiData.clef || 'treble');
      stave.addTimeSignature(`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`);
      stave.setContext(context).draw();

      const maxNotes = Math.min(midiData.notes.length, 16);
      const notes = midiData.notes.slice(0, maxNotes).map((note, idx) => {
        const noteName = midiToNoteName(note.pitch);
        const vexNote = new StaveNote({
          keys: [noteName],
          duration: 'q',
          auto_stem: true,
        });

        if (idx === currentNoteIndex) {
          vexNote.setStyle({ fillStyle: '#C9A84C', strokeStyle: '#C9A84C' });
        }

        // Add accidental if note has sharp
        if (noteName.includes('#')) {
          vexNote.addModifier(new VexFlow.Accidental('#'));
        }

        return vexNote;
      });

      // Pad with rests if fewer than 4 notes
      while (notes.length % 4 !== 0) {
        notes.push(new StaveNote({ keys: ['b/4'], duration: 'qr' }));
      }

      const beatsPerMeasure = midiData.timeSignature[0] || 4;
      const voice = new Voice({ num_beats: Math.min(notes.length, beatsPerMeasure), beat_value: midiData.timeSignature[1] || 4 });
      voice.setStrict(false);
      voice.addTickables(notes);

      new Formatter().joinVoices([voice]).formatToStave([voice], stave);
      voice.draw(context, stave);
    } catch (err) {
      console.error('Sheet music render error:', err);
    }
  }, [midiData, currentNoteIndex]);

  const css = `
    .sheet-wrap { width: 100%; overflow-x: auto; min-height: 200px; }
    .sheet-wrap svg { width: 100%; height: auto; }
    .sheet-wrap svg text { fill: #EEF2FF; }
    .sheet-wrap svg path, .sheet-wrap svg rect { stroke: #EEF2FF88; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="sheet-wrap" ref={canvasRef} />
    </>
  );
}

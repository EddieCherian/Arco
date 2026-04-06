'use client';

import { useEffect, useRef } from 'react';
import VexFlow from 'vexflow';
import { MidiData } from '@/lib/types';

const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental } = VexFlow;

interface SheetMusicRendererProps {
  midiData: MidiData;
  currentNoteIndex?: number;
}

const midiToNoteName = (midi: number): string => {
  const notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  const octave = Math.floor(midi / 12) - 1;
  return `${notes[midi % 12]}/${octave}`;
};

export function SheetMusicRenderer({ midiData, currentNoteIndex = -1 }: SheetMusicRendererProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || midiData.notes.length === 0) return;

    try {
      canvasRef.current.innerHTML = '';

      const renderer = new Renderer(canvasRef.current, Renderer.Backends.SVG);
      renderer.resize(820, 220);
      const context = renderer.getContext();

      const stave = new Stave(20, 50, 780);
      stave.addClef(midiData.clef || 'treble');
      stave.addTimeSignature(`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`);
      stave.setContext(context).draw();

      const maxNotes = Math.min(midiData.notes.length, 12);

      const notes = midiData.notes.slice(0, maxNotes).map((note, idx) => {
        const noteName = midiToNoteName(note.pitch);

        const vexNote = new StaveNote({
          keys: [noteName.replace('#', '')],
          duration: 'q',
          auto_stem: true,
        });

        // cleaner accidental handling
        if (noteName.includes('#')) {
          vexNote.addModifier(new Accidental('#'), 0);
        }

        // highlight current note
        if (idx === currentNoteIndex) {
          vexNote.setStyle({
            fillStyle: '#C9A84C',
            strokeStyle: '#C9A84C',
          });
        }

        return vexNote;
      });

      // pad cleanly with rests
      while (notes.length % 4 !== 0) {
        notes.push(new StaveNote({ keys: ['b/4'], duration: 'qr' }));
      }

      const voice = new Voice({
        num_beats: 4,
        beat_value: 4,
      });

      voice.setStrict(false);
      voice.addTickables(notes);

      new Formatter()
        .joinVoices([voice])
        .formatToStave([voice], stave, { padding: 20 });

      voice.draw(context, stave);

    } catch (err) {
      console.error('Sheet music render error:', err);
    }
  }, [midiData, currentNoteIndex]);

  const css = `
    .sheet-wrap { width: 100%; overflow-x: auto; min-height: 220px; }

    .sheet-wrap svg {
      width: 100%;
      height: auto;
    }

    /* staff lines clearer */
    .sheet-wrap svg path,
    .sheet-wrap svg rect {
      stroke: #EEF2FFAA;
    }

    /* note heads + stems brighter */
    .sheet-wrap svg g path {
      fill: #EEF2FF;
      stroke: #EEF2FF;
    }

    /* text (tempo, etc) */
    .sheet-wrap svg text {
      fill: #EEF2FF;
      font-size: 12px;
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="sheet-wrap" ref={canvasRef} />
    </>
  );
}
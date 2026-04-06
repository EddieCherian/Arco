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

// 🔥 NEW: group notes by time (for chords)
const groupNotes = (notes: any[]) => {
  const groups: any[] = [];
  const threshold = 0.05;

  const sorted = [...notes].sort((a, b) => a.startTime - b.startTime);

  for (const note of sorted) {
    let placed = false;

    for (const group of groups) {
      if (Math.abs(group[0].startTime - note.startTime) < threshold) {
        group.push(note);
        placed = true;
        break;
      }
    }

    if (!placed) groups.push([note]);
  }

  return groups;
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

      const maxNotes = Math.min(midiData.notes.length, 24);

      // 🔥 GROUP NOTES INTO CHORDS
      const groups = groupNotes(midiData.notes.slice(0, maxNotes));

      const notes = groups.map((group, idx) => {
        const keys: string[] = [];
        const accidentals: { index: number; type: string }[] = [];

        group.forEach((note, i) => {
          const noteName = midiToNoteName(note.pitch);

          if (noteName.includes('#')) {
            keys.push(noteName.replace('#', ''));
            accidentals.push({ index: i, type: '#' });
          } else {
            keys.push(noteName);
          }
        });

        const vexNote = new StaveNote({
          keys,
          duration: 'q',
          auto_stem: true,
        });

        // apply accidentals correctly
        accidentals.forEach(acc => {
          vexNote.addModifier(new Accidental(acc.type), acc.index);
        });

        // highlight (approximate: highlight first note in group)
        if (idx === currentNoteIndex) {
          vexNote.setStyle({
            fillStyle: '#C9A84C',
            strokeStyle: '#C9A84C',
          });
        }

        return vexNote;
      });

      // pad with rests
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

    .sheet-wrap svg path,
    .sheet-wrap svg rect {
      stroke: #EEF2FFAA;
    }

    .sheet-wrap svg g path {
      fill: #EEF2FF;
      stroke: #EEF2FF;
    }

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
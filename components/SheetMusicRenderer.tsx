'use client';

import { useEffect, useRef } from 'react';
import VexFlow from 'vexflow';
import { MidiData } from '@/lib/types';

const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector } = VexFlow;

interface SheetMusicRendererProps {
  midiData: MidiData;
  currentNoteIndex?: number;
}

const midiToNoteName = (midi: number): string => {
  const notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
  const octave = Math.floor(midi / 12) - 1;
  return `${notes[midi % 12]}/${octave}`;
};

// group notes by time (for chords)
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
      renderer.resize(820, 260);
      const context = renderer.getContext();

      // SPLIT NOTES BY CLEF
      const trebleRaw = midiData.notes.filter(n => n.clef !== 'bass');
      const bassRaw = midiData.notes.filter(n => n.clef === 'bass');

      const maxNotes = 24;

      const trebleGroups = groupNotes(trebleRaw.slice(0, maxNotes));
      const bassGroups = groupNotes(bassRaw.slice(0, maxNotes));

      // CREATE STAVES
      const trebleStave = new Stave(20, 40, 780);
      trebleStave.addClef('treble');
      trebleStave.addTimeSignature(`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`);
      trebleStave.setContext(context).draw();

      const bassStave = new Stave(20, 140, 780);
      bassStave.addClef('bass');
      bassStave.addTimeSignature(`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`);
      bassStave.setContext(context).draw();

      // CONNECT THEM (PIANO STYLE)
      new StaveConnector(trebleStave, bassStave)
        .setType('brace')
        .setContext(context)
        .draw();

      // BUILD NOTES FUNCTION
      const buildNotes = (groups: any[], clef: 'treble' | 'bass') => {
        return groups.map((group, idx) => {
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
            clef,
            auto_stem: true,
          });

          accidentals.forEach(acc => {
            vexNote.addModifier(new Accidental(acc.type), acc.index);
          });

          if (idx === currentNoteIndex) {
            vexNote.setStyle({
              fillStyle: '#C9A84C',
              strokeStyle: '#C9A84C',
            });
          }

          return vexNote;
        });
      };

      const trebleNotes = buildNotes(trebleGroups, 'treble');
      const bassNotes = buildNotes(bassGroups, 'bass');

      // pad with rests
      const padNotes = (notes: any[], clef: 'treble' | 'bass') => {
        while (notes.length % 4 !== 0) {
          notes.push(new StaveNote({ keys: ['b/4'], duration: 'qr', clef }));
        }
      };

      padNotes(trebleNotes, 'treble');
      padNotes(bassNotes, 'bass');

      // VOICES
      const trebleVoice = new Voice({
        num_beats: 4,
        beat_value: 4,
      }).setStrict(false);

      const bassVoice = new Voice({
        num_beats: 4,
        beat_value: 4,
      }).setStrict(false);

      trebleVoice.addTickables(trebleNotes);
      bassVoice.addTickables(bassNotes);

      // FORMAT + DRAW (removed padding option)
      new Formatter()
        .joinVoices([trebleVoice])
        .formatToStave([trebleVoice], trebleStave);

      new Formatter()
        .joinVoices([bassVoice])
        .formatToStave([bassVoice], bassStave);

      trebleVoice.draw(context, trebleStave);
      bassVoice.draw(context, bassStave);

    } catch (err) {
      console.error('Sheet music render error:', err);
    }
  }, [midiData, currentNoteIndex]);

  const css = `
    .sheet-wrap { width: 100%; overflow-x: auto; min-height: 260px; }

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
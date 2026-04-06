'use client';

import { useState, useEffect } from 'react';
import { Music } from 'lucide-react';
import { MidiData } from '@/lib/types';

interface ChordChartProps {
  midiData: MidiData;
}

export function ChordChart({ midiData }: ChordChartProps) {
  const [chords, setChords] = useState<Array<{name: string, time: number, notes: number[]}>>([]);

  useEffect(() => {
    analyzeChords();
  }, [midiData]);

  const analyzeChords = () => {
    const chordMap = new Map<number, number[]>();
    const timeWindow = 0.5;
    
    midiData.notes.forEach(note => {
      const timeSlot = Math.floor(note.startTime / timeWindow);
      if (!chordMap.has(timeSlot)) {
        chordMap.set(timeSlot, []);
      }
      chordMap.get(timeSlot)!.push(note.pitch);
    });
    
    const detectedChords: Array<{name: string, time: number, notes: number[]}> = [];
    
    chordMap.forEach((notes, timeSlot) => {
      const uniqueNotes = [...new Set(notes)];
      if (uniqueNotes.length >= 2) {
        const root = uniqueNotes[0] % 12;
        const third = uniqueNotes.find(n => (n % 12) === (root + 4) % 12);
        const fifth = uniqueNotes.find(n => (n % 12) === (root + 7) % 12);
        
        let chordName = '';
        const rootNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root];
        
        if (third && fifth) {
          chordName = `${rootNote} Maj`;
        } else if (third && !fifth) {
          chordName = `${rootNote} maj7`;
        } else if (!third && fifth) {
          chordName = `${rootNote} 5`;
        } else {
          chordName = `${rootNote}`;
        }
        
        detectedChords.push({
          name: chordName,
          time: timeSlot * timeWindow,
          notes: uniqueNotes
        });
      }
    });
    
    setChords(detectedChords.slice(0, 12));
  };

  if (chords.length === 0) {
    return (
      <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20 text-center">
        <Music size={24} className="text-[#C9A84C]/40 mx-auto mb-2" />
        <p className="text-sm text-[#EEF2FF]/40">Add more notes to generate chord chart</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20">
      <h3 className="text-lg font-semibold mb-4 text-[#C9A84C]">Chord Chart</h3>
      
      <div className="space-y-2">
        {chords.map((chord, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-[#05080F] rounded-lg border border-[#C9A84C]/10"
          >
            <div>
              <span className="font-mono text-lg font-bold text-[#C9A84C]">{chord.name}</span>
              <span className="text-xs text-[#EEF2FF]/40 ml-2">at {chord.time.toFixed(1)}s</span>
            </div>
            <div className="text-xs text-[#EEF2FF]/60">
              {chord.notes.length} notes
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-[#C9A84C]/5 rounded-lg border border-[#C9A84C]/10">
        <p className="text-xs text-[#EEF2FF]/60">
          Suggested progression: {chords.map(c => c.name).join(' → ')}
        </p>
      </div>
    </div>
  );
}

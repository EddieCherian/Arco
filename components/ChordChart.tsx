'use client';

import { useState, useEffect } from 'react';
import { Music, Volume2 } from 'lucide-react';
import { MidiData } from '@/lib/types';

interface ChordChartProps {
  midiData: MidiData;
}

export function ChordChart({ midiData }: ChordChartProps) {
  const [chords, setChords] = useState<Array<{name: string, time: number, notes: number[], romanNumeral?: string}>>([]);
  const [key, setKey] = useState('C');

  useEffect(() => {
    analyzeChords();
  }, [midiData]);

  const getRomanNumeral = (root: number, keyRoot: number, isMajor: boolean): string => {
    const intervals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const minorIntervals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'];
    const distance = (root - keyRoot + 12) % 12;
    const index = [0, 2, 4, 5, 7, 9, 11].indexOf(distance);
    
    if (index === -1) return '';
    return isMajor ? intervals[index] : minorIntervals[index];
  };

  const analyzeChords = () => {
    if (midiData.notes.length < 3) return;
    
    const chordMap = new Map<number, number[]>();
    const timeWindow = 0.5;
    
    midiData.notes.forEach(note => {
      const timeSlot = Math.floor(note.startTime / timeWindow);
      if (!chordMap.has(timeSlot)) {
        chordMap.set(timeSlot, []);
      }
      chordMap.get(timeSlot)!.push(note.pitch);
    });
    
    const detectedChords: Array<{name: string, time: number, notes: number[], romanNumeral?: string}> = [];
    const keyRoot = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(midiData.key.split('m')[0]);
    const isMajor = !midiData.key.includes('m');
    
    chordMap.forEach((notes, timeSlot) => {
      const uniqueNotes = [...new Set(notes)];
      if (uniqueNotes.length >= 2) {
        // Find most likely root note
        const noteFreq = new Array(12).fill(0);
        uniqueNotes.forEach(n => noteFreq[n % 12]++);
        let root = noteFreq.indexOf(Math.max(...noteFreq));
        
        const hasThird = uniqueNotes.some(n => (n % 12) === (root + 4) % 12);
        const hasMinorThird = uniqueNotes.some(n => (n % 12) === (root + 3) % 12);
        const hasFifth = uniqueNotes.some(n => (n % 12) === (root + 7) % 12);
        const hasSeventh = uniqueNotes.some(n => (n % 12) === (root + 10) % 12 || (n % 12) === (root + 11) % 12);
        
        let chordName = '';
        const rootNote = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][root];
        
        if (hasMinorThird) {
          chordName = `${rootNote}m`;
          if (hasSeventh) chordName += '7';
        } else if (hasThird) {
          chordName = rootNote;
          if (hasSeventh) chordName += 'maj7';
        } else if (hasFifth) {
          chordName = `${rootNote}5`;
        } else {
          chordName = rootNote;
        }
        
        const romanNumeral = getRomanNumeral(root, keyRoot, isMajor && !chordName.includes('m'));
        
        detectedChords.push({
          name: chordName,
          time: timeSlot * timeWindow,
          notes: uniqueNotes,
          romanNumeral
        });
      }
    });
    
    setChords(detectedChords.slice(0, 16));
    setKey(midiData.key);
  };

  if (chords.length === 0) {
    return (
      <div className="bg-gradient-to-br from-[#0A0F1A] to-[#05080F] rounded-2xl border border-[#C9A84C]/20 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 flex items-center justify-center mx-auto mb-4">
          <Music size={24} className="text-[#C9A84C]/40" />
        </div>
        <p className="text-white/60">Record or upload audio to see chord analysis</p>
        <p className="text-xs text-white/30 mt-2">Arco will automatically detect chords from your melody</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0A0F1A] to-[#05080F] rounded-2xl border border-[#C9A84C]/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white">Chord Chart</h3>
          <p className="text-sm text-white/40">Key: {key}</p>
        </div>
        <Volume2 size={20} className="text-[#C9A84C]/60" />
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {chords.map((chord, idx) => (
          <div
            key={idx}
            className="group flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-[#C9A84C]/30 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-white/40">{chord.time.toFixed(1)}s</span>
              <div>
                <span className="text-xl font-bold text-[#C9A84C]">{chord.name}</span>
                {chord.romanNumeral && (
                  <span className="ml-2 text-sm text-white/40 font-mono">{chord.romanNumeral}</span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {chord.notes.slice(0, 5).map((note, i) => {
                const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                return (
                  <span key={i} className="text-xs px-2 py-1 bg-[#C9A84C]/10 rounded text-[#C9A84C] font-mono">
                    {noteNames[note % 12]}{Math.floor(note / 12) - 1}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-[#C9A84C]/5 rounded-xl border border-[#C9A84C]/10">
        <p className="text-sm text-white/60">
          Suggested Progression: {chords.slice(0, 4).map(c => c.name).join(' → ')}
        </p>
        <p className="text-xs text-white/30 mt-2">
          Based on {chords.length} chord changes detected
        </p>
      </div>
    </div>
  );
}
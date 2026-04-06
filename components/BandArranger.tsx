'use client';

import { useState } from 'react';
import { Users, Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { MidiData } from '@/lib/types';
import { MidiConverter } from '@/lib/midiConverter';

interface BandArrangerProps {
  midiData: MidiData;
}

const bandInstruments = [
  'piano', 'guitar', 'bass', 'drums', 'violin', 'cello', 'flute', 'trumpet', 'saxophone'
];

export function BandArranger({ midiData }: BandArrangerProps) {
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(['piano', 'bass']);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateParts = async () => {
    setIsGenerating(true);
    try {
      const zip = new JSZip();
      
      for (const instrument of selectedInstruments) {
        const convertedData = await MidiConverter.convertInstrument(midiData, instrument);
        
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
          <rect width="800" height="200" fill="#05080F"/>
          <text x="20" y="30" fill="#C9A84C" font-size="16">${instrument.toUpperCase()} Part</text>
          <text x="20" y="50" fill="#EEF2FF" font-size="12">Key: ${convertedData.key} | Tempo: ${convertedData.tempo} BPM</text>`;
        
        convertedData.notes.slice(0, 30).forEach((note, idx) => {
          svgContent += `<text x="20" y="${70 + idx * 15}" fill="#EEF2FF" font-size="10">
            Note ${idx + 1}: Pitch ${note.pitch} (${Math.floor(note.pitch / 12) - 1}) | 
            Duration: ${(note.endTime - note.startTime).toFixed(2)}s
          </text>`;
        });
        
        svgContent += `</svg>`;
        
        zip.file(`${instrument}_part.svg`, svgContent);
        
        let textContent = `${instrument.toUpperCase()} PART\n`;
        textContent += `Key: ${convertedData.key}\n`;
        textContent += `Tempo: ${convertedData.tempo} BPM\n`;
        textContent += `Time Signature: ${convertedData.timeSignature[0]}/${convertedData.timeSignature[1]}\n`;
        textContent += `Notes: ${convertedData.notes.length}\n\n`;
        textContent += `Note Details:\n`;
        
        convertedData.notes.forEach((note, idx) => {
          textContent += `${idx
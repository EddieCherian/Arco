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
          textContent += `${idx + 1}. Pitch: ${note.pitch} | Start: ${note.startTime.toFixed(2)}s | Duration: ${(note.endTime - note.startTime).toFixed(2)}s | Velocity: ${note.velocity}\n`;
        });
        
        zip.file(`${instrument}_part.txt`, textContent);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'band_arrangement.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate band parts:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInstrument = (instrument: string) => {
    if (selectedInstruments.includes(instrument)) {
      setSelectedInstruments(selectedInstruments.filter(i => i !== instrument));
    } else {
      setSelectedInstruments([...selectedInstruments, instrument]);
    }
  };

  return (
    <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-[#C9A84C]" />
        <h3 className="text-lg font-semibold text-[#C9A84C]">Band Arranger</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
            Select Instruments (max 8)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {bandInstruments.map((instrument) => (
              <label
                key={instrument}
                className="flex items-center gap-2 px-3 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg cursor-pointer hover:border-[#C9A84C] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedInstruments.includes(instrument)}
                  onChange={() => toggleInstrument(instrument)}
                  className="w-4 h-4 rounded border-[#C9A84C]/30 text-[#C9A84C] focus:ring-[#C9A84C]"
                />
                <span className="text-sm capitalize">{instrument}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button
          onClick={generateParts}
          disabled={isGenerating || selectedInstruments.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#C9A84C] text-[#05080F] rounded-lg hover:bg-[#b8943a] transition-colors disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Parts...
            </>
          ) : (
            <>
              <Download size={18} />
              Generate Band Parts (ZIP)
            </>
          )}
        </button>
        
        <p className="text-xs text-[#EEF2FF]/40 text-center">
          Each instrument part is optimized for its range and capabilities
        </p>
      </div>
    </div>
  );
}
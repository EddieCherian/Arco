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

  const css = `
  .band { background: #07090E; border: 1px solid #C9A84C18; position: relative; padding: 28px; }
  .band::before { content: ''; position: absolute; top: -1px; left: -1px; width: 10px; height: 10px; border-top: 1px solid #C9A84C; border-left: 1px solid #C9A84C; opacity: 0.6; }
  .band::after { content: ''; position: absolute; bottom: -1px; right: -1px; width: 10px; height: 10px; border-bottom: 1px solid #C9A84C; border-right: 1px solid #C9A84C; opacity: 0.6; }

  .band-title { display: flex; align-items: center; gap: 8px; color: #C9A84C; margin-bottom: 18px; }

  .band-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 18px; }

  .band-item { display: flex; align-items: center; gap: 8px; padding: 10px; background: #05080F; border: 1px solid #C9A84C30; cursor: pointer; }

  .band-item input { accent-color: #C9A84C; }

  .band-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; background: #C9A84C; color: #05080F; border: none; cursor: pointer; }

  .band-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .band-footer { font-size: 12px; color: #EEF2FF66; text-align: center; margin-top: 12px; }
  `;

  return (
    <>
      <style>{css}</style>

      <div className="band">
        <div className="band-title">
          <Users size={18} />
          <span>Band Arranger</span>
        </div>

        <div className="band-grid">
          {bandInstruments.map((instrument) => (
            <label key={instrument} className="band-item">
              <input
                type="checkbox"
                checked={selectedInstruments.includes(instrument)}
                onChange={() => toggleInstrument(instrument)}
              />
              <span>{instrument}</span>
            </label>
          ))}
        </div>

        <button
          onClick={generateParts}
          disabled={isGenerating || selectedInstruments.length === 0}
          className="band-btn"
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="spin" />
              Generating...
            </>
          ) : (
            <>
              <Download size={16} />
              Generate Band Parts
            </>
          )}
        </button>

        <div className="band-footer">
          Each instrument is adapted to its playable range
        </div>
      </div>
    </>
  );
}
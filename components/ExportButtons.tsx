'use client';

import { useState } from 'react';
import { Download, FileText, Music } from 'lucide-react';
import jsPDF from 'jspdf';
import * as MidiWriter from 'midi-writer-js';
import { MidiData } from '@/lib/types';

interface ExportButtonsProps {
  midiData: MidiData;
}

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function ExportButtons({ midiData }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const convertMidiToNoteName = (midiNumber: number): string => {
    const octave = Math.floor(midiNumber / 12) - 1;
    const noteName = noteNames[midiNumber % 12];
    return `${noteName}${octave}`;
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Arco Music Score', 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Key: ${midiData.key} | Tempo: ${midiData.tempo} BPM`, 20, 35);
      pdf.text(`Time Signature: ${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`, 20, 45);
      pdf.text(`Instrument: ${midiData.instrument} | Clef: ${midiData.clef}`, 20, 55);
      
      let yPos = 75;
      pdf.setFontSize(10);
      midiData.notes.slice(0, 50).forEach((note, idx) => {
        if (yPos > 280) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(
          `${idx + 1}. Pitch: ${note.pitch} (${convertMidiToNoteName(note.pitch)}) | Start: ${note.startTime.toFixed(2)}s | Duration: ${(note.endTime - note.startTime).toFixed(2)}s`,
          20,
          yPos
        );
        yPos += 8;
      });
      
      pdf.save(`arco_score_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportMIDI = () => {
    setIsExporting(true);
    try {
      const track = new MidiWriter.Track();
      track.setTempo(midiData.tempo);
      track.setTimeSignature(midiData.timeSignature[0], midiData.timeSignature[1]);
      
      midiData.notes.forEach(note => {
        const noteName = convertMidiToNoteName(note.pitch);
        track.addEvent(new MidiWriter.NoteEvent({
          pitch: [noteName],
          duration: '4',
          velocity: note.velocity
        }));
      });
      
      const write = new MidiWriter.Writer([track]);
      const midiBlob = new Blob([write.dataUri()], { type: 'audio/midi' });
      const url = URL.createObjectURL(midiBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arco_${Date.now()}.mid`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('MIDI export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAudio = async () => {
    setIsExporting(true);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const duration = Math.max(...midiData.notes.map(n => n.endTime), 1);
      const sampleRate = audioContext.sampleRate;
      const samples = duration * sampleRate;
      const buffer = audioContext.createBuffer(1, samples, sampleRate);
      const channelData = buffer.getChannelData(0);
      
      for (const note of midiData.notes) {
        const frequency = 440 * Math.pow(2, (note.pitch - 69) / 12);
        const startSample = Math.floor(note.startTime * sampleRate);
        const endSample = Math.floor(note.endTime * sampleRate);
        
        for (let i = startSample; i < endSample && i < samples; i++) {
          const t = (i - startSample) / sampleRate;
          const envelope = Math.exp(-t * 5);
          channelData[i] += Math.sin(2 * Math.PI * frequency * t) * envelope * (note.velocity / 127);
        }
      }
      
      let max = 0;
      for (let i = 0; i < samples; i++) {
        max = Math.max(max, Math.abs(channelData[i]));
      }
      if (max > 0) {
        for (let i = 0; i < samples; i++) {
          channelData[i] /= max;
        }
      }
      
      const wavBlob = audioBufferToWav(buffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arco_${Date.now()}.wav`;
      a.click();
      URL.revokeObjectURL(url);
      audioContext.close();
    } catch (error) {
      console.error('Audio export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    
    const samples = buffer.getChannelData(0);
    const dataLength = samples.length * (bitDepth / 8);
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    writeString(view, 0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return new Blob([view], { type: 'audio/wav' });
  };
  
  const writeString = (view: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  const exportXML = () => {
    setIsExporting(true);
    try {
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>Arco Composition</work-title>
  </work>
  <identification>
    <encoding>
      <software>Arco Music Platform</software>
      <encoding-date>${new Date().toISOString()}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>${midiData.instrument}</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key>
          <fifths>0</fifths>
          <mode>major</mode>
        </key>
        <time>
          <beats>${midiData.timeSignature[0]}</beats>
          <beat-type>${midiData.timeSignature[1]}</beat-type>
        </time>
        <clef>
          <sign>${midiData.clef === 'treble' ? 'G' : midiData.clef === 'bass' ? 'F' : 'C'}</sign>
          <line>${midiData.clef === 'treble' ? 2 : midiData.clef === 'bass' ? 4 : 3}</line>
        </clef>
      </attributes>`;
      
      midiData.notes.forEach(note => {
        const noteName = noteNames[note.pitch % 12];
        const octave = Math.floor(note.pitch / 12) - 1;
        
        xml += `
      <note>
        <pitch>
          <step>${noteName}</step>
          <octave>${octave}</octave>
        </pitch>
        <duration>${Math.max(1, Math.round((note.endTime - note.startTime) * 4))}</duration>
        <voice>1</voice>
        <type>quarter</type>
      </note>`;
      });
      
      xml += `
    </measure>
  </part>
</score-partwise>`;
      
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arco_${Date.now()}.musicxml`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('XML export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0A0F1A] to-[#05080F] rounded-2xl border border-[#C9A84C]/20 p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Export</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={exportPDF}
          disabled={isExporting || midiData.notes.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-[#C9A84C]/30 transition-all duration-200 disabled:opacity-50"
        >
          <FileText size={16} />
          PDF
        </button>
        <button
          onClick={exportMIDI}
          disabled={isExporting || midiData.notes.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-[#C9A84C]/30 transition-all duration-200 disabled:opacity-50"
        >
          <Music size={16} />
          MIDI
        </button>
        <button
          onClick={exportAudio}
          disabled={isExporting || midiData.notes.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-[#C9A84C]/30 transition-all duration-200 disabled:opacity-50"
        >
          <Download size={16} />
          Audio
        </button>
        <button
          onClick={exportXML}
          disabled={isExporting || midiData.notes.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-[#C9A84C]/30 transition-all duration-200 disabled:opacity-50"
        >
          <Download size={16} />
          MusicXML
        </button>
      </div>
    </div>
  );
}
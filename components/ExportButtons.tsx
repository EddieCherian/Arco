'use client';

import { useState } from 'react';
import { Download, FileJson, FileText, Music } from 'lucide-react';
import jsPDF from 'jspdf';
import * as MidiWriter from 'midi-writer-js';
import * as Tone from 'tone';
import JSZip from 'jszip';
import { MidiData } from '@/lib/types';

interface ExportButtonsProps {
  midiData: MidiData;
}

export function ExportButtons({ midiData }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

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
          `${idx + 1}. Pitch: ${note.pitch} | Start: ${note.startTime.toFixed(2)}s | Duration: ${(note.endTime - note.startTime).toFixed(2)}s`,
          20,
          yPos
        );
        yPos += 8;
      });
      
      pdf.save('arco-score.pdf');
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
      track.addTimeSignature(midiData.timeSignature[0], midiData.timeSignature[1]);
      
      midiData.notes.forEach(note => {
        track.addEvent(new MidiWriter.NoteEvent({
          pitch: [note.pitch],
          duration: (note.endTime - note.startTime) * 1000,
          velocity: note.velocity
        }));
      });
      
      const write = new MidiWriter.Writer([track]);
      const midiBlob = new Blob([write.dataUri()], { type: 'audio/midi' });
      const url = URL.createObjectURL(midiBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arocomposition.mid';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('MIDI export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportMP3 = async () => {
    setIsExporting(true);
    try {
      await Tone.start();
      const synth = new Tone.PolySynth(Tone.Synth).toDestination();
      const duration = Math.max(...midiData.notes.map(n => n.endTime)) + 1;
      
      const buffer = await Tone.Offline(() => {
        midiData.notes.forEach(note => {
          const freq = Tone.Frequency(note.pitch, 'midi').toFrequency();
          synth.triggerAttackRelease(freq, note.endTime - note.startTime, note.startTime);
        });
      }, duration);
      
      const audioBlob = await buffer.convertToBlob();
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'arocomposition.mp3';
      a.click();
      URL.revokeObjectURL(url);
      synth.dispose();
    } catch (error) {
      console.error('MP3 export failed:', error);
    } finally {
      setIsExporting(false);
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
        xml += `
      <note>
        <pitch>
          <step>${String.fromCharCode(65 + (note.pitch % 12))}</step>
          <octave>${Math.floor(note.pitch / 12) - 1}</octave>
        </pitch>
        <duration>${Math.round((note.endTime - note.startTime) * 4)}</duration>
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
      a.download = 'arocomposition.musicxml';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('XML export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-[#0a0f1a] rounded-lg p-4 border border-[#C9A84C]/20">
      <h3 className="text-lg font-semibold mb-3 text-[#C9A84C]">Export</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={exportPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] hover:border-[#C9A84C] transition-colors disabled:opacity-50"
        >
          <FileText size={16} />
          PDF
        </button>
        <button
          onClick={exportMIDI}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] hover:border-[#C9A84C] transition-colors disabled:opacity-50"
        >
          <Music size={16} />
          MIDI
        </button>
        <button
          onClick={exportMP3}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] hover:border-[#C9A84C] transition-colors disabled:opacity-50"
        >
          <Download size={16} />
          MP3
        </button>
        <button
          onClick={exportXML}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] hover:border-[#C9A84C] transition-colors disabled:opacity-50"
        >
          <FileJson size={16} />
          MusicXML
        </button>
      </div>
    </div>
  );
}
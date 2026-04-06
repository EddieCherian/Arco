'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AudioRecorder } from '@/components/AudioRecorder';
import { SheetMusicRenderer } from '@/components/SheetMusicRenderer';
import { PlaybackControls } from '@/components/PlaybackControls';
import { InstrumentSelector } from '@/components/InstrumentSelector';
import { ClefSelector } from '@/components/ClefSelector';
import { KeyTransposer } from '@/components/KeyTransposer';
import { TimeSignatureSelector } from '@/components/TimeSignatureSelector';
import { ExportButtons } from '@/components/ExportButtons';
import { GeminiAssistant } from '@/components/GeminiAssistant';
import { PracticeMode } from '@/components/PracticeMode';
import { BandArranger } from '@/components/BandArranger';
import { ChordChart } from '@/components/ChordChart';
import { MidiData } from '@/lib/types';
import { MidiConverter } from '@/lib/midiConverter';
import { Save, Share2 } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const defaultMidiData: MidiData = {
  notes: [],
  tempo: 120,
  timeSignature: [4, 4],
  key: 'C',
  clef: 'treble',
  instrument: 'piano',
  octaveShift: 0
};

export default function DashboardPage() {
  const [midiData, setMidiData] = useState<MidiData>(defaultMidiData);
  const [pieceName, setPieceName] = useState('Untitled Piece');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  
  const handleTranscriptionComplete = async (newMidiData: MidiData) => {
    setMidiData(newMidiData);
    toast.success('Audio transcribed successfully!');
  };
  
  const handleInstrumentChange = async (instrument: string) => {
    const converted = await MidiConverter.convertInstrument(midiData, instrument);
    setMidiData(converted);
    toast.success(`Converted to ${instrument}`);
  };
  
  const handleClefChange = (clef: string) => {
    setMidiData({ ...midiData, clef: clef as any });
  };
  
  const handleKeyChange = (key: string) => {
    const transposed = MidiConverter.changeKey(midiData, key);
    setMidiData(transposed);
  };
  
  const handleOctaveShift = (octaves: number) => {
    const shifted = MidiConverter.shiftOctave(midiData, octaves);
    setMidiData(shifted);
  };
  
  const handleTimeSignatureChange = (timeSig: string) => {
    const [beats, beatValue] = timeSig.split('/').map(Number);
    setMidiData({ ...midiData, timeSignature: [beats, beatValue] });
  };
  
  const handleTempoChange = (tempo: number) => {
    setMidiData({ ...midiData, tempo });
  };
  
  const saveToLibrary = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to save');
      return;
    }
    
    setIsSaving(true);
    try {
      const pieceData = {
        userId: auth.currentUser.uid,
        name: pieceName,
        midiData: midiData,
        instrument: midiData.instrument,
        clef: midiData.clef,
        key: midiData.key,
        bpm: midiData.tempo,
        timeSignature: `${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        shared: false
      };
      
      const docRef = await addDoc(collection(db, 'pieces'), pieceData);
      toast.success('Saved to library!');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };
  
  const createShareLink = async () => {
    if (!auth.currentUser) {
      toast.error('Please login to share');
      return;
    }
    
    setIsSaving(true);
    try {
      const shareId = Math.random().toString(36).substring(7);
      const shareData = {
        pieceId: shareId,
        midiData: midiData,
        instrument: midiData.instrument,
        clef: midiData.clef,
        key: midiData.key,
        bpm: midiData.tempo,
        timeSignature: `${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`,
        createdAt: new Date(),
        sharedBy: auth.currentUser.uid
      };
      
      await setDoc(doc(db, 'sharedPieces', shareId), shareData);
      const shareUrl = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#05080F]">
      <Sidebar />
      
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <input
                type="text"
                value={pieceName}
                onChange={(e) => setPieceName(e.target.value)}
                className="text-3xl font-bold bg-transparent border-b-2 border-[#C9A84C]/30 focus:border-[#C9A84C] outline-none px-2"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={saveToLibrary}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-[#05080F] rounded-lg hover:bg-[#b8943a] transition-colors"
              >
                <Save size={18} />
                Save
              </button>
              
              <button
                onClick={createShareLink}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a2030] text-[#EEF2FF] rounded-lg hover:bg-[#202838] transition-colors"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
              
              {midiData.notes.length > 0 && (
                <>
                  <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20">
                    <h3 className="text-lg font-semibold mb-4 text-[#C9A84C]">Sheet Music</h3>
                    <SheetMusicRenderer midiData={midiData} />
                  </div>
                  
                  <PlaybackControls midiData={midiData} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InstrumentSelector
                      value={midiData.instrument}
                      onChange={handleInstrumentChange}
                    />
                    <ClefSelector
                      value={midiData.clef}
                      onChange={handleClefChange}
                    />
                    <KeyTransposer
                      value={midiData.key}
                      onChange={handleKeyChange}
                    />
                    <TimeSignatureSelector
                      timeSignature={`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`}
                      tempo={midiData.tempo}
                      onTimeSignatureChange={handleTimeSignatureChange}
                      onTempoChange={handleTempoChange}
                    />
                  </div>
                  
                  <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20">
                    <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
                      Octave Shift: {midiData.octaveShift}
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="1"
                      value={midiData.octaveShift}
                      onChange={(e) => handleOctaveShift(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  
                  <ChordChart midiData={midiData} />
                  <BandArranger midiData={midiData} />
                  <PracticeMode midiData={midiData} />
                  <ExportButtons midiData={midiData} />
                </>
              )}
            </div>
            
            <div className="space-y-6">
              <GeminiAssistant midiData={midiData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
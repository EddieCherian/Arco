'use client';

import { useState, useEffect } from 'react';
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
import { Save, Share2, Loader2, Music2, Sparkles } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white/60">Loading your studio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  
  const handleTranscriptionComplete = async (newMidiData: MidiData) => {
    setMidiData(newMidiData);
    toast.success('✨ Audio transcribed successfully!');
  };
  
  const handleInstrumentChange = async (instrument: string) => {
    const converted = await MidiConverter.convertInstrument(midiData, instrument);
    setMidiData(converted);
    toast.success(`🎵 Converted to ${instrument}`);
  };
  
  const handleClefChange = (clef: string) => {
    setMidiData({ ...midiData, clef: clef as any });
    toast.info(`🎼 Changed to ${clef} clef`);
  };
  
  const handleKeyChange = (key: string) => {
    const transposed = MidiConverter.changeKey(midiData, key);
    setMidiData(transposed);
    toast.success(`🎹 Transposed to ${key} major`);
  };
  
  const handleOctaveShift = (octaves: number) => {
    const shifted = MidiConverter.shiftOctave(midiData, octaves);
    setMidiData({ ...shifted, octaveShift: octaves });
    toast.info(`⬆️ Octave shift: ${octaves > 0 ? `+${octaves}` : octaves}`);
  };
  
  const handleTimeSignatureChange = (timeSig: string) => {
    const [beats, beatValue] = timeSig.split('/').map(Number);
    setMidiData({ ...midiData, timeSignature: [beats, beatValue] });
    toast.info(`⏱️ Time signature changed to ${timeSig}`);
  };
  
  const handleTempoChange = (tempo: number) => {
    setMidiData({ ...midiData, tempo });
    toast.info(`🎚️ Tempo set to ${tempo} BPM`);
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
      
      await addDoc(collection(db, 'pieces'), pieceData);
      toast.success('💾 Saved to your library!');
    } catch (error) {
      console.error('Save error:', error);
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
      toast.success('🔗 Share link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to create share link');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05080F] via-[#0A0F1A] to-[#05080F]">
      <Toaster position="top-right" richColors toastOptions={{ style: { background: '#0A0F1A', border: '1px solid rgba(201, 168, 76, 0.2)', color: '#FFFFFF' } }} />
      <Sidebar />
      
      <main className="ml-72 p-8 animate-fadeIn">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <h1 className="text-4xl font-bold gradient-text">Studio</h1>
              <p className="text-white/40">Create, edit, and share your music</p>
            </div>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={pieceName}
                onChange={(e) => setPieceName(e.target.value)}
                className="input-modern w-64"
                placeholder="Piece name..."
              />
              <button
                onClick={saveToLibrary}
                disabled={isSaving || midiData.notes.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={18} />
                Save
              </button>
              <button
                onClick={createShareLink}
                disabled={isSaving || midiData.notes.length === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>
          
          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Welcome Card if no data */}
              {midiData.notes.length === 0 && (
                <div className="card p-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C9A84C]/20 to-transparent flex items-center justify-center mx-auto mb-6">
                    <Music2 size={40} className="text-[#C9A84C]" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to Arco Studio</h2>
                  <p className="text-white/60 mb-6">Record or upload audio to start creating</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-sm text-white/40">
                    <Sparkles size={14} className="text-[#C9A84C]" />
                    <span>AI-powered transcription ready</span>
                  </div>
                </div>
              )}
              
              <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
              
              {midiData.notes.length > 0 && (
                <>
                  <div className="card p-6">
                    <h3 className="text-lg font-semibold mb-4 gradient-text">Sheet Music</h3>
                    <SheetMusicRenderer midiData={midiData} />
                  </div>
                  
                  <PlaybackControls midiData={midiData} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <InstrumentSelector value={midiData.instrument} onChange={handleInstrumentChange} />
                    <ClefSelector value={midiData.clef} onChange={handleClefChange} />
                    <KeyTransposer value={midiData.key} onChange={handleKeyChange} />
                    <TimeSignatureSelector
                      timeSignature={`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`}
                      tempo={midiData.tempo}
                      onTimeSignatureChange={handleTimeSignatureChange}
                      onTempoChange={handleTempoChange}
                    />
                  </div>
                  
                  <div className="card p-6">
                    <label className="block text-sm font-medium mb-3 text-white/80">
                      Octave Shift: {midiData.octaveShift > 0 ? `+${midiData.octaveShift}` : midiData.octaveShift}
                    </label>
                    <input
                      type="range"
                      min="-2"
                      max="2"
                      step="1"
                      value={midiData.octaveShift}
                      onChange={(e) => handleOctaveShift(parseInt(e.target.value))}
                      className="slider-modern w-full"
                    />
                    <div className="flex justify-between text-xs text-white/40 mt-2">
                      <span>-2 Octaves</span>
                      <span>-1</span>
                      <span>Original</span>
                      <span>+1</span>
                      <span>+2 Octaves</span>
                    </div>
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
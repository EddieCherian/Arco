'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SheetMusicRenderer } from '@/components/SheetMusicRenderer';
import { PlaybackControls } from '@/components/PlaybackControls';
import { InstrumentSelector } from '@/components/InstrumentSelector';
import { MidiData } from '@/lib/types';
import { Music, Download } from 'lucide-react';

export default function SharedPiecePage({ params }: { params: { id: string } }) {
  const [midiData, setMidiData] = useState<MidiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedPiece();
  }, [params.id]);

  const loadSharedPiece = async () => {
    try {
      const docRef = doc(db, 'sharedPieces', params.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMidiData(data.midiData);
      } else {
        setError('Piece not found');
      }
    } catch (err) {
      setError('Failed to load shared piece');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
        <div className="text-center">
          <Music size={48} className="text-[#C9A84C] animate-pulse mx-auto mb-4" />
          <p className="text-[#EEF2FF]/60">Loading shared piece...</p>
        </div>
      </div>
    );
  }

  if (error || !midiData) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎵</div>
          <h1 className="text-2xl font-bold text-[#C9A84C] mb-2">Piece Not Found</h1>
          <p className="text-[#EEF2FF]/60">The shared piece may have been removed or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080F]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#C9A84C]">Shared Arco Composition</h1>
            <p className="text-[#EEF2FF]/60 mt-2">View and play this shared piece</p>
          </div>
          
          <div className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#EEF2FF]/60">Instrument</label>
                <p className="text-[#EEF2FF] capitalize">{midiData.instrument}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#EEF2FF]/60">Key</label>
                <p className="text-[#EEF2FF]">{midiData.key}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#EEF2FF]/60">Tempo</label>
                <p className="text-[#EEF2FF]">{midiData.tempo} BPM</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#EEF2FF]/60">Time Signature</label>
                <p className="text-[#EEF2FF]">{midiData.timeSignature[0]}/{midiData.timeSignature[1]}</p>
              </div>
            </div>
            
            <SheetMusicRenderer midiData={midiData} />
          </div>
          
          <PlaybackControls midiData={midiData} />
          
          <div className="mt-6 text-center text-sm text-[#EEF2FF]/40">
            <p>Shared via Arco Music Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
}

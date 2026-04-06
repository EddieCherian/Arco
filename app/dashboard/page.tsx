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
import { Save, Share2, Music2 } from 'lucide-react';
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
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: '#05080F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '1px solid #C9A84C33', borderTop: '1px solid #C9A84C', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#EEF2FF33' }}>Loading Studio</p>
      </div>
    </div>
  );

  if (!user) return null;

  const handleTranscriptionComplete = async (newMidiData: MidiData) => {
    setMidiData(newMidiData);
    toast.success('Audio transcribed successfully');
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
    toast.success(`Transposed to ${key}`);
  };

  const handleOctaveShift = (octaves: number) => {
    const shifted = MidiConverter.shiftOctave(midiData, octaves);
    setMidiData({ ...shifted, octaveShift: octaves });
  };

  const handleTimeSignatureChange = (timeSig: string) => {
    const [beats, beatValue] = timeSig.split('/').map(Number);
    setMidiData({ ...midiData, timeSignature: [beats, beatValue] });
  };

  const handleTempoChange = (tempo: number) => {
    setMidiData({ ...midiData, tempo });
  };

  const saveToLibrary = async () => {
    if (!auth.currentUser) { toast.error('Please login to save'); return; }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'pieces'), {
        userId: auth.currentUser.uid,
        name: pieceName,
        midiData,
        instrument: midiData.instrument,
        clef: midiData.clef,
        key: midiData.key,
        bpm: midiData.tempo,
        timeSignature: `${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        shared: false
      });
      toast.success('Saved to library');
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const createShareLink = async () => {
    if (!auth.currentUser) { toast.error('Please login to share'); return; }
    setIsSaving(true);
    try {
      const shareId = Math.random().toString(36).substring(7);
      await setDoc(doc(db, 'sharedPieces', shareId), {
        pieceId: shareId,
        midiData,
        instrument: midiData.instrument,
        clef: midiData.clef,
        key: midiData.key,
        bpm: midiData.tempo,
        timeSignature: `${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`,
        createdAt: new Date(),
        sharedBy: auth.currentUser.uid
      });
      await navigator.clipboard.writeText(`${window.location.origin}/share/${shareId}`);
      toast.success('Share link copied');
    } catch {
      toast.error('Failed to share');
    } finally {
      setIsSaving(false);
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');
    :root {
      --bg: #05080F; --surface: #080C14; --surface2: #0C1220;
      --gold: #C9A84C; --gold-dim: #C9A84C18; --gold-border: #C9A84C25;
      --text: #EEF2FF; --text-muted: #EEF2FF55; --text-dim: #EEF2FF22;
      --serif: 'Playfair Display', Georgia, serif;
      --mono: 'DM Mono', monospace;
      --body: 'Crimson Pro', Georgia, serif;
    }
    .dash-root { display: flex; min-height: 100vh; background: var(--bg); color: var(--text); }
    .dash-main { flex: 1; margin-left: 0; padding: 88px 48px 48px; }
    .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 1px solid var(--gold-border); }
    .dash-title { font-family: var(--serif); font-size: 48px; font-weight: 900; color: var(--text); line-height: 1; margin-bottom: 6px; }
    .dash-title em { font-style: italic; color: var(--gold); }
    .dash-subtitle { font-family: var(--mono); font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--text-muted); }
    .dash-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .piece-name-input { background: transparent; border: none; border-bottom: 1px solid var(--gold-border); padding: 8px 0; font-family: var(--body); font-size: 16px; font-style: italic; color: var(--text-muted); outline: none; width: 180px; transition: border-color 0.2s, color 0.2s; }
    .piece-name-input:focus { border-color: var(--gold); color: var(--text); }
    .piece-name-input::placeholder { color: var(--text-dim); }
    .btn-save { display: flex; align-items: center; gap: 8px; padding: 10px 24px; background: var(--gold); color: var(--bg); border: none; cursor: pointer; font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; transition: background 0.2s; }
    .btn-save:hover:not(:disabled) { background: #E8C96A; }
    .btn-save:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-share { display: flex; align-items: center; gap: 8px; padding: 10px 24px; background: transparent; color: var(--gold); border: 1px solid var(--gold-border); cursor: pointer; font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; transition: border-color 0.2s, background 0.2s; }
    .btn-share:hover:not(:disabled) { border-color: var(--gold); background: var(--gold-dim); }
    .btn-share:disabled { opacity: 0.4; cursor: not-allowed; }
    .dash-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
    .dash-left { display: flex; flex-direction: column; gap: 20px; }
    .dash-right { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 88px; }
    .panel { border: 1px solid var(--gold-border); background: var(--surface); position: relative; }
    .panel::before { content: ''; position: absolute; top: -1px; left: -1px; width: 12px; height: 12px; border-top: 1px solid var(--gold); border-left: 1px solid var(--gold); opacity: 0.6; }
    .panel::after { content: ''; position: absolute; bottom: -1px; right: -1px; width: 12px; height: 12px; border-bottom: 1px solid var(--gold); border-right: 1px solid var(--gold); opacity: 0.6; }
    .panel-header { padding: 20px 24px 0; display: flex; align-items: center; justify-content: space-between; }
    .panel-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); opacity: 0.8; }
    .panel-body { padding: 20px 24px 24px; }
    .controls-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .octave-panel { padding: 24px; border: 1px solid var(--gold-border); background: var(--surface); position: relative; }
    .octave-label { font-family: var(--mono); font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
    .octave-value { color: var(--text); }
    .octave-slider { width: 100%; -webkit-appearance: none; height: 1px; background: var(--gold-border); outline: none; margin-bottom: 8px; }
    .octave-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: var(--gold); cursor: pointer; border: none; }
    .octave-ticks { display: flex; justify-content: space-between; }
    .octave-tick { font-family: var(--mono); font-size: 9px; color: var(--text-dim); letter-spacing: 0.1em; }
    .empty-state { padding: 80px 48px; text-align: center; border: 1px solid var(--gold-border); background: var(--surface); }
    .empty-icon { width: 56px; height: 56px; border: 1px solid var(--gold-border); display: flex; align-items: center; justify-content: center; margin: 0 auto 28px; color: var(--gold); }
    .empty-title { font-family: var(--serif); font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
    .empty-title em { font-style: italic; color: var(--gold); }
    .empty-desc { font-family: var(--body); font-size: 16px; font-weight: 300; font-style: italic; color: var(--text-muted); }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 1024px) {
      .dash-main { padding: 88px 20px 40px; }
      .dash-grid { grid-template-columns: 1fr; }
      .dash-right { position: static; }
      .dash-header { flex-direction: column; gap: 16px; }
      .controls-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 480px) {
      .dash-title { font-size: 32px; }
      .dash-actions { width: 100%; }
      .piece-name-input { width: 100%; }
      .btn-save, .btn-share { flex: 1; justify-content: center; }
    }
  `;

  const hasNotes = midiData.notes.length > 0;

  return (
    <>
      <style>{css}</style>
      <Toaster position="top-right" toastOptions={{ style: { background: '#0C1220', border: '1px solid #C9A84C25', color: '#EEF2FF', fontFamily: 'DM Mono, monospace', fontSize: 11, letterSpacing: '0.1em' } }} />
      <div className="dash-root">
        <Sidebar />
        <main className="dash-main">
          <div className="dash-header">
            <div>
              <h1 className="dash-title">Arco <em>Studio</em></h1>
              <p className="dash-subtitle">Create · Transcribe · Share</p>
            </div>
            <div className="dash-actions">
              <input
                className="piece-name-input"
                type="text"
                value={pieceName}
                onChange={(e) => setPieceName(e.target.value)}
                placeholder="Untitled Piece"
              />
              <button className="btn-save" onClick={saveToLibrary} disabled={isSaving || !hasNotes}>
                <Save size={13} /> Save
              </button>
              <button className="btn-share" onClick={createShareLink} disabled={isSaving || !hasNotes}>
                <Share2 size={13} /> Share
              </button>
            </div>
          </div>

          <div className="dash-grid">
            <div className="dash-left">
              {!hasNotes && (
                <div className="empty-state">
                  <div className="empty-icon"><Music2 size={22} /></div>
                  <h2 className="empty-title">Ready to <em>Create</em></h2>
                  <p className="empty-desc">Record or upload audio below to begin transcription</p>
                </div>
              )}

              <div className="panel">
                <div className="panel-header"><span className="panel-label">Audio Input</span></div>
                <div className="panel-body">
                  <AudioRecorder onTranscriptionComplete={handleTranscriptionComplete} />
                </div>
              </div>

              {hasNotes && (
                <>
                  <div className="panel">
                    <div className="panel-header"><span className="panel-label">Sheet Music</span></div>
                    <div className="panel-body"><SheetMusicRenderer midiData={midiData} /></div>
                  </div>

                  <div className="panel">
                    <div className="panel-header"><span className="panel-label">Playback</span></div>
                    <div className="panel-body"><PlaybackControls midiData={midiData} /></div>
                  </div>

                  <div className="controls-grid">
                    <div className="panel">
                      <div className="panel-header"><span className="panel-label">Instrument</span></div>
                      <div className="panel-body"><InstrumentSelector value={midiData.instrument} onChange={handleInstrumentChange} /></div>
                    </div>
                    <div className="panel">
                      <div className="panel-header"><span className="panel-label">Clef</span></div>
                      <div className="panel-body"><ClefSelector value={midiData.clef} onChange={handleClefChange} /></div>
                    </div>
                    <div className="panel">
                      <div className="panel-header"><span className="panel-label">Key</span></div>
                      <div className="panel-body"><KeyTransposer value={midiData.key} onChange={handleKeyChange} /></div>
                    </div>
                    <div className="panel">
                      <div className="panel-header"><span className="panel-label">Tempo & Time</span></div>
                      <div className="panel-body">
                        <TimeSignatureSelector
                          timeSignature={`${midiData.timeSignature[0]}/${midiData.timeSignature[1]}`}
                          tempo={midiData.tempo}
                          onTimeSignatureChange={handleTimeSignatureChange}
                          onTempoChange={handleTempoChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="octave-panel">
                    <div className="octave-label">
                      <span>Octave Shift</span>
                      <span className="octave-value">{midiData.octaveShift > 0 ? `+${midiData.octaveShift}` : midiData.octaveShift}</span>
                    </div>
                    <input
                      className="octave-slider"
                      type="range" min="-2" max="2" step="1"
                      value={midiData.octaveShift}
                      onChange={(e) => handleOctaveShift(parseInt(e.target.value))}
                    />
                    <div className="octave-ticks">
                      {['-2', '-1', '0', '+1', '+2'].map(t => <span className="octave-tick" key={t}>{t}</span>)}
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-header"><span className="panel-label">Chord Chart</span></div>
                    <div className="panel-body"><ChordChart midiData={midiData} /></div>
                  </div>

                  <div className="panel">
                    <div className="panel-header"><span className="panel-label">Band Arranger</span></div>
                    <div className="panel-body"><BandArranger midiData={midiData} /></div>
                  </div>

                  <div className="panel">
                    <div className="panel-header"><span className="panel-label">Practice Mode</span></div>
                    <div className="panel-body"><PracticeMode midiData={midiData} /></div>
                  </div>

                  <div className="panel">
                    <div className="panel-header"><span className="panel-label">Export</span></div>
                    <div className="panel-body"><ExportButtons midiData={midiData} /></div>
                  </div>
                </>
              )}
            </div>

            <div className="dash-right">
              <div className="panel">
                <div className="panel-header"><span className="panel-label">AI Assistant</span></div>
                <div className="panel-body"><GeminiAssistant midiData={midiData} /></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

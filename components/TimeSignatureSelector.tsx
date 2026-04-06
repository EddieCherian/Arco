'use client';

interface TimeSignatureSelectorProps {
  timeSignature: string;
  tempo: number;
  onTimeSignatureChange: (timeSig: string) => void;
  onTempoChange: (tempo: number) => void;
}

const timeSignatures = ['2/4', '3/4', '4/4', '6/8', '9/8', '12/8', '5/4', '7/8'];

const tempoMarks = [
  { label: 'Largo', bpm: 50 },
  { label: 'Andante', bpm: 80 },
  { label: 'Moderato', bpm: 108 },
  { label: 'Allegro', bpm: 140 },
  { label: 'Presto', bpm: 200 },
];

const css = `
  .ts-wrap { display: flex; flex-direction: column; gap: 20px; }
  .ts-label { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: #C9A84C; opacity: 0.6; margin-bottom: 10px; }
  .ts-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
  .ts-btn { padding: 10px 4px; background: transparent; border: 1px solid #C9A84C15; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.05em; color: #EEF2FF33; transition: border-color 0.2s, color 0.2s, background 0.2s; text-align: center; }
  .ts-btn:hover { border-color: #C9A84C40; color: #EEF2FF88; background: #C9A84C06; }
  .ts-btn.active { border-color: #C9A84C; color: #C9A84C; background: #C9A84C0A; }
  .tempo-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .tempo-value { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 700; color: #C9A84C; line-height: 1; }
  .tempo-unit { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.2em; text-transform: uppercase; color: #EEF2FF22; }
  .tempo-mark { font-family: 'Crimson Pro', Georgia, serif; font-size: 14px; font-style: italic; color: #EEF2FF44; }
  .tempo-slider { width: 100%; -webkit-appearance: none; height: 1px; background: #C9A84C18; outline: none; cursor: pointer; margin-bottom: 8px; }
  .tempo-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; background: #C9A84C; cursor: pointer; }
  .tempo-marks { display: flex; justify-content: space-between; }
  .tempo-mark-label { font-family: 'DM Mono', monospace; font-size: 7px; letter-spacing: 0.1em; text-transform: uppercase; color: #EEF2FF15; }
`;

export function TimeSignatureSelector({ timeSignature, tempo, onTimeSignatureChange, onTempoChange }: TimeSignatureSelectorProps) {
  const currentMark = tempoMarks.reduce((prev, curr) =>
    Math.abs(curr.bpm - tempo) < Math.abs(prev.bpm - tempo) ? curr : prev
  );

  return (
    <>
      <style>{css}</style>
      <div className="ts-wrap">
        <div>
          <div className="ts-label">Time Signature</div>
          <div className="ts-grid">
            {timeSignatures.map(ts => (
              <button key={ts} className={`ts-btn ${timeSignature === ts ? 'active' : ''}`} onClick={() => onTimeSignatureChange(ts)}>
                {ts}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="ts-label">Tempo</div>
          <div className="tempo-row">
            <div>
              <div className="tempo-value">{tempo}</div>
              <div className="tempo-unit">BPM</div>
            </div>
            <div className="tempo-mark">{currentMark.label}</div>
          </div>
          <input
            className="tempo-slider"
            type="range" min="40" max="240" value={tempo}
            onChange={(e) => onTempoChange(parseInt(e.target.value))}
          />
          <div className="tempo-marks">
            {tempoMarks.map(m => <span key={m.label} className="tempo-mark-label">{m.label}</span>)}
          </div>
        </div>
      </div>
    </>
  );
}

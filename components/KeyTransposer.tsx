'use client';

interface KeyTransposerProps {
  value: string;
  onChange: (key: string) => void;
}

const majorKeys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
const minorKeys = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'];

const css = `
  .key-section-label { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: #C9A84C; opacity: 0.5; margin-bottom: 8px; }
  .key-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 16px; }
  .key-btn { padding: 8px 4px; background: transparent; border: 1px solid #C9A84C15; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: #EEF2FF33; transition: border-color 0.2s, color 0.2s, background 0.2s; text-align: center; }
  .key-btn:hover { border-color: #C9A84C40; color: #EEF2FF88; background: #C9A84C06; }
  .key-btn.active { border-color: #C9A84C; color: #C9A84C; background: #C9A84C0A; }
  .key-hint { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: #EEF2FF22; }
`;

export function KeyTransposer({ value, onChange }: KeyTransposerProps) {
  return (
    <>
      <style>{css}</style>
      <div>
        <div className="key-section-label">Major</div>
        <div className="key-grid">
          {majorKeys.map(key => (
            <button key={key} className={`key-btn ${value === key ? 'active' : ''}`} onClick={() => onChange(key)}>
              {key}
            </button>
          ))}
        </div>
        <div className="key-section-label">Minor</div>
        <div className="key-grid">
          {minorKeys.map(key => (
            <button key={key} className={`key-btn ${value === key ? 'active' : ''}`} onClick={() => onChange(key)}>
              {key}
            </button>
          ))}
        </div>
        <p className="key-hint">Transposes all notes</p>
      </div>
    </>
  );
}

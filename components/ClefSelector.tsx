'use client';

interface ClefSelectorProps {
  value: string;
  onChange: (clef: string) => void;
}

const clefs = [
  { value: 'treble', label: 'Treble', symbol: '𝄞', range: 'C4–A6' },
  { value: 'bass', label: 'Bass', symbol: '𝄢', range: 'E2–C4' },
  { value: 'alto', label: 'Alto', symbol: '𝄡', range: 'C3–F5' },
  { value: 'tenor', label: 'Tenor', symbol: '𝄡', range: 'A2–E4' },
];

const css = `
  .clef-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .clef-btn { padding: 12px; background: transparent; border: 1px solid #C9A84C18; cursor: pointer; text-align: left; transition: border-color 0.2s, background 0.2s; position: relative; }
  .clef-btn:hover { border-color: #C9A84C40; background: #C9A84C06; }
  .clef-btn.active { border-color: #C9A84C; background: #C9A84C0A; }
  .clef-btn.active::before { content: ''; position: absolute; top: -1px; left: -1px; width: 8px; height: 8px; border-top: 1px solid #C9A84C; border-left: 1px solid #C9A84C; }
  .clef-symbol { font-size: 20px; color: #C9A84C; line-height: 1; margin-bottom: 6px; }
  .clef-name { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #EEF2FF88; display: block; margin-bottom: 2px; }
  .clef-btn.active .clef-name { color: #C9A84C; }
  .clef-range { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.1em; color: #EEF2FF22; }
`;

export function ClefSelector({ value, onChange }: ClefSelectorProps) {
  return (
    <>
      <style>{css}</style>
      <div className="clef-grid">
        {clefs.map(clef => (
          <button
            key={clef.value}
            className={`clef-btn ${value === clef.value ? 'active' : ''}`}
            onClick={() => onChange(clef.value)}
          >
            <div className="clef-symbol">{clef.symbol}</div>
            <span className="clef-name">{clef.label}</span>
            <span className="clef-range">{clef.range}</span>
          </button>
        ))}
      </div>
    </>
  );
}

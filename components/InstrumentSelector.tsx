'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface InstrumentSelectorProps {
  value: string;
  onChange: (instrument: string) => void;
}

const instruments = [
  { value: 'piano', label: 'Piano', family: 'Keys' },
  { value: 'violin', label: 'Violin', family: 'Strings' },
  { value: 'cello', label: 'Cello', family: 'Strings' },
  { value: 'viola', label: 'Viola', family: 'Strings' },
  { value: 'guitar', label: 'Guitar', family: 'Strings' },
  { value: 'bass', label: 'Bass', family: 'Strings' },
  { value: 'flute', label: 'Flute', family: 'Woodwinds' },
  { value: 'clarinet', label: 'Clarinet', family: 'Woodwinds' },
  { value: 'saxophone', label: 'Saxophone', family: 'Woodwinds' },
  { value: 'trumpet', label: 'Trumpet', family: 'Brass' },
  { value: 'soprano', label: 'Soprano', family: 'Voice' },
  { value: 'alto', label: 'Alto', family: 'Voice' },
  { value: 'tenor', label: 'Tenor', family: 'Voice' },
  { value: 'bass_voice', label: 'Bass', family: 'Voice' },
];

const families = ['Keys', 'Strings', 'Woodwinds', 'Brass', 'Voice'];

const css = `
  .ins-wrap { position: relative; }
  .ins-trigger { width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: transparent; border: 1px solid #C9A84C20; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #EEF2FF88; transition: border-color 0.2s, color 0.2s; }
  .ins-trigger:hover { border-color: #C9A84C44; color: #EEF2FF; }
  .ins-trigger.open { border-color: #C9A84C66; color: #C9A84C; }
  .ins-chevron { transition: transform 0.2s; flex-shrink: 0; }
  .ins-chevron.open { transform: rotate(180deg); }
  .ins-backdrop { position: fixed; inset: 0; z-index: 10; }
  .ins-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #07090E; border: 1px solid #C9A84C20; z-index: 20; max-height: 260px; overflow-y: auto; }
  .ins-dropdown::-webkit-scrollbar { width: 3px; }
  .ins-dropdown::-webkit-scrollbar-thumb { background: #C9A84C25; }
  .ins-family { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: #C9A84C; opacity: 0.5; padding: 10px 14px 6px; border-top: 1px solid #C9A84C12; }
  .ins-family:first-child { border-top: none; }
  .ins-option { width: 100%; text-align: left; padding: 9px 14px; background: transparent; border: none; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #EEF2FF44; transition: color 0.2s, background 0.2s; }
  .ins-option:hover { color: #EEF2FF99; background: #C9A84C08; }
  .ins-option.selected { color: #C9A84C; }
  .ins-hint { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.1em; color: #EEF2FF22; margin-top: 8px; }
`;

export function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = instruments.find(i => i.value === value);

  return (
    <>
      <style>{css}</style>
      <div className="ins-wrap">
        <button className={`ins-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
          <span>{selected?.label || 'Select instrument'}</span>
          <ChevronDown size={12} className={`ins-chevron ${isOpen ? 'open' : ''}`} color="currentColor" />
        </button>

        {isOpen && (
          <>
            <div className="ins-backdrop" onClick={() => setIsOpen(false)} />
            <div className="ins-dropdown">
              {families.map(family => {
                const group = instruments.filter(i => i.family === family);
                if (!group.length) return null;
                return (
                  <div key={family}>
                    <div className="ins-family">{family}</div>
                    {group.map(inst => (
                      <button
                        key={inst.value}
                        className={`ins-option ${value === inst.value ? 'selected' : ''}`}
                        onClick={() => { onChange(inst.value); setIsOpen(false); }}
                      >
                        {inst.label}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <p className="ins-hint">{value.includes('voice') ? 'Monophonic' : 'Polyphonic'}</p>
    </>
  );
}

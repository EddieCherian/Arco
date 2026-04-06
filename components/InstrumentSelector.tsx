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
  { value: 'flute', label: 'Flute', family: 'Woodwinds' },
  { value: 'trumpet', label: 'Trumpet', family: 'Brass' },
  { value: 'clarinet', label: 'Clarinet', family: 'Woodwinds' },
  { value: 'saxophone', label: 'Saxophone', family: 'Woodwinds' },
  { value: 'guitar', label: 'Guitar', family: 'Strings' },
  { value: 'bass', label: 'Bass', family: 'Strings' },
  { value: 'soprano', label: 'Soprano Voice', family: 'Voice' },
  { value: 'alto', label: 'Alto Voice', family: 'Voice' },
  { value: 'tenor', label: 'Tenor Voice', family: 'Voice' },
  { value: 'bass_voice', label: 'Bass Voice', family: 'Voice' },
];

export function InstrumentSelector({ value, onChange }: InstrumentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedInstrument = instruments.find(i => i.value === value);

  return (
    <div className="bg-[#0a0f1a] rounded-lg p-4 border border-[#C9A84C]/20">
      <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
        Instrument
      </label>
      
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] hover:border-[#C9A84C] transition-colors"
        >
          <span>{selectedInstrument?.label || 'Select instrument'}</span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0a0f1a] border border-[#C9A84C]/20 rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
              {Object.entries(
                instruments.reduce((acc, inst) => {
                  if (!acc[inst.family]) acc[inst.family] = [];
                  acc[inst.family].push(inst);
                  return acc;
                }, {} as Record<string, typeof instruments>)
              ).map(([family, familyInstruments]) => (
                <div key={family}>
                  <div className="px-4 py-2 text-xs font-semibold text-[#C9A84C] bg-[#05080F] border-b border-[#C9A84C]/10">
                    {family}
                  </div>
                  {familyInstruments.map((instrument) => (
                    <button
                      key={instrument.value}
                      onClick={() => {
                        onChange(instrument.value);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-[#C9A84C]/10 transition-colors ${
                        value === instrument.value ? 'text-[#C9A84C] bg-[#C9A84C]/5' : 'text-[#EEF2FF]'
                      }`}
                    >
                      {instrument.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <p className="text-xs text-[#EEF2FF]/40 mt-2">
        {value.includes('voice') ? 'Monophonic voice mode' : 'Polyphonic instrument mode'}
      </p>
    </div>
  );
}
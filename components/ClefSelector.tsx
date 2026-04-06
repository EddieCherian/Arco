'use client';

interface ClefSelectorProps {
  value: string;
  onChange: (clef: string) => void;
}

const clefs = [
  { value: 'treble', label: '𝄞 Treble', range: 'C4 - A6' },
  { value: 'bass', label: '𝄢 Bass', range: 'E2 - C4' },
  { value: 'alto', label: '𝄡 Alto', range: 'C3 - F5' },
  { value: 'tenor', label: '𝄡 Tenor', range: 'A2 - E4' },
];

export function ClefSelector({ value, onChange }: ClefSelectorProps) {
  return (
    <div className="bg-[#0a0f1a] rounded-lg p-4 border border-[#C9A84C]/20">
      <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
        Clef
      </label>
      
      <div className="grid grid-cols-2 gap-2">
        {clefs.map((clef) => (
          <button
            key={clef.value}
            onClick={() => onChange(clef.value)}
            className={`px-3 py-2 rounded-lg text-left transition-all ${
              value === clef.value
                ? 'bg-[#C9A84C] text-[#05080F]'
                : 'bg-[#05080F] border border-[#C9A84C]/30 text-[#EEF2FF] hover:border-[#C9A84C]'
            }`}
          >
            <div className="font-medium">{clef.label}</div>
            <div className="text-xs opacity-70">{clef.range}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
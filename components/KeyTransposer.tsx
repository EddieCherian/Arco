'use client';

interface KeyTransposerProps {
  value: string;
  onChange: (key: string) => void;
}

const majorKeys = [
  'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'
];

const minorKeys = [
  'Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm'
];

export function KeyTransposer({ value, onChange }: KeyTransposerProps) {
  return (
    <div className="bg-[#0a0f1a] rounded-lg p-4 border border-[#C9A84C]/20">
      <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
        Key Signature
      </label>
      
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] focus:border-[#C9A84C] focus:outline-none transition-colors"
      >
        <optgroup label="Major Keys">
          {majorKeys.map((key) => (
            <option key={key} value={key}>
              {key} Major
            </option>
          ))}
        </optgroup>
        <optgroup label="Minor Keys">
          {minorKeys.map((key) => (
            <option key={key} value={key}>
              {key} Minor
            </option>
          ))}
        </optgroup>
      </select>
      
      <p className="text-xs text-[#EEF2FF]/40 mt-2">
        Transposes all notes to selected key
      </p>
    </div>
  );
}
'use client';

interface TimeSignatureSelectorProps {
  timeSignature: string;
  tempo: number;
  onTimeSignatureChange: (timeSig: string) => void;
  onTempoChange: (tempo: number) => void;
}

const timeSignatures = [
  '2/4', '3/4', '4/4', '6/8', '9/8', '12/8', '5/4', '7/8'
];

export function TimeSignatureSelector({ 
  timeSignature, 
  tempo, 
  onTimeSignatureChange, 
  onTempoChange 
}: TimeSignatureSelectorProps) {
  return (
    <div className="bg-[#0a0f1a] rounded-lg p-4 border border-[#C9A84C]/20">
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
            Time Signature
          </label>
          <select
            value={timeSignature}
            onChange={(e) => onTimeSignatureChange(e.target.value)}
            className="w-full px-4 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] focus:border-[#C9A84C] focus:outline-none transition-colors"
          >
            {timeSignatures.map((ts) => (
              <option key={ts} value={ts}>
                {ts}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
            Tempo (BPM): {tempo}
          </label>
          <input
            type="range"
            min="40"
            max="240"
            value={tempo}
            onChange={(e) => onTempoChange(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-[#EEF2FF]/40 mt-1">
            <span>Largo</span>
            <span>Andante</span>
            <span>Moderato</span>
            <span>Allegro</span>
            <span>Presto</span>
          </div>
        </div>
      </div>
    </div>
  );
}
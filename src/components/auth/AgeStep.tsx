import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const MIN_AGE = 16;
const MAX_AGE = 100;

const blueGlassStyle = {
  background: 'linear-gradient(180deg, rgba(60, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.95) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
};

interface AgeStepProps {
  onNext: (age: number) => void;
}

const AgeStep: React.FC<AgeStepProps> = ({ onNext }) => {
  const [selectedAge, setSelectedAge] = useState<number | ''>('');

  const ages = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-black">How old are you?</h2>
      </div>

      {/* Native platform select with custom wrapper */}
      <div className="relative w-full">
        <select
          value={selectedAge}
          onChange={(e) => setSelectedAge(Number(e.target.value))}
          className="w-full h-12 pl-4 pr-10 rounded-xl border border-black/10 bg-black/[0.03] text-base font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          style={{ color: selectedAge === '' ? 'rgba(0,0,0,0.4)' : 'black' }}
        >
          <option value="" disabled>Select age</option>
          {ages.map((age) => (
            <option key={age} value={age} style={{ color: 'black' }}>
              {age} years old
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 pointer-events-none" />
      </div>

      <Button
        onClick={() => selectedAge !== '' && onNext(selectedAge)}
        className="w-full py-3 h-auto rounded-full font-semibold text-white border border-white/20 shadow-lg hover:opacity-90"
        style={blueGlassStyle}
        disabled={selectedAge === ''}
      >
        Continue
      </Button>
    </div>
  );
};

export default AgeStep;

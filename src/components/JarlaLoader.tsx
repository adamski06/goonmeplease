import React, { useEffect, useState } from 'react';
import jarlaLogo from '@/assets/jarla-logo.png';

const JarlaLoader: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6">
      <img
        src={jarlaLogo}
        alt="Jarla"
        className="h-8 brightness-0 invert opacity-60"
      />
      <div className="w-24 h-[2px] rounded-full overflow-hidden bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-75 ease-linear bg-white/40"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default JarlaLoader;

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      <img
        src={jarlaLogo}
        alt="Jarla"
        className="h-8 opacity-40"
        style={{ filter: 'grayscale(100%)' }}
      />
      <div className="w-24 h-[2px] rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
        <div
          className="h-full rounded-full transition-all duration-75 ease-linear"
          style={{
            width: `${progress}%`,
            background: 'hsl(var(--muted-foreground) / 0.4)',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
      </div>
    </div>
  );
};

export default JarlaLoader;

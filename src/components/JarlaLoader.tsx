import React from 'react';
import jarlaLogo from '@/assets/jarla-logo.png';

const JarlaLoader: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black gap-6">
      <img
        src={jarlaLogo}
        alt="Jarla"
        className="h-8 brightness-0 invert opacity-60"
      />
      <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );
};

export default JarlaLoader;

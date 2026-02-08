import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const MIN_AGE = 16;
const MAX_AGE = 100;
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

interface AgeStepProps {
  onNext: (age: number) => void;
}

const AgeStep: React.FC<AgeStepProps> = ({ onNext }) => {
  const [selectedAge, setSelectedAge] = useState(18);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const ages = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);

  const scrollToAge = useCallback((age: number, smooth = true) => {
    if (scrollRef.current) {
      const index = age - MIN_AGE;
      const scrollTop = index * ITEM_HEIGHT;
      scrollRef.current.scrollTo({
        top: scrollTop,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    setTimeout(() => scrollToAge(18, false), 50);
  }, [scrollToAge]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, ages.length - 1));
    const newAge = MIN_AGE + clampedIndex;

    setSelectedAge(newAge);

    scrollTimeoutRef.current = setTimeout(() => {
      scrollToAge(newAge, true);
    }, 80);
  };

  const halfVisible = Math.floor(VISIBLE_ITEMS / 2);
  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">How old are you?</h2>
      </div>

      {/* Native iOS-style picker */}
      <div className="relative mx-auto w-full">
        {/* Top/bottom fade masks */}
        <div 
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none" 
          style={{ 
            height: halfVisible * ITEM_HEIGHT,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0) 100%)'
          }} 
        />
        <div 
          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" 
          style={{ 
            height: halfVisible * ITEM_HEIGHT,
            background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0) 100%)'
          }} 
        />

        {/* Selection row highlight — thin separator lines like iOS */}
        <div
          className="absolute left-0 right-0 z-[5] pointer-events-none"
          style={{
            top: halfVisible * ITEM_HEIGHT,
            height: ITEM_HEIGHT,
          }}
        >
          <div className="absolute top-0 left-4 right-4 h-px bg-black/12" />
          <div className="absolute bottom-0 left-4 right-4 h-px bg-black/12" />
        </div>

        {/* Scroll container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto"
          style={{
            height: containerHeight,
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <style>{`div::-webkit-scrollbar { display: none; }`}</style>

          {/* Top spacer */}
          <div style={{ height: halfVisible * ITEM_HEIGHT }} />

          {ages.map((age) => {
            const distance = Math.abs(age - selectedAge);
            return (
              <div
                key={age}
                className="flex items-center justify-center select-none"
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
                  fontSize: distance === 0 ? '22px' : distance === 1 ? '18px' : '16px',
                  fontWeight: distance === 0 ? 600 : 400,
                  color: distance === 0 ? 'hsl(220, 20%, 10%)' : distance === 1 ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.18)',
                  transition: 'font-size 0.1s ease, color 0.1s ease, font-weight 0.1s ease',
                  cursor: 'pointer',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif',
                  letterSpacing: '-0.02em',
                }}
                onClick={() => {
                  setSelectedAge(age);
                  scrollToAge(age);
                }}
              >
                {age}
              </div>
            );
          })}

          {/* Bottom spacer */}
          <div style={{ height: halfVisible * ITEM_HEIGHT }} />
        </div>
      </div>

      <Button
        onClick={() => onNext(selectedAge)}
        className="w-full py-3 h-auto rounded-full font-semibold text-white border border-white/20 shadow-lg"
        style={{
          background: 'linear-gradient(180deg, rgba(60, 130, 246, 0.85) 0%, rgba(37, 99, 235, 0.95) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        Continue
      </Button>
    </div>
  );
};

export default AgeStep;

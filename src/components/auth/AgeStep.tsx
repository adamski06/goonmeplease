import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const MIN_AGE = 16;
const MAX_AGE = 100;
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

interface AgeStepProps {
  onNext: (age: number) => void;
}

const AgeStep: React.FC<AgeStepProps> = ({ onNext }) => {
  const [selectedAge, setSelectedAge] = useState(18);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
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
    // Initial scroll to default age
    setTimeout(() => scrollToAge(18, false), 50);
  }, [scrollToAge]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    isScrollingRef.current = true;

    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, ages.length - 1));
    const newAge = MIN_AGE + clampedIndex;

    setSelectedAge(newAge);

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      scrollToAge(newAge, true);
    }, 100);
  };

  const halfVisible = Math.floor(VISIBLE_ITEMS / 2);
  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-foreground">How old are you?</h2>
        <p className="text-sm text-muted-foreground">You must be at least 16 to use Jarla</p>
      </div>

      {/* iOS-style scroll picker */}
      <div className="relative mx-auto w-full max-w-[200px]">
        {/* Fade overlays */}
        <div className="absolute top-0 left-0 right-0 h-[88px] bg-gradient-to-b from-white/90 to-transparent z-10 pointer-events-none rounded-t-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-[88px] bg-gradient-to-t from-white/90 to-transparent z-10 pointer-events-none rounded-b-2xl" />

        {/* Selection highlight */}
        <div
          className="absolute left-2 right-2 z-[5] rounded-xl bg-black/5 border border-black/10"
          style={{
            top: halfVisible * ITEM_HEIGHT,
            height: ITEM_HEIGHT,
          }}
        />

        {/* Scrollable area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-y-auto scrollbar-hide"
          style={{
            height: containerHeight,
            scrollSnapType: 'y mandatory',
          }}
        >
          {/* Top padding */}
          <div style={{ height: halfVisible * ITEM_HEIGHT }} />

          {ages.map((age) => {
            const isSelected = age === selectedAge;
            return (
              <div
                key={age}
                className={`flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
                  isSelected
                    ? 'text-foreground font-semibold text-2xl'
                    : Math.abs(age - selectedAge) === 1
                    ? 'text-muted-foreground text-lg'
                    : 'text-muted-foreground/40 text-base'
                }`}
                style={{
                  height: ITEM_HEIGHT,
                  scrollSnapAlign: 'center',
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

          {/* Bottom padding */}
          <div style={{ height: halfVisible * ITEM_HEIGHT }} />
        </div>
      </div>

      <Button
        onClick={() => onNext(selectedAge)}
        className="w-full py-3 h-auto rounded-full bg-foreground text-background hover:bg-foreground/80 font-semibold"
      >
        Continue
      </Button>
    </div>
  );
};

export default AgeStep;

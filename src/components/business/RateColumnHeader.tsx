import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface RateColumnHeaderProps {
  label: string;
  tooltip?: string;
}

const RateColumnHeader: React.FC<RateColumnHeaderProps> = ({ label, tooltip }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => tooltip && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Default state */}
      <div className={`rounded-md bg-muted/50 px-4 py-2.5 flex items-center justify-between gap-1.5 ${tooltip ? 'cursor-default' : ''}`}>
        <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</span>
        {tooltip && <Info className="h-3 w-3 text-muted-foreground shrink-0" />}
      </div>

      {/* Expanded node — grows upward from the header */}
      {tooltip && (
        <div
          className="absolute bottom-0 left-0 right-0 z-50"
          style={{
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? 'auto' : 'none',
            transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div
            className="rounded-md border border-border bg-card shadow-lg px-4 pt-3 pb-3"
            style={{
              transform: hovered ? 'translateY(0)' : 'translateY(4px)',
              transition: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</span>
              <Info className="h-3 w-3 text-muted-foreground shrink-0" />
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{tooltip}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateColumnHeader;

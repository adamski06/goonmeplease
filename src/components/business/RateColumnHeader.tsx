import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface RateColumnHeaderProps {
  label: string;
  tooltip?: string;
}

const RateColumnHeader: React.FC<RateColumnHeaderProps> = ({ label, tooltip }) => {
  const [hovered, setHovered] = useState(false);
  const expanded = tooltip && hovered;

  return (
    <div
      className="relative"
      style={{ height: 34 }}
      onMouseEnter={() => tooltip && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* The node itself, anchored to bottom so it grows upward */}
      <div
        className="absolute left-0 right-0 bottom-0 rounded-md bg-muted/50 px-4 overflow-hidden z-10"
        style={{
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          ...(expanded
            ? { zIndex: 20, boxShadow: '0 -4px 16px hsla(0,0%,0%,0.12)' }
            : {}),
        }}
      >
        {/* Description text — sits above the label, revealed on expand */}
        {tooltip && (
          <div
            style={{
              maxHeight: expanded ? '200px' : '0px',
              opacity: expanded ? 1 : 0,
              transition: 'max-height 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 250ms ease',
              overflow: 'hidden',
            }}
          >
            <p className="text-xs leading-relaxed text-foreground pt-3 pb-2">{tooltip}</p>
          </div>
        )}

        {/* Label row — always visible */}
        <div className="flex items-center justify-between gap-1.5 py-2.5">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</span>
          {tooltip && <Info className="h-3 w-3 text-muted-foreground shrink-0" />}
        </div>
      </div>
    </div>
  );
};

export default RateColumnHeader;

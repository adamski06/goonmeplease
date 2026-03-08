import React, { useState } from 'react';
import { Info, Plus } from 'lucide-react';

interface RateColumnHeaderProps {
  label: string;
  tooltip?: string;
  avg?: string;
  onAddTier?: () => void;
}

const RateColumnHeader: React.FC<RateColumnHeaderProps> = ({ label, tooltip, avg, onAddTier }) => {
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
        {/* Description + AVG — sits above the label, revealed on expand */}
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
            {avg && (
              <div className="flex items-center gap-1.5 pb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[11px] text-muted-foreground">avg on jarla right now: <span className="font-bold text-foreground">{avg}</span></span>
              </div>
            )}
          </div>
        )}

        {/* Label row — always visible */}
        <div className="flex items-center justify-between gap-1.5 py-2.5">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wide">{label}</span>
          <div className="flex items-center gap-1">
            {onAddTier && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddTier(); }}
                className="h-4 w-4 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Add rate tier"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            {tooltip && <Info className="h-3 w-3 text-muted-foreground shrink-0" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateColumnHeader;

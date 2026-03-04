import React, { useState } from 'react';

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
      <div className={`rounded-md bg-muted/50 px-4 py-2.5 text-xs font-semibold text-foreground uppercase tracking-wide ${tooltip ? 'cursor-default' : ''}`}>
        {label}
      </div>

      {/* Tooltip expanding upward */}
      {tooltip && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1.5 z-50 pointer-events-none"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0) scaleY(1)' : 'translateY(4px) scaleY(0.96)',
            transformOrigin: 'bottom center',
            transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1), transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <div className="rounded-lg border border-border bg-card px-3.5 py-3 shadow-lg">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">{label}</p>
            <p className="text-[11px] leading-relaxed text-muted-foreground">{tooltip}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateColumnHeader;

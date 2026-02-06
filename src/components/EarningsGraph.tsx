import React from 'react';

interface Tier {
  minViews: number;
  maxViews: number | null;
  rate: number;
}

interface EarningsGraphProps {
  tiers: Tier[];
  maxEarnings: number;
}

const formatViews = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(0)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
};

const formatEarnings = (amount: number): string => {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toLocaleString();
};

const EarningsGraph: React.FC<EarningsGraphProps> = ({ tiers, maxEarnings }) => {
  // Calculate data points from tiers (skip 0,0 origin label)
  const dataPoints: { views: number; earnings: number }[] = [];
  let cumEarnings = 0;

  for (const tier of tiers) {
    if (tier.maxViews) {
      const tierViews = tier.maxViews - tier.minViews;
      cumEarnings += (tierViews / 1000) * tier.rate;
      dataPoints.push({ views: tier.maxViews, earnings: Math.min(cumEarnings, maxEarnings) });
    } else {
      const remaining = maxEarnings - cumEarnings;
      const addViews = (remaining / tier.rate) * 1000;
      dataPoints.push({ views: tier.minViews + addViews, earnings: maxEarnings });
    }
  }

  const maxV = dataPoints[dataPoints.length - 1]?.views || 1;

  // Convert to 0-1 range (x: left→right, y: 0=bottom, 1=top)
  const normalized = dataPoints.map((p) => ({
    nx: p.views / maxV,
    ny: p.earnings / maxEarnings,
    earnings: p.earnings,
    views: p.views,
  }));

  // SVG viewBox: 0,0 is top-left. We use a 200x200 viewBox for precision.
  const vw = 200;
  const vh = 200;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const pw = vw - margin.left - margin.right;
  const ph = vh - margin.top - margin.bottom;

  const toSvg = (nx: number, ny: number) => ({
    sx: margin.left + nx * pw,
    sy: margin.top + (1 - ny) * ph, // flip Y
  });

  const origin = toSvg(0, 0);
  const svgPts = normalized.map((p) => ({ ...toSvg(p.nx, p.ny), ...p }));

  // Build paths
  const lineCoords = [origin, ...svgPts.map((p) => ({ sx: p.sx, sy: p.sy }))];
  const linePath = lineCoords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.sx},${c.sy}`).join(' ');
  const fillPath = `${linePath} L${lineCoords[lineCoords.length - 1].sx},${origin.sy} L${origin.sx},${origin.sy} Z`;

  return (
    <div
      className="rounded-xl p-4 mt-3"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <h4 className="text-xs font-semibold text-white/70 mb-3 font-montserrat uppercase tracking-wider">
        Earnings by views
      </h4>

      <svg viewBox={`0 0 ${vw} ${vh}`} className="w-full" style={{ height: 200, display: 'block' }}>
        <defs>
          <linearGradient id="egFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>

        {/* Bottom axis */}
        <line x1={margin.left} y1={origin.sy} x2={vw - margin.right} y2={origin.sy} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        {/* Right axis */}
        <line x1={vw - margin.right} y1={margin.top} x2={vw - margin.right} y2={origin.sy} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        {/* Fill area */}
        <path d={fillPath} fill="url(#egFill)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

        {/* Waypoint dots + labels */}
        {svgPts.map((p, i) => {
          const isLast = i === svgPts.length - 1;
          // Label position: place to the left for last point, right for others
          const labelX = isLast ? p.sx - 4 : p.sx + 4;
          const anchor = isLast ? 'end' : 'start';

          return (
            <g key={i}>
              {/* Glow */}
              <circle cx={p.sx} cy={p.sy} r="4" fill="rgba(255,255,255,0.15)" />
              {/* Dot */}
              <circle cx={p.sx} cy={p.sy} r="2.5" fill="white" />
              {/* Earnings label */}
              <text
                x={labelX}
                y={p.sy - 4}
                fill="white"
                fontSize="7"
                fontWeight="700"
                fontFamily="Montserrat, sans-serif"
                textAnchor={anchor}
              >
                {formatEarnings(p.earnings)} sek
              </text>
              {/* Views label */}
              <text
                x={labelX}
                y={p.sy + 5}
                fill="rgba(255,255,255,0.5)"
                fontSize="5.5"
                fontFamily="Plus Jakarta Sans, sans-serif"
                textAnchor={anchor}
              >
                {formatViews(p.views)} views
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default EarningsGraph;

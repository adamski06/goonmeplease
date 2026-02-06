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
  // Calculate cumulative earnings at each tier boundary
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

  // Graph dimensions
  const pad = { top: 32, right: 8, bottom: 8, left: 8 };
  const w = 300;
  const h = 260;
  const gw = w - pad.left - pad.right;
  const gh = h - pad.top - pad.bottom;

  const ox = pad.left;
  const oy = pad.top + gh;

  // End point of the straight line (max earnings, max views) — top-right area
  const endX = pad.left + gw;
  const endY = pad.top;

  // ONE straight line from origin to end
  const linePath = `M${ox},${oy} L${endX},${endY}`;
  const fillPath = `${linePath} L${endX},${oy} Z`;

  // Place waypoints ON the straight line at each tier's proportional position
  const waypoints = dataPoints.map((p) => {
    const t = p.views / maxV; // 0-1 along the line
    return {
      x: ox + t * (endX - ox),
      y: oy + t * (endY - oy),
      earnings: p.earnings,
      views: p.views,
    };
  });

  return (
    <div
      className="rounded-xl mt-3 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <h4 className="text-xs font-semibold text-white/70 px-4 pt-3 pb-0 font-montserrat uppercase tracking-wider">
        Earnings by views
      </h4>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full block" style={{ height: 260 }}>
        <defs>
          <linearGradient id="egFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>

        {/* Bottom axis */}
        <line x1={pad.left} y1={oy} x2={w - pad.right} y2={oy} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        {/* Right axis */}
        <line x1={w - pad.right} y1={pad.top} x2={w - pad.right} y2={oy} stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />

        {/* Fill */}
        <path d={fillPath} fill="url(#egFill)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />

        {/* Origin dot - no label */}
        <circle cx={ox} cy={oy} r="3" fill="rgba(255,255,255,0.2)" />
        <circle cx={ox} cy={oy} r="1.5" fill="white" />

        {/* Waypoint dots + labels */}
        {waypoints.map((p, i) => {
          const isLast = i === waypoints.length - 1;
          const labelX = isLast ? p.x - 8 : p.x + 8;
          const anchor = isLast ? 'end' : 'start';

          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="rgba(255,255,255,0.2)" />
              <circle cx={p.x} cy={p.y} r="2" fill="white" />
              <text
                x={labelX}
                y={p.y - 7}
                fill="white"
                fontSize="14"
                fontWeight="700"
                fontFamily="Montserrat, sans-serif"
                textAnchor={anchor}
              >
                {formatEarnings(p.earnings)} sek
              </text>
              <text
                x={labelX}
                y={p.y + 7}
                fill="rgba(255,255,255,0.5)"
                fontSize="11"
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

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
  const lastPoint = dataPoints[dataPoints.length - 1];
  const firstPoint = dataPoints[0];

  // Simple graph: straight line from first tier endpoint to last
  // Graph drawing area with padding for labels
  const pad = { top: 28, right: 8, bottom: 8, left: 8 };
  const w = 300;
  const h = 160;
  const gw = w - pad.left - pad.right;
  const gh = h - pad.top - pad.bottom;

  // Origin at bottom-left, first point somewhere up-left, last point at top-right
  const ox = pad.left;
  const oy = pad.top + gh; // bottom

  // Normalize points
  const pts = dataPoints.map((p) => ({
    x: pad.left + (p.views / maxV) * gw,
    y: pad.top + (1 - p.earnings / maxEarnings) * gh,
    earnings: p.earnings,
    views: p.views,
  }));

  // Line from origin to each point
  const allPts = [{ x: ox, y: oy }, ...pts];
  const linePath = allPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const fillPath = `${linePath} L${allPts[allPts.length - 1].x},${oy} L${ox},${oy} Z`;

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

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full block" style={{ height: 160 }}>
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
        {pts.map((p, i) => {
          const isLast = i === pts.length - 1;
          const labelX = isLast ? p.x - 6 : p.x + 6;
          const anchor = isLast ? 'end' : 'start';

          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="rgba(255,255,255,0.2)" />
              <circle cx={p.x} cy={p.y} r="2" fill="white" />
              <text
                x={labelX}
                y={p.y - 5}
                fill="white"
                fontSize="10"
                fontWeight="700"
                fontFamily="Montserrat, sans-serif"
                textAnchor={anchor}
              >
                {formatEarnings(p.earnings)} sek
              </text>
              <text
                x={labelX}
                y={p.y + 6}
                fill="rgba(255,255,255,0.5)"
                fontSize="8"
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

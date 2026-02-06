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
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  return amount.toLocaleString('sv-SE', { maximumFractionDigits: 0 });
};

const EarningsGraph: React.FC<EarningsGraphProps> = ({ tiers, maxEarnings }) => {
  // Calculate first tier boundary and final max point
  const firstTier = tiers[0];
  let firstEarnings = 0;
  let firstViews = 0;
  if (firstTier && firstTier.maxViews) {
    const tierViews = firstTier.maxViews - firstTier.minViews;
    firstEarnings = (tierViews / 1000) * firstTier.rate;
    firstViews = firstTier.maxViews;
  }

  // Calculate total views needed to reach maxEarnings
  let cumEarnings = 0;
  let totalViews = 0;
  for (const tier of tiers) {
    if (tier.maxViews) {
      const tierViews = tier.maxViews - tier.minViews;
      const tierEarnings = (tierViews / 1000) * tier.rate;
      if (cumEarnings + tierEarnings >= maxEarnings) {
        const remaining = maxEarnings - cumEarnings;
        totalViews = tier.minViews + (remaining / tier.rate) * 1000;
        break;
      }
      cumEarnings += tierEarnings;
      totalViews = tier.maxViews;
    } else {
      const remaining = maxEarnings - cumEarnings;
      totalViews = tier.minViews + (remaining / tier.rate) * 1000;
    }
  }

  // Two data points: first tier boundary (middle) and max (end)
  const dataPoints = [
    { views: firstViews, earnings: Math.min(firstEarnings, maxEarnings) },
    { views: totalViews, earnings: maxEarnings },
  ];

  const maxV = totalViews || 1;

  // Graph dimensions
  const pad = { top: 38, right: 8, bottom: 8, left: 8 };
  const w = 300;
  const h = 260;
  const gw = w - pad.left - pad.right;
  const gh = h - pad.top - pad.bottom;

  const ox = pad.left;
  const oy = pad.top + gh;

  // End point (max earnings, max views) — top-right area
  const endX = pad.left + gw;
  const endY = pad.top;

  // Curved line using quadratic bezier — control point pulls curve down-right for a nice arc
  const cpX = ox + gw * 0.65;
  const cpY = oy - gh * 0.15;
  const curvePath = `M${ox},${oy} Q${cpX},${cpY} ${endX},${endY}`;
  const fillPath = `${curvePath} L${endX},${oy} Z`;

  // Place waypoints ON the curve using quadratic bezier interpolation
  const quadBezier = (t: number) => {
    const x = (1 - t) * (1 - t) * ox + 2 * (1 - t) * t * cpX + t * t * endX;
    const y = (1 - t) * (1 - t) * oy + 2 * (1 - t) * t * cpY + t * t * endY;
    return { x, y };
  };

  // Tangent direction at point t (for the leader line direction)
  const quadTangent = (t: number) => {
    const dx = 2 * (1 - t) * (cpX - ox) + 2 * t * (endX - cpX);
    const dy = 2 * (1 - t) * (cpY - oy) + 2 * t * (endY - cpY);
    const len = Math.sqrt(dx * dx + dy * dy);
    return { dx: dx / len, dy: dy / len };
  };

  const waypoints = dataPoints.map((p, i) => {
    // First/middle point always at t=0.5 on the curve, last point at t=1.0
    const isLast = i === dataPoints.length - 1;
    const t = isLast ? 1.0 : 0.5;
    const pos = quadBezier(t);
    return {
      ...pos,
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
        {/* Curved line */}
        <path d={curvePath} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />

        {/* Origin dot - no label */}
        <circle cx={ox} cy={oy} r="3" fill="rgba(255,255,255,0.2)" />
        <circle cx={ox} cy={oy} r="1.5" fill="white" />

        {/* Waypoint dots + leader lines + labels */}
        {waypoints.map((p, i) => {
          const isLast = i === waypoints.length - 1;
          const leaderLen = 34;

          // Both points: leader goes straight left
          const lx = p.x - leaderLen;
          const ly = p.y;
          const anchor = 'end';
          const textX = lx - 5;

          return (
            <g key={i}>
              {/* Leader line */}
              <line
                x1={p.x} y1={p.y}
                x2={lx} y2={ly}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="0.8"
              />
              {/* Dot glow */}
              <circle cx={p.x} cy={p.y} r="5.5" fill="rgba(255,255,255,0.2)" />
              {/* Dot */}
              <circle cx={p.x} cy={p.y} r="3" fill="white" />
              {/* Leader end dot */}
              <circle cx={lx} cy={ly} r="1.5" fill="rgba(255,255,255,0.4)" />
              {/* Earnings label */}
              <text
                x={textX}
                y={ly - 4}
                fill="white"
                fontSize="22"
                fontWeight="600"
                fontFamily="Montserrat, sans-serif"
                textAnchor={anchor}
                dominantBaseline="auto"
              >
                {formatEarnings(p.earnings)} sek
              </text>
              {/* Views label */}
              <text
                x={textX}
                y={ly + 18}
                fill="rgba(255,255,255,0.6)"
                fontSize="18"
                fontWeight="500"
                fontFamily="Plus Jakarta Sans, sans-serif"
                textAnchor={anchor}
                dominantBaseline="auto"
              >
                {formatViews(p.views)} views
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-xs text-white/50 font-jakarta px-4 pb-3 pt-1 leading-relaxed">
        You earn {formatEarnings(dataPoints[0].earnings)} sek when you first reach {formatViews(dataPoints[0].views)} views and {formatEarnings(dataPoints[1].earnings)} sek when you reach {formatViews(dataPoints[1].views)} views.
      </p>
    </div>
  );
};

export default EarningsGraph;

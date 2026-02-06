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

  const waypoints = dataPoints.map((p) => {
    const t = p.views / maxV;
    const pos = quadBezier(t);
    const tan = quadTangent(t);
    // Normal perpendicular to tangent (pointing upward/left from the curve)
    const nx = -tan.dy;
    const ny = tan.dx;
    return {
      ...pos,
      nx, ny,
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
          // Leader line: extend from dot along the normal (perpendicular to curve)
          const leaderLen = 22;
          const lx = p.x + p.nx * leaderLen;
          const ly = p.y + p.ny * leaderLen;
          // Labels at end of leader
          const anchor = isLast ? 'end' : 'start';
          const textX = isLast ? lx - 4 : lx + 4;

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
              <circle cx={p.x} cy={p.y} r="4" fill="rgba(255,255,255,0.2)" />
              {/* Dot */}
              <circle cx={p.x} cy={p.y} r="2" fill="white" />
              {/* Leader end dot */}
              <circle cx={lx} cy={ly} r="1.5" fill="rgba(255,255,255,0.4)" />
              {/* Earnings label */}
              <text
                x={textX}
                y={ly - 5}
                fill="white"
                fontSize="13"
                fontWeight="700"
                fontFamily="Montserrat, sans-serif"
                textAnchor={anchor}
              >
                {formatEarnings(p.earnings)} sek
              </text>
              {/* Views label */}
              <text
                x={textX}
                y={ly + 7}
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
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

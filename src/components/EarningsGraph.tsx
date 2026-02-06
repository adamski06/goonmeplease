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

  // Graph area: full width, with only top padding for labels
  const vw = 300;
  const vh = 200;
  const padTop = 24; // space for top labels
  const padRight = 0;
  const padBottom = 0; // bottom edge = bottom of container
  const padLeft = 0; // left edge = left of container

  const graphW = vw - padLeft - padRight;
  const graphH = vh - padTop - padBottom;

  const toSvg = (nx: number, ny: number) => ({
    sx: padLeft + nx * graphW,
    sy: padTop + (1 - ny) * graphH,
  });

  const origin = toSvg(0, 0);
  const svgPts = dataPoints.map((p) => ({
    ...toSvg(p.views / maxV, p.earnings / maxEarnings),
    earnings: p.earnings,
    views: p.views,
  }));

  // Build paths
  const lineCoords = [origin, ...svgPts.map((p) => ({ sx: p.sx, sy: p.sy }))];
  const linePath = lineCoords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.sx},${c.sy}`).join(' ');
  const fillPath = `${linePath} L${lineCoords[lineCoords.length - 1].sx},${origin.sy} L${origin.sx},${origin.sy} Z`;

  return (
    <div
      className="rounded-xl mt-3 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <h4 className="text-xs font-semibold text-white/70 px-4 pt-3 pb-1 font-montserrat uppercase tracking-wider">
        Earnings by views
      </h4>

      <svg
        viewBox={`0 0 ${vw} ${vh}`}
        className="w-full block"
        style={{ height: 200 }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="egFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>

        {/* Bottom axis line */}
        <line x1={0} y1={vh} x2={vw} y2={vh} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        {/* Right axis line */}
        <line x1={vw} y1={padTop} x2={vw} y2={vh} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

        {/* Fill area */}
        <path d={fillPath} fill="url(#egFill)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

        {/* Origin dot - white, no label */}
        <circle cx={origin.sx} cy={origin.sy} r="3.5" fill="rgba(255,255,255,0.15)" />
        <circle cx={origin.sx} cy={origin.sy} r="2" fill="white" />

        {/* Waypoint dots + labels */}
        {svgPts.map((p, i) => {
          const isLast = i === svgPts.length - 1;
          const labelX = isLast ? p.sx - 6 : p.sx + 6;
          const anchor = isLast ? 'end' : 'start';

          return (
            <g key={i}>
              <circle cx={p.sx} cy={p.sy} r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx={p.sx} cy={p.sy} r="2.5" fill="white" />
              <text
                x={labelX}
                y={p.sy - 6}
                fill="white"
                fontSize="11"
                fontWeight="700"
                fontFamily="Montserrat, sans-serif"
                textAnchor={anchor}
              >
                {formatEarnings(p.earnings)} sek
              </text>
              <text
                x={labelX}
                y={p.sy + 5}
                fill="rgba(255,255,255,0.5)"
                fontSize="9"
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

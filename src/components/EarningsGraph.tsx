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
  const points: { views: number; earnings: number }[] = [];
  let cumulativeEarnings = 0;

  for (const tier of tiers) {
    if (tier.maxViews) {
      const tierViews = tier.maxViews - tier.minViews;
      const tierEarnings = (tierViews / 1000) * tier.rate;
      cumulativeEarnings += tierEarnings;
      points.push({ views: tier.maxViews, earnings: Math.min(cumulativeEarnings, maxEarnings) });
    } else {
      const remainingEarnings = maxEarnings - cumulativeEarnings;
      const additionalViews = (remainingEarnings / tier.rate) * 1000;
      const totalViews = tier.minViews + additionalViews;
      points.push({ views: totalViews, earnings: maxEarnings });
    }
  }

  const maxViewsVal = points[points.length - 1]?.views || 1;
  const chartHeight = 200;

  // Add padding so dots/labels aren't clipped
  const padLeft = 8;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 8;
  const plotW = 100 - padLeft - padRight;
  const plotH = 100 - padTop - padBottom;

  // Map data to SVG coordinates (Y: 0=top, 100=bottom → earnings go UP)
  const svgPoints = points.map((p) => ({
    x: padLeft + (p.views / maxViewsVal) * plotW,
    y: padTop + (1 - p.earnings / maxEarnings) * plotH,
    earnings: p.earnings,
    views: p.views,
  }));

  // Start line from bottom-left of plot area
  const originX = padLeft;
  const originY = padTop + plotH; // bottom

  const allPoints = [{ x: originX, y: originY }, ...svgPoints];

  const linePath = allPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const fillPath = `${linePath} L ${allPoints[allPoints.length - 1].x} ${originY} L ${originX} ${originY} Z`;

  const gradientId = `earningsGrad-${maxEarnings}-${tiers.length}`;

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

      <div className="relative" style={{ height: chartHeight }}>
        {/* Bottom axis */}
        <div className="absolute left-0 right-0 bottom-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }} />
        {/* Right axis */}
        <div className="absolute top-0 bottom-0 right-0" style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }} />

        {/* SVG */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Waypoint dots with labels (skip origin, only show tier boundaries) */}
        {svgPoints.map((p, i) => {
          // Position label: last point → left side, others → right side
          const isLast = i === svgPoints.length - 1;
          return (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* Dot */}
              <div
                className="w-2.5 h-2.5 rounded-full bg-white"
                style={{ boxShadow: '0 0 8px rgba(255,255,255,0.4)' }}
              />
              {/* Label */}
              <div
                className="absolute whitespace-nowrap flex flex-col"
                style={{
                  ...(isLast
                    ? { right: '16px', top: '50%', transform: 'translateY(-50%)', alignItems: 'flex-end' }
                    : { left: '16px', top: '50%', transform: 'translateY(-50%)', alignItems: 'flex-start' }),
                }}
              >
                <span className="text-[11px] font-bold text-white font-montserrat leading-none">
                  {formatEarnings(p.earnings)} sek
                </span>
                <span className="text-[9px] text-white/50 font-jakarta leading-none mt-0.5">
                  {formatViews(p.views)} views
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EarningsGraph;

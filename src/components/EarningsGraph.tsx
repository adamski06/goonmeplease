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
  const points: { views: number; earnings: number; rate: number }[] = [];
  let cumulativeEarnings = 0;

  // Starting point
  points.push({ views: 0, earnings: 0, rate: tiers[0]?.rate || 0 });

  for (const tier of tiers) {
    const tierViews = tier.maxViews ? tier.maxViews - tier.minViews : 0;
    
    if (tier.maxViews) {
      const tierEarnings = (tierViews / 1000) * tier.rate;
      cumulativeEarnings += tierEarnings;
      points.push({ views: tier.maxViews, earnings: Math.min(cumulativeEarnings, maxEarnings), rate: tier.rate });
    } else {
      // Last tier - calculate views needed to hit max earnings
      const remainingEarnings = maxEarnings - cumulativeEarnings;
      const additionalViews = (remainingEarnings / tier.rate) * 1000;
      const totalViews = tier.minViews + additionalViews;
      points.push({ views: totalViews, earnings: maxEarnings, rate: tier.rate });
    }
  }

  const maxViews = points[points.length - 1].views;
  const chartHeight = 100;

  // SVG uses viewBox 0 0 100 100, Y goes down.
  // earnings=0 → y=100 (bottom), earnings=max → y=0 (top)
  const svgPoints = points.map((p) => ({
    x: maxViews > 0 ? (p.views / maxViews) * 100 : 0,
    y: maxEarnings > 0 ? (1 - p.earnings / maxEarnings) * 100 : 100,
    earnings: p.earnings,
    views: p.views,
  }));

  // Line path
  const linePath = svgPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Fill under the line
  const fillPath = `${linePath} L ${svgPoints[svgPoints.length - 1].x} 100 L 0 100 Z`;

  // Unique gradient ID per instance
  const gradientId = `earningsGrad-${maxEarnings}`;

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

      {/* Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        {/* Bottom axis line */}
        <div
          className="absolute left-0 right-0 bottom-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
        />
        {/* Right axis line */}
        <div
          className="absolute top-0 bottom-0 right-0"
          style={{ borderRight: '1px solid rgba(255,255,255,0.15)' }}
        />

        {/* SVG Chart */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill={`url(#${gradientId})`} />
          <path d={linePath} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Waypoint dots with labels */}
        {svgPoints.map((p, i) => (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Dot */}
            <div
              className="w-2 h-2 rounded-full bg-white flex-shrink-0"
              style={{ boxShadow: '0 0 6px rgba(255,255,255,0.5)' }}
            />
            {/* Label - position above for most, below for first */}
            <div
              className="absolute flex flex-col items-center whitespace-nowrap"
              style={{
                bottom: i === 0 ? 'auto' : '12px',
                top: i === 0 ? '12px' : 'auto',
              }}
            >
              <span className="text-[10px] font-bold text-white font-montserrat leading-none">
                {formatEarnings(p.earnings)} sek
              </span>
              <span className="text-[9px] text-white/50 font-jakarta leading-none mt-0.5">
                {formatViews(p.views)} views
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsGraph;

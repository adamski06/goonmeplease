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
  
  // Chart dimensions
  const chartHeight = 120;
  const chartWidth = 100; // percentage
  
  // Generate SVG path
  const svgPoints = points.map((p) => ({
    x: maxViews > 0 ? (p.views / maxViews) * 100 : 0,
    y: maxEarnings > 0 ? ((1 - p.earnings / maxEarnings) * 100) : 100,
  }));

  // Create the line path
  const linePath = svgPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // Create the fill path (closed area under curve)
  const fillPath = `${linePath} L ${svgPoints[svgPoints.length - 1].x} 100 L 0 100 Z`;

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
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <div
            key={fraction}
            className="absolute left-0 right-0"
            style={{
              top: `${(1 - fraction) * 100}%`,
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        ))}

        {/* SVG Chart */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* Gradient fill */}
          <defs>
            <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#earningsGradient)" />
          <path d={linePath} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          
          {/* Data points */}
          {svgPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="white"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        {points.map((p, i) => (
          <div key={i} className="flex flex-col items-center" style={{ minWidth: 0 }}>
            <span className="text-[10px] font-bold text-white/90 font-montserrat">
              {p.earnings.toLocaleString()}
            </span>
            <span className="text-[9px] text-white/50 font-jakarta">
              {formatViews(p.views)}
            </span>
          </div>
        ))}
      </div>

      {/* Rate tiers legend */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-[10px] font-medium text-white/90 font-montserrat">
              {tier.rate} sek/1K
            </span>
            <span className="text-[9px] text-white/50 font-jakarta">
              {formatViews(tier.minViews)}-{tier.maxViews ? formatViews(tier.maxViews) : '∞'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EarningsGraph;

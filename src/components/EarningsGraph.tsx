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
  const data = calculateEarningsData(tiers, maxEarnings);
  const points = [
    { earnings: data.first.earnings, views: data.first.views },
    { earnings: data.max.earnings, views: data.max.views },
  ];

  return (
    <div className="mt-4 mb-1">
      <div className="flex items-center justify-center gap-0">
        {/* Views column (left of pills) */}
        <div className="flex flex-col items-end pr-4" style={{ gap: 28 }}>
          <span className="text-sm font-semibold text-white/50 font-montserrat leading-[48px]">
            {formatViews(points[1].views)} views
          </span>
          <span className="text-sm font-semibold text-white/50 font-montserrat leading-[48px]">
            {formatViews(points[0].views)} views
          </span>
        </div>

        {/* Line + Pills */}
        <div className="relative flex flex-col items-center" style={{ gap: 28 }}>
          {/* Vertical line — only visible between pills */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[2px] rounded-full bg-white/25"
            style={{ top: 48, bottom: 48 }}
          />

          {/* Top pill (max) */}
          <div
            className="relative z-10 rounded-full px-5 py-2.5 flex items-baseline gap-1"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-xl font-bold text-white font-montserrat">
              {formatEarnings(points[1].earnings)}
            </span>
            <span className="text-xs font-semibold text-white/70 font-montserrat">
              sek
            </span>
          </div>

          {/* Bottom pill (first tier) */}
          <div
            className="relative z-10 rounded-full px-5 py-2.5 flex items-baseline gap-1"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)',
              border: '1px solid rgba(255,255,255,0.25)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-xl font-bold text-white font-montserrat">
              {formatEarnings(points[0].earnings)}
            </span>
            <span className="text-xs font-semibold text-white/70 font-montserrat">
              sek
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export helper to calculate earnings data for external use
export const calculateEarningsData = (tiers: Tier[], maxEarnings: number) => {
  const firstTier = tiers[0];
  let firstEarnings = 0;
  let firstViews = 0;
  if (firstTier && firstTier.maxViews) {
    const tierViews = firstTier.maxViews - firstTier.minViews;
    firstEarnings = (tierViews / 1000) * firstTier.rate;
    firstViews = firstTier.maxViews;
  }

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

  return {
    first: { views: firstViews, earnings: Math.min(firstEarnings, maxEarnings) },
    max: { views: totalViews, earnings: maxEarnings },
  };
};

export const formatViewsForNote = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(0)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(0)}K`;
  return views.toString();
};

export const formatEarningsForNote = (amount: number): string => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  return amount.toLocaleString('sv-SE', { maximumFractionDigits: 0 });
};

export default EarningsGraph;

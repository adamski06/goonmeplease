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

  // Calculate progress percentage for bar fill (first tier as fraction of max views)
  const maxViews = points[1].views || 1;
  const firstViewsFraction = Math.min(points[0].views / maxViews, 1);

  return (
    <div className="my-6">
      <div className="flex items-stretch gap-0">
        {/* Views (left) */}
        <div className="flex flex-col items-end justify-between pr-4 py-1" style={{ gap: 40 }}>
          <span className="text-sm font-semibold text-white/50 font-montserrat leading-[52px]">
            {formatViews(points[1].views)} views
          </span>
          <span className="text-sm font-semibold text-white/50 font-montserrat leading-[52px]">
            {formatViews(points[0].views)} views
          </span>
        </div>

        {/* Progress bar (center) */}
        <div className="flex flex-col items-center justify-between py-1" style={{ gap: 40 }}>
          {/* Bar aligned to pill centers */}
          <div className="relative flex flex-col items-center" style={{ gap: 40 }}>
            {/* Background bar track */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[4px] rounded-full bg-white/10"
              style={{ top: 0, bottom: 0 }}
            />
            {/* Filled portion — from bottom up to first tier */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-[4px] rounded-full bg-white/35"
              style={{ bottom: 0, height: `${firstViewsFraction * 100}%` }}
            />

            {/* Top dot */}
            <div className="relative z-10 w-3 h-3 rounded-full bg-white/20 border border-white/30 flex items-center justify-center" style={{ height: 52 }}>
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </div>
            {/* Bottom dot */}
            <div className="relative z-10 w-3 h-3 rounded-full bg-white/30 border border-white/40 flex items-center justify-center" style={{ height: 52 }}>
              <div className="w-2 h-2 rounded-full bg-white/50" />
            </div>
          </div>
        </div>

        {/* Pills (right) */}
        <div className="flex flex-col items-start justify-between pl-4 py-1" style={{ gap: 40 }}>
          <div
            className="rounded-full px-5 py-3 flex items-baseline gap-1"
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

          <div
            className="rounded-full px-5 py-3 flex items-baseline gap-1"
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

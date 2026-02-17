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
    <div className="mt-2 mb-10">
      <h4 className="text-xs font-semibold text-white/70 font-montserrat uppercase tracking-wider mb-4">
        Earnings
      </h4>
      <div className="flex items-center justify-center py-4">
        {/* Views (left) */}
        <div className="flex flex-col items-end" style={{ gap: 84 }}>
          <span className="text-sm font-semibold text-white/50 font-montserrat" style={{ lineHeight: '52px' }}>
            {formatViews(points[1].views)} views
          </span>
          <span className="text-sm font-semibold text-white/50 font-montserrat" style={{ lineHeight: '52px' }}>
            {formatViews(points[0].views)} views
          </span>
        </div>

        {/* Clean vertical bar (center) */}
        <div className="relative mx-4" style={{ width: 4, alignSelf: 'stretch', marginTop: -20, marginBottom: -40 }}>
          {/* Track */}
          <div className="absolute inset-0 rounded-full bg-white/10" />
          {/* Fill from bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-full bg-white/35"
            style={{ height: `${firstViewsFraction * 100}%` }}
          />
        </div>

        {/* Pills (right) */}
        <div className="flex flex-col items-start" style={{ gap: 84 }}>
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

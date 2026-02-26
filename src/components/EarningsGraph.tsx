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

  // Rate from first tier for the per-1000-views pill
  const ratePerThousand = tiers.length > 0 ? tiers[0].rate : 0;

  return (
    <div className="mt-2 mb-4">
      <h4 className="text-xs font-semibold text-white/70 font-montserrat uppercase tracking-wider mb-4">
        Earnings
      </h4>
      <div className="flex flex-col gap-3">
        {/* Max Earnings pill */}
        <div
          className="rounded-full px-5 py-3 flex items-center justify-center gap-1.5 w-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <span className="text-sm font-semibold text-white/70 font-montserrat">Max Earnings:</span>
          <span className="text-xl font-bold text-white font-montserrat">
            {formatEarnings(maxEarnings)}
          </span>
          <span className="text-xs font-semibold text-white/70 font-montserrat">sek</span>
        </div>

        {/* Rate per 1000 views pill */}
        <div
          className="rounded-full px-5 py-3 flex items-center justify-center gap-1.5 w-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <span className="text-xl font-bold text-white font-montserrat">
            {formatEarnings(ratePerThousand)}
          </span>
          <span className="text-sm font-semibold text-white/70 font-montserrat">sek / 1000 views</span>
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

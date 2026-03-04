import React from 'react';
import { useNavigate } from 'react-router-dom';

const adTypes = [
  {
    id: 'spread',
    title: 'Spread',
    description: 'Performance-based — pay creators per view using a tiered rate.',
    route: '/business/campaigns/new',
  },
  {
    id: 'deal',
    title: 'Deals',
    description: 'Manual collaboration — review and approve creator requests.',
    route: '/business/deals/new',
  },
  {
    id: 'rewards',
    title: 'Rewards',
    description: 'Set up loyalty rewards and referral programs for your brand.',
    route: '/business/rewards',
  },
  {
    id: 'music',
    title: 'Music',
    description: 'Promote tracks by having creators use your sounds in videos.',
    route: null,
  },
];

const AdTypesLibrary: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-y-auto relative">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="grid grid-cols-2 gap-4" style={{ maxWidth: '560px', width: '100%' }}>
          {adTypes.map((ad) => {
            const isDisabled = !ad.route;
            return (
              <button
                key={ad.id}
                onClick={() => ad.route && navigate(ad.route)}
                disabled={isDisabled}
                className="flex flex-col items-center justify-center text-center rounded-[28px] p-6 transition-all active:scale-[0.99]"
                style={{
                  aspectRatio: '9/14',
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <h2 className="text-lg font-semibold text-foreground font-montserrat mb-1.5">{ad.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[160px]">{ad.description}</p>
                {isDisabled && (
                  <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Coming soon</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdTypesLibrary;

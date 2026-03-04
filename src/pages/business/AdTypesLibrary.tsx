import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Handshake, Gift, Music } from 'lucide-react';

const adTypes = [
  {
    id: 'spread',
    title: 'Spread',
    description: 'Performance-based — pay creators per view using a tiered rate.',
    icon: Megaphone,
    route: '/business/campaigns/new',
  },
  {
    id: 'deal',
    title: 'Deals',
    description: 'Manual collaboration — review and approve creator requests.',
    icon: Handshake,
    route: '/business/deals/new',
  },
  {
    id: 'rewards',
    title: 'Rewards',
    description: 'Set up loyalty rewards and referral programs for your brand.',
    icon: Gift,
    route: '/business/rewards',
  },
  {
    id: 'music',
    title: 'Music',
    description: 'Promote tracks by having creators use your sounds in videos.',
    icon: Music,
    route: null,
  },
];

const AdTypesLibrary: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="grid grid-cols-2 gap-4" style={{ maxWidth: '920px', width: '100%' }}>
          {adTypes.map((ad) => {
            const Icon = ad.icon;
            const isDisabled = !ad.route;
            return (
              <button
                key={ad.id}
                onClick={() => ad.route && navigate(ad.route)}
                disabled={isDisabled}
                className="flex flex-col justify-end rounded-[28px] p-8 transition-all active:scale-[0.99] text-left"
                style={{
                  aspectRatio: '9/14',
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <Icon className="h-5 w-5 text-muted-foreground mb-3" />
                <h2 className="text-xl font-semibold text-foreground font-montserrat mb-2">{ad.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{ad.description}</p>
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const adTypes = [
  { key: 'reward' as const, title: 'Rewards', desc: 'Offer your own reward — creators earn it by posting and hitting views.' },
  { key: 'spread' as const, title: 'Spread', desc: 'Performance-based — pay creators per view using a tiered rate.' },
  { key: 'deal' as const, title: 'Deals', desc: 'Manual collaboration — review and approve creator requests.' },
];

const CreateCampaignChooser: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'spread' | 'deal' | 'reward' | null>(null);

  const handleContinue = () => {
    if (selected === 'spread') navigate('/business/campaigns/new');
    else if (selected === 'deal') navigate('/business/deals/new');
    else if (selected === 'reward') navigate('/business/rewards/new');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="flex flex-col flex-1 px-4 py-8 overflow-hidden">
        <div className="flex gap-4 justify-center flex-1">
          {adTypes.map((ad) => (
            <button
              key={ad.key}
              onClick={() => setSelected(ad.key)}
              className="flex flex-col justify-end rounded-[28px] p-8 transition-all active:scale-[0.99]"
              style={{
                width: '360px',
                minHeight: '500px',
                background: selected === ad.key
                  ? 'linear-gradient(180deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.18) 100%)'
                  : 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                border: selected === ad.key
                  ? '1.5px solid hsl(var(--primary))'
                  : '1px solid hsl(var(--border))',
                boxShadow: selected === ad.key
                  ? '0 0 0 3px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(var(--background) / 0.6)'
                  : 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
              }}
            >
              <h2 className="text-xl font-semibold text-foreground font-montserrat mb-2">{ad.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{ad.desc}</p>
            </button>
          ))}
        </div>

        <div className="flex justify-end mt-3" style={{ maxWidth: '940px', width: '100%', margin: '12px auto 0' }}>
          <button
            onClick={() => navigate('/business/ad-types')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            See all ad types
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex justify-center mt-8 pb-4">
          <button
            onClick={handleContinue}
            disabled={!selected}
            className="px-12 py-3.5 rounded-full text-sm font-semibold font-jakarta transition-all"
            style={{
              background: selected
                ? 'linear-gradient(135deg, hsl(214, 84%, 56%) 0%, hsl(221, 83%, 53%) 100%)'
                : 'hsl(var(--muted))',
              color: selected ? '#ffffff' : 'hsl(var(--muted-foreground))',
              boxShadow: selected
                ? '0 4px 15px hsl(214, 84%, 56% / 0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                : 'none',
              cursor: selected ? 'pointer' : 'not-allowed',
              opacity: selected ? 1 : 0.5,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaignChooser;

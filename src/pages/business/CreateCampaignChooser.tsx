import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateCampaignChooser: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'spread' | 'deal' | null>(null);

  const handleContinue = () => {
    if (selected === 'spread') navigate('/business/campaigns/new');
    else if (selected === 'deal') navigate('/business/deals/new');
  };

  return (
    <div className="flex flex-col h-full min-h-screen relative">
      {/* Content */}
      <div className="flex flex-col flex-1 px-4 py-8">
        <p className="text-sm font-medium text-muted-foreground font-jakarta mb-6 tracking-wide text-center">
          Select one
        </p>

        <div className="flex gap-4 justify-center flex-1">
          {/* Spread node */}
          <button
            onClick={() => setSelected('spread')}
            className="flex flex-col justify-end rounded-[28px] p-8 transition-all active:scale-[0.99]"
            style={{
              width: '440px',
              minHeight: '500px',
              background: selected === 'spread'
                ? 'linear-gradient(180deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.18) 100%)'
                : 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              border: selected === 'spread'
                ? '1.5px solid hsl(var(--primary))'
                : '1px solid hsl(var(--border))',
              boxShadow: selected === 'spread'
                ? '0 0 0 3px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(var(--background) / 0.6)'
                : 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
            }}
          >
            <h2 className="text-xl font-semibold text-foreground font-montserrat mb-2">Spread</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Performance-based — pay creators per view using a tiered rate.
            </p>
          </button>

          {/* Deals node */}
          <button
            onClick={() => setSelected('deal')}
            className="flex flex-col justify-end rounded-[28px] p-8 transition-all active:scale-[0.99]"
            style={{
              width: '440px',
              minHeight: '500px',
              background: selected === 'deal'
                ? 'linear-gradient(180deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--primary) / 0.18) 100%)'
                : 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              border: selected === 'deal'
                ? '1.5px solid hsl(var(--primary))'
                : '1px solid hsl(var(--border))',
              boxShadow: selected === 'deal'
                ? '0 0 0 3px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(var(--background) / 0.6)'
                : 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
            }}
          >
            <h2 className="text-xl font-semibold text-foreground font-montserrat mb-2">Deals</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manual collaboration — review and approve creator requests.
            </p>
          </button>
        </div>

        {/* Continue button */}
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

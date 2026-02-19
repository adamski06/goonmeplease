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
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
      <p className="text-sm font-medium text-muted-foreground font-jakarta mb-8 tracking-wide">
        Select one
      </p>

      <div className="flex gap-4 justify-center">
        {/* Spread node */}
        <button
          onClick={() => setSelected('spread')}
          className="flex flex-col justify-end rounded-[28px] p-6 text-left transition-all active:scale-[0.98]"
          style={{
            width: '180px',
            height: '360px',
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
          <div>
            <h2 className="text-base font-semibold text-foreground font-montserrat mb-1">Spread</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Performance-based — pay creators per view using a tiered rate.
            </p>
          </div>
        </button>

        {/* Deal node */}
        <button
          onClick={() => setSelected('deal')}
          className="flex flex-col justify-end rounded-[28px] p-6 text-left transition-all active:scale-[0.98]"
          style={{
            width: '180px',
            height: '360px',
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
          <div>
            <h2 className="text-base font-semibold text-foreground font-montserrat mb-1">Ad</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Manual collaboration — review and approve creator requests.
            </p>
          </div>
        </button>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!selected}
        className="mt-10 px-10 py-3 rounded-full text-sm font-semibold font-jakarta transition-all"
        style={{
          background: selected ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
          color: selected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
          cursor: selected ? 'pointer' : 'not-allowed',
          opacity: selected ? 1 : 0.5,
        }}
      >
        Continue
      </button>
    </div>
  );
};

export default CreateCampaignChooser;

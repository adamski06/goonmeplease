import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Handshake, ArrowLeft } from 'lucide-react';

const CreateCampaignChooser: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-foreground font-montserrat mb-2">New Campaign</h1>
      <p className="text-sm text-muted-foreground mb-10">Choose the type of campaign you want to create.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Spread */}
        <button
          onClick={() => navigate('/business/campaigns/new')}
          className="group flex flex-col gap-4 rounded-[24px] p-6 text-left transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
          }}
        >
          <div className="h-12 w-12 rounded-2xl bg-foreground flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-background" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground font-montserrat mb-1">Spread</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Performance-based. Pay creators per view using a tiered rate. Fund with a budget and track results in real time.
            </p>
          </div>
          <span className="text-xs font-medium text-foreground/50 group-hover:text-foreground transition-colors mt-auto">
            Pay-per-view →
          </span>
        </button>

        {/* Deal */}
        <button
          onClick={() => navigate('/business/deals/new')}
          className="group flex flex-col gap-4 rounded-[24px] p-6 text-left transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
          }}
        >
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
            <Handshake className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground font-montserrat mb-1">Deal</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Manual collaboration. Creators request to join — you review and accept. Set your own rate per view.
            </p>
          </div>
          <span className="text-xs font-medium text-foreground/50 group-hover:text-foreground transition-colors mt-auto">
            Request-based →
          </span>
        </button>
      </div>
    </div>
  );
};

export default CreateCampaignChooser;

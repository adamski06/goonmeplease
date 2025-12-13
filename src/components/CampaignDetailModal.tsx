import React from 'react';
import { X, Video, Eye, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampaignTier {
  minViews: number;
  maxViews: number | null;
  rate: number;
}

interface Campaign {
  id: number;
  brand: string;
  description: string;
  logo: string;
  contentType: string;
  productVisibility: string;
  videoLength: string;
  guidelines: string[];
  tiers: CampaignTier[];
  maxEarnings: number;
  ratePerThousand: number;
}

interface CampaignDetailModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
}

const CampaignDetailModal: React.FC<CampaignDetailModalProps> = ({ campaign, isOpen, onClose }) => {
  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-[95vw] max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden">
        {/* Radial Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle 800px at 50% 50%, hsl(220, 60%, 25%) 0%, hsl(215, 50%, 40%) 35%, hsl(210, 40%, 65%) 60%, hsl(200, 30%, 85%) 80%, white 100%)'
          }}
        />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        {/* Scrollable Content */}
        <div className="relative z-10 overflow-y-auto max-h-[92vh] p-10">
          {/* Hero Section */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50 p-3 flex-shrink-0">
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-foreground mb-2">{campaign.brand}</h2>
              <p className="text-lg text-muted-foreground">{campaign.description}</p>
            </div>
          </div>

          {/* Content Requirements */}
          <section className="bg-muted/30 rounded-2xl border border-border/50 p-5 mb-5">
            <h3 className="text-lg font-bold text-foreground mb-4">Content Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Video className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Content Type</p>
                  <p className="font-semibold text-foreground text-sm">{campaign.contentType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Product Visibility</p>
                  <p className="font-semibold text-foreground text-sm">{campaign.productVisibility}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Video Length</p>
                  <p className="font-semibold text-foreground text-sm">{campaign.videoLength}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Guidelines */}
          <section className="bg-muted/30 rounded-2xl border border-border/50 p-5 mb-5">
            <h3 className="text-lg font-bold text-foreground mb-4">Guidelines</h3>
            <ul className="space-y-2">
              {campaign.guidelines.map((guideline, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="h-2.5 w-2.5 text-green-600" />
                  </div>
                  <span className="text-foreground text-sm">{guideline}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Inspiration Section */}
          <section className="bg-muted/30 rounded-2xl border border-border/50 p-5 mb-5">
            <h3 className="text-lg font-bold text-foreground mb-4">Inspiration</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="aspect-[9/16] bg-black/5 rounded-xl border border-border/30 flex items-center justify-center"
                >
                  <span className="text-muted-foreground text-xs">Example {i}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reward Breakdown */}
          <section className="bg-muted/30 rounded-2xl border border-border/50 p-5 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Reward Structure</h3>
            <div className="space-y-3">
              {campaign.tiers.map((tier, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-border/30"
                >
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {tier.minViews.toLocaleString()} - {tier.maxViews ? tier.maxViews.toLocaleString() : '∞'} views
                    </p>
                    <p className="text-xs text-muted-foreground">Tier {idx + 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{tier.rate} sek</p>
                    <p className="text-xs text-muted-foreground">per 1000 views</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <p className="text-xs text-muted-foreground">Maximum earnings</p>
              <p className="text-2xl font-bold text-foreground">{campaign.maxEarnings.toLocaleString()} sek</p>
            </div>
          </section>

          {/* CTA */}
          <Button 
            size="lg" 
            className="w-full py-5 text-base font-bold rounded-full"
          >
            Submit Content for This Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailModal;

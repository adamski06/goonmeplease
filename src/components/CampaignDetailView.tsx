import React from 'react';
import { ArrowLeft, Video, Eye, Clock, Star, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CampaignTier {
  minViews: number;
  maxViews: number | null;
  rate: number;
}

interface Campaign {
  id: string;
  brand: string;
  description: string;
  logo: string;
  image: string;
  contentType: string;
  productVisibility: string;
  videoLength: string;
  guidelines: string[];
  tiers: CampaignTier[];
  maxEarnings: number;
  ratePerThousand: number;
}

interface CampaignDetailViewProps {
  campaign: Campaign;
  onBack: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}

const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({ 
  campaign, 
  onBack, 
  isSaved, 
  onToggleSave 
}) => {
  return (
    <div className="h-full overflow-y-auto">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 font-jakarta"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Back to ads</span>
      </button>

      <div className="flex gap-8">
        {/* Left side - Campaign info */}
        <div className="flex-1 max-w-xl">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 flex-shrink-0">
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground font-montserrat">{campaign.brand}</h1>
              <p className="text-muted-foreground font-jakarta mt-1">{campaign.description}</p>
            </div>
            <button
              onClick={onToggleSave}
              className="flex items-center justify-center hover:scale-110 transition-transform p-2"
            >
              <Bookmark 
                className={`h-6 w-6 ${isSaved ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Earnings highlight */}
          <div className="bg-black text-white rounded-2xl p-5 mb-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-montserrat">{campaign.maxEarnings.toLocaleString()} sek</span>
              <span className="text-white/60 text-sm">max earnings</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-semibold">{campaign.ratePerThousand} sek</span>
              <span className="text-white/60 text-xs">/ 1000 views</span>
            </div>
          </div>

          {/* Content Requirements */}
          <div className="bg-white/60 dark:bg-dark-surface rounded-xl p-4 mb-4">
            <h3 className="text-sm font-bold text-foreground mb-3 font-montserrat">Content Requirements</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-foreground">{campaign.contentType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Visibility</p>
                  <p className="text-sm font-medium text-foreground">{campaign.productVisibility}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Length</p>
                  <p className="text-sm font-medium text-foreground">{campaign.videoLength}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-white/60 dark:bg-dark-surface rounded-xl p-4 mb-4">
            <h3 className="text-sm font-bold text-foreground mb-3 font-montserrat">Guidelines</h3>
            <ul className="space-y-2">
              {campaign.guidelines.map((guideline, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Star className="h-3 w-3 text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-sm text-foreground font-jakarta">{guideline}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reward tiers */}
          <div className="bg-white/60 dark:bg-dark-surface rounded-xl p-4 mb-6">
            <h3 className="text-sm font-bold text-foreground mb-3 font-montserrat">Reward Structure</h3>
            <div className="space-y-2">
              {campaign.tiers.map((tier, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2 bg-white/80 dark:bg-white/10 rounded-lg"
                >
                  <span className="text-sm text-foreground">
                    {tier.minViews.toLocaleString()} - {tier.maxViews ? tier.maxViews.toLocaleString() : '∞'} views
                  </span>
                  <span className="text-sm font-bold text-foreground">{tier.rate} sek / 1k</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Button 
            size="lg" 
            className="w-full py-5 text-base font-bold rounded-full bg-black hover:bg-black/80 text-white"
          >
            Submit Content
          </Button>
        </div>

        {/* Right side - Campaign image */}
        <div className="flex-shrink-0">
          <div className="relative w-64 aspect-[9/16] rounded-2xl overflow-hidden">
            <img 
              src={campaign.image} 
              alt={campaign.brand} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailView;

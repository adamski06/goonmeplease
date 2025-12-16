import React from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
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
  exampleImages?: string[];
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
    <div className="h-full overflow-y-auto px-8">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-jakarta"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-base font-medium">Back to ads</span>
      </button>

      <div className="flex flex-col gap-6">
        {/* Main info block - Logo, description, and image together */}
        <div className="flex gap-10 items-start">
          <div className="max-w-xl">
            {/* Header - Logo, company name, and content type */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 flex-shrink-0">
                <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain" />
              </div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-2xl font-bold text-foreground font-montserrat">{campaign.brand}</h1>
                <p className="text-lg text-foreground font-montserrat">- {campaign.contentType}</p>
              </div>
              <button
                onClick={onToggleSave}
                className="flex items-center justify-center hover:scale-110 transition-transform ml-auto"
              >
                <Bookmark 
                  className={`h-5 w-5 ${isSaved ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* Description */}
            <p className="text-base text-foreground font-jakarta leading-relaxed">{campaign.description}</p>
          </div>
            
          {/* Campaign image */}
          <div className="relative w-44 aspect-[9/16] rounded-xl overflow-hidden flex-shrink-0">
            <img 
              src={campaign.image} 
              alt={campaign.brand} 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Requirements - card style */}
        <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface rounded-2xl p-6 -ml-6 max-w-[calc(36rem+2.5rem+11rem+1.5rem)]">
          <h3 className="text-base font-semibold text-foreground mb-4 font-montserrat">Requirements</h3>
          
          <div className="flex gap-6">
            {/* Bullet points */}
            <ul className="space-y-2">
              {campaign.guidelines.map((guideline, idx) => (
                <li key={idx} className="text-sm text-foreground font-jakarta flex items-start gap-2">
                  <span className="text-foreground">•</span>
                  {guideline}
                </li>
              ))}
            </ul>

            {/* Example pictures - always show 4 slots */}
            <div className="flex gap-2 flex-shrink-0">
              {[0, 1].map((i) => {
                const img = campaign.exampleImages?.[i];
                return img ? (
                  <div 
                    key={i}
                    className="w-20 h-20 lg:w-28 lg:h-28 rounded-lg overflow-hidden"
                  >
                    <img src={img} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div 
                    key={i}
                    className="w-20 h-20 lg:w-28 lg:h-28 rounded-lg bg-muted/50 flex items-center justify-center"
                  >
                    <span className="text-xs text-muted-foreground">Example {i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Display - Full width */}
      <div className="mb-6 mt-6">
        <div className="flex items-end justify-between">
          {/* Left side - rate per view */}
          <div className="bg-black rounded-full px-4 py-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-white font-montserrat">{campaign.ratePerThousand}</span>
            <span className="text-sm text-white font-jakarta">sek</span>
            <span className="text-xs text-white font-jakarta">/ 1000 views</span>
          </div>
          {/* Right side - max earnings bubble */}
          <div className="bg-black rounded-full rounded-br-none px-6 py-3 flex items-baseline gap-1.5">
            <span className="text-4xl font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
            <span className="text-lg text-white font-montserrat">sek</span>
          </div>
        </div>
        {/* Black line */}
        <div className="h-[2px] bg-black mt-2 mb-2" />
        {/* Views needed bubble */}
        <div className="flex justify-end">
          <div className="bg-white border border-black/10 rounded-full rounded-tr-none px-5 py-2 flex items-baseline gap-1.5">
            <span className="text-xl font-normal text-black font-jakarta">
              {((campaign.maxEarnings / campaign.ratePerThousand) * 1000).toLocaleString()}</span>
            <span className="text-sm text-black font-jakarta">views</span>
          </div>
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
  );
};

export default CampaignDetailView;

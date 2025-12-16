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

      <div className="flex gap-16">
        {/* Left side - Campaign info */}
        <div className="flex-1">
          {/* Header - Logo and company name */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-montserrat">{campaign.brand}</h1>
            <button
              onClick={onToggleSave}
              className="ml-auto flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Bookmark 
                className={`h-5 w-5 ${isSaved ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {/* Video type / Creative freedom description */}
          <div className="mb-6">
            <p className="text-lg text-foreground font-jakarta">{campaign.contentType}</p>
            <p className="text-base text-black mt-1">{campaign.description}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-foreground mb-3 font-montserrat">Requirements</h3>
            
            <div className="flex gap-8">
              {/* Bullet points */}
              <ul className="space-y-2 flex-1">
                {campaign.guidelines.map((guideline, idx) => (
                  <li key={idx} className="text-base text-foreground font-jakarta flex items-start gap-2">
                    <span className="text-foreground">•</span>
                    {guideline}
                  </li>
                ))}
              </ul>

              {/* Example pictures */}
              <div className="flex gap-2 lg:gap-3 flex-shrink-0">
                {(campaign.exampleImages || []).length > 0 ? (
                  campaign.exampleImages?.map((img, i) => (
                    <div 
                      key={i}
                      className="w-24 h-24 lg:w-36 lg:h-36 rounded-lg overflow-hidden border border-border/50"
                    >
                      <img src={img} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="w-24 h-24 lg:w-36 lg:h-36 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center"
                    >
                      <span className="text-xs lg:text-sm text-muted-foreground">Example {i}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Earnings Display */}
          <div className="mb-6">
            <div className="flex items-end justify-between">
              {/* Left side - rate per view */}
              <div className="bg-black rounded-full px-4 py-2 flex items-baseline gap-1">
                <span className="text-xl font-bold text-white font-montserrat">{campaign.ratePerThousand}</span>
                <span className="text-sm text-white font-jakarta">sek</span>
                <span className="text-xs text-white font-jakarta">/ 1000 views</span>
              </div>
              {/* Right side - max earnings with pointer */}
              <div className="flex flex-col items-end">
                <div className="bg-black rounded-full px-5 py-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                  <span className="text-sm text-white font-montserrat">sek</span>
                </div>
                {/* Pointer triangle */}
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-black mr-[8px]" />
              </div>
            </div>
            {/* Black line - shorter to end at pointer */}
            <div className="h-[2px] bg-black mt-3 mb-3 mr-[16px]" />
            {/* Views needed */}
            <div className="flex flex-col items-end">
              {/* Pointer triangle pointing up */}
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white mr-[8px]" />
              <div className="bg-white rounded-full px-4 py-2 flex items-baseline gap-1 border border-black/10">
                <span className="text-sm text-black font-jakarta">
                  {((campaign.maxEarnings / campaign.ratePerThousand) * 1000).toLocaleString()}</span>
                <span className="text-xs text-black font-jakarta">views
                </span>
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

        {/* Right side - Campaign image */}
        <div className="flex-shrink-0">
          <div className="relative w-48 aspect-[9/16] rounded-xl overflow-hidden">
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

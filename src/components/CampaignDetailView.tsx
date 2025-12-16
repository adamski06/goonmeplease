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
              {/* Right side - max earnings bubble with tail */}
              <div className="relative">
                <svg className="h-[52px] w-auto" viewBox="0 0 180 52" fill="none" preserveAspectRatio="xMaxYMid meet">
                  <path d="M0 20C0 8.954 8.954 0 20 0H140C151.046 0 160 8.954 160 20V32C160 43.046 151.046 52 140 52H20C8.954 52 0 43.046 0 32V20Z M160 32L180 52V32H160Z" fill="black"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pr-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                    <span className="text-sm text-white font-montserrat">sek</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Black line */}
            <div className="h-[2px] bg-black mt-2 mb-2 mr-0" />
            {/* Views needed bubble with tail pointing up */}
            <div className="flex flex-col items-end">
              <div className="relative">
                <svg className="h-[40px] w-auto" viewBox="0 0 140 40" fill="none" preserveAspectRatio="xMaxYMid meet">
                  <path d="M0 16C0 7.163 7.163 0 16 0H108C116.837 0 124 7.163 124 16V24C124 32.837 116.837 40 108 40H16C7.163 40 0 32.837 0 24V16Z M124 8L140 0H124V8Z" fill="white" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pr-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-black font-jakarta">
                      {((campaign.maxEarnings / campaign.ratePerThousand) * 1000).toLocaleString()}</span>
                    <span className="text-xs text-black font-jakarta">views</span>
                  </div>
                </div>
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

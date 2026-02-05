import React from 'react';
import { Bookmark, Send } from 'lucide-react';

interface Campaign {
  id: string;
  brand: string;
  title: string;
  description: string;
  ratePerThousand: number;
  maxEarnings: number;
  logo: string;
  image: string;
  contentType: string;
  productVisibility: string;
  videoLength: string;
  guidelines: string[];
  tiers: { minViews: number; maxViews: number | null; rate: number }[];
  exampleImages?: string[];
}

interface CampaignCardProps {
  campaign: Campaign;
  isSaved: boolean;
  onSelect: (campaign: Campaign) => void;
  onToggleFavorite: (campaignId: string, e: React.MouseEvent) => void;
  isExpanded?: boolean;
}

// Helper to generate pseudo-random stats based on campaign ID
const getRandomStat = (campaignId: string, type: 'saves' | 'shares') => {
  const seed = campaignId.charCodeAt(0) + campaignId.charCodeAt(campaignId.length - 1) + (type === 'shares' ? 100 : 0);
  return 500 + (seed * 17) % 1500;
};

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  isSaved,
  onToggleFavorite,
  isExpanded = false,
}) => {
  return (
    <div className="h-[calc(100dvh-80px)] md:h-screen flex items-center justify-center md:items-center md:justify-start snap-start snap-always md:py-6 md:pl-16 md:gap-8">
      {/* Mobile: Image container with overlaid content */}
      <div
        className="relative w-[calc(100%-24px)] h-[calc(100%-180px)] rounded-[20px] overflow-hidden md:w-auto md:h-[calc(100vh-48px)] md:aspect-[9/16] md:rounded-none cursor-pointer md:hover:scale-[1.01] md:flex-shrink-0"
      >
        <img
          src={campaign.image}
          alt={campaign.brand}
          className="w-full h-full object-cover"
        />
        {/* Noise overlay */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Mobile overlay content - positioned at bottom of image, moves with swipe */}
        <div className={`md:hidden absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
          
          {/* Content container */}
          <div className="relative flex items-end justify-between gap-4">
            {/* Description - left side */}
            <div className="flex-1 pr-2">
              <p className="text-white text-sm font-medium line-clamp-3 drop-shadow-lg font-jakarta">
                {campaign.description}
              </p>
            </div>
            
            {/* Icons - right side */}
            <div className="flex flex-col items-center gap-3">
              {/* Company logo */}
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30">
                <img
                  src={campaign.logo}
                  alt={campaign.brand}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Save button + count */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={(e) => onToggleFavorite(campaign.id, e)}
                  className="flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Bookmark
                    className="h-7 w-7 fill-white text-white drop-shadow-lg"
                    strokeWidth={1.5}
                  />
                </button>
                <span className="text-xs text-white font-medium drop-shadow-lg">
                  {getRandomStat(campaign.id, 'saves').toLocaleString()}
                </span>
              </div>

              {/* Share button + count */}
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (navigator.share) {
                      navigator.share({
                        title: campaign.brand,
                        text: campaign.description,
                      });
                    }
                  }}
                  className="flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Send className="h-6 w-6 fill-white text-white drop-shadow-lg" strokeWidth={1.5} />
                </button>
                <span className="text-xs text-white font-medium drop-shadow-lg">
                  {getRandomStat(campaign.id, 'shares').toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Campaign info (desktop only) */}
      <div className="hidden md:flex h-[calc(100vh-48px)] flex-col justify-between min-w-[280px] py-4">
        <div>
          <span className="text-sm font-medium text-muted-foreground font-montserrat">
            {campaign.brand}
          </span>
          <p className="text-2xl font-bold text-foreground mt-2 font-jakarta">
            {campaign.description}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-5xl font-bold text-foreground font-montserrat">
              {campaign.maxEarnings.toLocaleString()}
            </span>
            <span className="text-xl font-semibold text-foreground font-montserrat">
              sek
            </span>
          </div>
          <button
            onClick={(e) => onToggleFavorite(campaign.id, e)}
            className="flex items-center justify-center hover:scale-110 transition-transform p-2"
          >
            <Bookmark
              className={`h-8 w-8 ${isSaved ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;

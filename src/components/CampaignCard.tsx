import React, { useState } from 'react';
import { Bookmark, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  isSaved,
  onToggleFavorite,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNodeClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="h-[calc(100dvh-80px)] md:h-screen flex items-center justify-center md:items-center md:justify-start snap-start snap-always md:py-6 md:pl-16 md:gap-8">
      {/* Full screen photo on mobile, left side on desktop */}
      <div
        className="relative w-[calc(100%-24px)] h-[calc(100%-16px)] rounded-2xl overflow-hidden md:w-auto md:h-[calc(100vh-48px)] md:aspect-[9/16] md:rounded-none cursor-pointer md:hover:scale-[1.01] md:flex-shrink-0"
      >
        <img
          src={campaign.image}
          alt={campaign.brand}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Right side icons - Company logo + Save + Share (mobile only) - hidden when expanded */}
        <div 
          className={`md:hidden absolute bottom-32 right-3 flex flex-col items-center gap-3 transition-all duration-500 ease-out ${
            isExpanded ? 'opacity-0 pointer-events-none translate-x-4' : 'opacity-100 translate-x-0'
          }`}
        >
          {/* Company profile icon - circular with cover */}
          <div
            className="w-12 h-12 rounded-full overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <img
              src={campaign.logo}
              alt={campaign.brand}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Save button in glass bubble */}
          <button
            onClick={(e) => onToggleFavorite(campaign.id, e)}
            className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Bookmark
              className={`h-6 w-6 ${isSaved ? 'fill-white text-white' : 'text-white/90'}`}
              strokeWidth={1.5}
            />
          </button>

          {/* Share button in glass bubble */}
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
            className="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(12px) saturate(180%)',
              WebkitBackdropFilter: 'blur(12px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Send className="h-5 w-5 text-white/90" strokeWidth={1.5} />
          </button>
        </div>

        {/* Expandable Glass Node - Mobile Only */}
        <div
          onClick={handleNodeClick}
          className="md:hidden absolute left-3 right-3 rounded-[22px] overflow-hidden"
          style={{
            bottom: '12px',
            maxHeight: isExpanded ? 'calc(100% - 92px)' : '72px',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            transition: 'max-height 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {!isExpanded ? (
            /* Collapsed state - earnings info */
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white font-montserrat drop-shadow-sm">
                  {campaign.ratePerThousand}
                </span>
                <span className="text-xs font-medium text-white/90 font-montserrat drop-shadow-sm">
                  sek / 1000 views
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-medium text-white/80 font-montserrat drop-shadow-sm">
                  Up to
                </span>
                <span className="text-xl font-bold text-white font-montserrat drop-shadow-sm">
                  {campaign.maxEarnings.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-white/90 font-montserrat drop-shadow-sm">
                  sek
                </span>
              </div>
            </div>
          ) : (
            /* Expanded state - full campaign detail */
            <div className="h-full flex flex-col overflow-hidden">
              {/* Header with brand */}
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/10">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={campaign.logo}
                    alt={campaign.brand}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-base font-bold text-white font-montserrat flex-1 drop-shadow-sm">
                  {campaign.brand}
                </h2>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(campaign.id, e);
                  }}
                  className="p-1"
                >
                  <Bookmark
                    className={`h-5 w-5 drop-shadow-sm ${isSaved ? 'fill-white text-white' : 'text-white/70'}`}
                    strokeWidth={1.5}
                  />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
                {/* Description */}
                <p className="text-sm text-white font-jakarta leading-relaxed mb-5 drop-shadow-sm">
                  {campaign.description}
                </p>

                {/* Requirements */}
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <h3 className="text-sm font-semibold text-white mb-2 font-montserrat drop-shadow-sm">Requirements</h3>
                  <ul className="space-y-1.5">
                    {campaign.guidelines.map((guideline, idx) => (
                      <li key={idx} className="text-xs text-white/90 font-jakarta flex items-start gap-2 drop-shadow-sm">
                        <span className="text-white/70">•</span>
                        {guideline}
                      </li>
                    ))}
                  </ul>

                  {/* Example images */}
                  {campaign.exampleImages && campaign.exampleImages.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {campaign.exampleImages.slice(0, 2).map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={img} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed CTA at bottom */}
              <div className="px-5 pb-4 pt-2">
                <Button
                  size="lg"
                  className="w-full py-4 text-sm font-bold rounded-full bg-white hover:bg-white/90 text-black"
                  onClick={(e) => e.stopPropagation()}
                >
                  Submit Content
                </Button>
              </div>
            </div>
          )}
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

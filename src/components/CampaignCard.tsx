import React, { useState, useRef } from 'react';
import { Bookmark } from 'lucide-react';

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
  onSelect,
  onToggleFavorite,
}) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartXRef = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const offset = Math.max(0, touchStartXRef.current - currentX);
    setDragOffset(offset);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragOffset > 80) {
      onSelect(campaign);
    }
    setDragOffset(0);
  };

  return (
    <div
      className="h-[calc(100dvh-80px)] md:h-screen flex items-center justify-center md:items-center md:justify-start snap-start snap-always md:py-6 md:pl-16 md:gap-8"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full screen photo on mobile, left side on desktop */}
      <div
        onClick={() => onSelect(campaign)}
        className="relative w-[calc(100%-24px)] h-[calc(100%-16px)] rounded-2xl overflow-hidden md:w-auto md:h-[calc(100vh-48px)] md:aspect-[9/16] md:rounded-none cursor-pointer md:hover:scale-[1.01] md:flex-shrink-0"
        style={{
          transform: `translateX(${-dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
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

        {/* Right side icons - Company logo + Save (mobile only) */}
        <div className="md:hidden absolute bottom-36 right-4 flex flex-col items-center gap-3">
          {/* Company profile icon */}
          <div
            className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center"
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
              className="w-7 h-7 object-contain"
            />
          </div>

          {/* Save button */}
          <button
            onClick={(e) => onToggleFavorite(campaign.id, e)}
            className="flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bookmark
              className={`h-7 w-7 ${isSaved ? 'fill-white text-white' : 'text-white/80'}`}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Apple Liquid Glass Earnings Node (mobile only) */}
        <div
          className="md:hidden absolute bottom-4 right-4 px-4 py-3 rounded-[20px]"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
        >
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white font-montserrat">
              {campaign.ratePerThousand}
            </span>
            <span className="text-xs font-medium text-white/80 font-montserrat">
              sek / 1000 views
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-medium text-white/70 font-montserrat">
              Up to
            </span>
            <span className="text-xl font-bold text-white font-montserrat">
              {campaign.maxEarnings.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-white/90 font-montserrat">
              sek
            </span>
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

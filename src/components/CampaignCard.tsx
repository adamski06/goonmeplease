import React, { useRef, useState, useEffect } from 'react';
import { Bookmark, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import tiktokPlatformLogo from '@/assets/platforms/tiktok.png';

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

// Helper to generate pseudo-random stats based on campaign ID
const getRandomStat = (campaignId: string, type: 'saves' | 'shares') => {
  const seed = campaignId.charCodeAt(0) + campaignId.charCodeAt(campaignId.length - 1) + (type === 'shares' ? 100 : 0);
  return 500 + (seed * 17) % 1500;
};

const CampaignCard: React.FC<CampaignCardProps> = ({
  campaign,
  isSaved,
  onToggleFavorite,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Handle drag to close
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isExpanded) return;
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isExpanded) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - dragStartY.current;
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 100) {
      setIsExpanded(false);
    }
    setDragY(0);
  };

  // Handle picture tap to expand
  const handlePictureClick = () => {
    setIsExpanded(true);
  };

  // Handle node tap to toggle
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Close expanded state when scrolling away
  useEffect(() => {
    setIsExpanded(false);
  }, [campaign.id]);

  // Nav bar = 80px, node = 68px, gap between node and nav = 8px, gap between image and node = 8px
  // So image bottom = 80 + 8 + 68 + 8 = 164px from bottom
  return (
    <div className="h-[calc(100dvh-80px)] md:h-screen relative flex flex-col items-center justify-start md:flex-row md:items-center md:justify-start snap-start snap-always md:py-6 md:pl-16 md:gap-8">
      {/* Mobile: Image container with overlaid content */}
      <div
        onClick={handlePictureClick}
        className="md:hidden absolute top-3 left-3 right-3 bottom-[164px] rounded-[20px] overflow-hidden cursor-pointer"
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
        
        {/* Mobile overlay content - positioned at bottom of image */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(campaign.id, e);
                  }}
                  className="flex items-center justify-center"
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
                  className="flex items-center justify-center"
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

      {/* Desktop: Image container */}
      <div
        className="hidden md:block relative md:flex-none md:h-[calc(100vh-48px)] md:aspect-[9/16] overflow-hidden cursor-pointer md:flex-shrink-0"
      >
        <img
          src={campaign.image}
          alt={campaign.brand}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Mobile White Node - positioned above nav bar with 8px gap */}
      <div
        ref={nodeRef}
        onClick={handleNodeClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`md:hidden absolute left-3 right-3 rounded-[20px] overflow-hidden bg-white ${isExpanded ? 'bottom-[88px] z-20' : 'bottom-[88px]'}`}
        style={{
          height: isExpanded ? 'auto' : '68px',
          maxHeight: isExpanded ? `calc(100dvh - 180px)` : '68px',
          transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
          transform: isDragging ? `translateY(${dragY}px)` : 'translateY(0)',
        }}
      >
        {!isExpanded ? (
          /* Collapsed state - earnings info */
          <div className="px-4 py-4 flex items-center justify-between h-[68px]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-black font-montserrat">
                {campaign.maxEarnings.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-black/70 font-montserrat">
                sek
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-black/60 font-montserrat">
                Platform:
              </span>
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={tiktokPlatformLogo}
                  alt="TikTok"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Expanded state - full campaign detail */
          <div className="h-full flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100dvh - 180px)' }}>
            {/* Drag handle indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-black/20 rounded-full" />
            </div>
            
            {/* Header with brand */}
            <div className="flex items-center gap-3 px-5 pt-2 pb-3 border-b border-black/10">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={campaign.logo}
                  alt={campaign.brand}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-base font-bold text-black font-montserrat flex-1">
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
                  className={`h-5 w-5 ${isSaved ? 'fill-black text-black' : 'text-black/50'}`}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
              {/* Description */}
              <p className="text-sm text-black/80 font-jakarta leading-relaxed mb-5">
                {campaign.description}
              </p>

              {/* Requirements */}
              <div className="bg-black/5 rounded-xl p-4 mb-4">
                <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Requirements</h3>
                <ul className="space-y-1.5">
                  {campaign.guidelines.map((guideline, idx) => (
                    <li key={idx} className="text-xs text-black/70 font-jakarta flex items-start gap-2">
                      <span className="text-black/40">•</span>
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
                className="w-full py-4 text-sm font-bold rounded-full bg-black hover:bg-black/90 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                Submit Content
              </Button>
            </div>
          </div>
        )}
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
            className="flex items-center justify-center p-2"
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
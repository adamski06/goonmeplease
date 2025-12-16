import React, { useState, useRef } from 'react';
import { ArrowLeft, Bookmark, ChevronLeft } from 'lucide-react';
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
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const totalViews = (campaign.maxEarnings / campaign.ratePerThousand) * 1000;

  // Swipe back handling for mobile
  let touchStartX = 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    // Swipe right to go back
    if (swipeDistance > 100) {
      onBack();
    }
  };

  const handleLineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lineRef.current) {
      const rect = lineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setHoverPosition(Math.max(percentage, 12.5));
    }
  };

  const handleLineMouseLeave = () => {
    setHoverPosition(null);
  };

  const getValuesAtPosition = (percentage: number) => {
    const views = Math.round((percentage / 100) * totalViews);
    const earnings = Math.round((views / 1000) * campaign.ratePerThousand);
    return { views, earnings };
  };

  return (
    <div 
      className="h-full overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Layout */}
      <div className="md:hidden h-full flex flex-col">
        {/* Fixed video peek at top - tap to go back */}
        <button 
          onClick={onBack}
          className="fixed top-2 left-3 right-3 h-14 z-50 overflow-hidden rounded-2xl"
        >
          {/* Video positioned so only bottom ~10% shows */}
          <div className="absolute bottom-0 left-0 right-0 h-[60vh] w-full">
            <img 
              src={campaign.image} 
              alt={campaign.brand} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent" />
          </div>
          {/* Subtle indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <div className="w-10 h-1 bg-white/60 rounded-full" />
          </div>
        </button>

        {/* Scrollable content below the peek */}
        <div className="flex-1 overflow-y-auto pt-20 px-4 pb-32">
          {/* Header - Logo, company name, content type */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain" />
            </div>
            <div className="flex items-baseline gap-2 flex-1 min-w-0">
              <h1 className="text-lg font-bold text-foreground font-montserrat">{campaign.brand}</h1>
              <p className="text-sm text-foreground font-montserrat truncate">- {campaign.contentType}</p>
            </div>
            <button
              onClick={onToggleSave}
              className="flex items-center justify-center p-1"
            >
              <Bookmark 
                className={`h-5 w-5 ${isSaved ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
                strokeWidth={1.5}
              />
            </button>
          </div>

        {/* Description */}
        <p className="text-base text-foreground font-jakarta leading-relaxed mb-6">{campaign.description}</p>

        {/* Earnings Display - Monet style scaled for mobile */}
        <div className="mb-6 relative">
          {/* Rate per view */}
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-lg font-bold text-foreground font-montserrat">{campaign.ratePerThousand}</span>
            <span className="text-sm font-bold text-foreground font-jakarta">sek</span>
            <span className="text-xs font-bold text-foreground font-jakarta">/ 1000 views</span>
          </div>

          {/* Line and bubbles */}
          <div className="relative mt-4">
            {/* Earnings bubble - above line */}
            <div className="absolute -top-10 right-0 pointer-events-none z-20">
              <div className="bg-black px-4 py-2 flex items-baseline gap-1 rounded-full rounded-br-none">
                <span className="text-2xl font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                <span className="text-sm text-white font-montserrat">sek</span>
              </div>
            </div>

            {/* The line */}
            <div className="relative py-4">
              <div className="h-[2px] bg-black w-full" />
              
              {/* Min marker */}
              {(() => {
                const minViews = Math.round(totalViews * 0.125);
                return (
                  <div className="absolute z-20" style={{ left: '12.5%', top: '50%', transform: 'translateY(-50%)' }}>
                    <div className="w-[2px] h-[10px] bg-black -translate-x-1/2" />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none">
                      <span className="text-xs text-black font-jakarta">min</span>
                    </div>
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                      <span className="text-xs text-black font-jakarta">{minViews.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Views bubble - below line */}
            <div className="absolute top-10 right-0 pointer-events-none z-20">
              <div className="bg-white border border-black/10 px-3 py-1.5 flex items-baseline gap-1 rounded-full rounded-tr-none">
                <span className="text-base font-normal text-black font-jakarta">{totalViews.toLocaleString()}</span>
                <span className="text-xs text-black font-jakarta">views</span>
              </div>
            </div>
          </div>

          {/* Spacer for bubbles */}
          <div className="h-12" />
        </div>

        {/* Requirements */}
        <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface rounded-xl p-4 mb-6 -mx-2">
          <h3 className="text-sm font-semibold text-foreground mb-3 font-montserrat">Requirements</h3>
          <ul className="space-y-2 mb-4">
            {campaign.guidelines.map((guideline, idx) => (
              <li key={idx} className="text-sm text-foreground font-jakarta flex items-start gap-2">
                <span className="text-foreground">•</span>
                {guideline}
              </li>
            ))}
          </ul>
          
          {/* Example images inline */}
          {campaign.exampleImages && campaign.exampleImages.length > 0 && (
            <div className="flex gap-2">
              {campaign.exampleImages.slice(0, 2).map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={img} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Fixed CTA */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button 
            size="lg" 
            className="w-full py-5 text-base font-bold rounded-full bg-black hover:bg-black/80 text-white"
          >
            Submit Content
          </Button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block px-8">
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
              <p className="text-xl text-foreground font-jakarta leading-relaxed">{campaign.description}</p>
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

        </div>

        {/* Earnings Display - Full width */}
        <div className="mb-6 mt-16 max-w-[calc(36rem+2.5rem+11rem)] relative">
          {/* Rate per view - left */}
          <div className="relative flex items-baseline gap-1 mb-2 -translate-y-14">
            <span className="text-xl font-bold text-foreground font-montserrat">{campaign.ratePerThousand}</span>
            <span className="text-sm font-bold text-foreground font-jakarta">sek</span>
            <span className="text-xs font-bold text-foreground font-jakarta">/ 1000 views</span>
          </div>

          {/* Line and bubbles container */}
          <div className="relative mt-6">
            {/* Earnings bubble - above line, right side when not hovering */}
            {(() => {
              const maxPillPosition = 85;
              const pillPosition = hoverPosition !== null ? Math.min(hoverPosition, maxPillPosition) : null;
              
              return (
                <div 
                  className="absolute -top-12 pointer-events-none z-20"
                  style={pillPosition !== null ? { 
                    left: `${pillPosition}%`,
                    transform: 'translateX(-50%)'
                  } : {
                    right: 0,
                    transform: 'translateX(0)'
                  }}
                >
                  <div className={`bg-black px-6 py-3 flex items-baseline gap-1.5 min-w-[180px] justify-center ${hoverPosition !== null ? 'rounded-full' : 'rounded-full rounded-br-none'}`}>
                    <span className="text-4xl font-bold text-white font-montserrat">
                      {hoverPosition !== null 
                        ? getValuesAtPosition(hoverPosition).earnings.toLocaleString()
                        : campaign.maxEarnings.toLocaleString()}
                    </span>
                    <span className="text-lg text-white font-montserrat">sek</span>
                  </div>
                </div>
              );
            })()}

            {/* Interactive line */}
            <div 
              ref={lineRef}
              className="relative py-8 -my-8 cursor-pointer"
              onMouseMove={handleLineMouseMove}
              onMouseLeave={handleLineMouseLeave}
            >
              {/* The actual line */}
              <div className="h-[2px] bg-black w-full" />

              {/* Min marker */}
              {(() => {
                const minViews = Math.round(totalViews * 0.125);
                const minPosition = 12.5;
                return (
                  <div className="absolute z-20" style={{ left: `${minPosition}%`, top: '50%', transform: 'translateY(-50%)' }}>
                    {/* Vertical tick */}
                    <div className="w-[2px] h-[12px] bg-black -translate-x-1/2" />
                    {/* Minimum text above */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none">
                      <span className="text-sm text-black font-jakarta">minimum</span>
                    </div>
                    {/* Views text below */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                      <span className="text-sm text-black font-jakarta">{minViews.toLocaleString()} views</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Views bubble - below line, right side when not hovering */}
            {(() => {
              const maxPillPosition = 85;
              const pillPosition = hoverPosition !== null ? Math.min(hoverPosition, maxPillPosition) : null;
              
              return (
                <div 
                  className="absolute top-12 pointer-events-none z-20"
                  style={pillPosition !== null ? { 
                    left: `${pillPosition}%`,
                    transform: 'translateX(-50%)'
                  } : {
                    right: 0,
                    transform: 'translateX(0)'
                  }}
                >
                  <div className={`bg-white border border-black/10 px-5 py-2 flex items-baseline gap-1.5 min-w-[180px] justify-center ${hoverPosition !== null ? 'rounded-full' : 'rounded-full rounded-tr-none'}`}>
                    <span className="text-xl font-normal text-black font-jakarta">
                      {hoverPosition !== null 
                        ? getValuesAtPosition(hoverPosition).views.toLocaleString()
                        : totalViews.toLocaleString()}
                    </span>
                    <span className="text-sm text-black font-jakarta">views</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Spacer for the bubbles */}
          <div className="h-16" />
        </div>

        {/* Requirements - card style */}
        <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface rounded-2xl p-6 -ml-6 max-w-[calc(36rem+2.5rem+11rem+1.5rem)] mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4 font-montserrat">Requirements</h3>
          
          <div className="flex gap-6">
            {/* Bullet points */}
            <ul className="space-y-2">
              {campaign.guidelines.map((guideline, idx) => (
                <li key={idx} className="text-base text-foreground font-jakarta flex items-start gap-2">
                  <span className="text-foreground">•</span>
                  {guideline}
                </li>
              ))}
            </ul>

            {/* Example pictures - always show 2 slots */}
            <div className="flex gap-2 flex-shrink-0">
              {[0, 1].map((i) => {
                const img = campaign.exampleImages?.[i];
                return img ? (
                  <div 
                    key={i}
                    className="w-28 h-28 lg:w-36 lg:h-36 rounded-lg overflow-hidden"
                  >
                    <img src={img} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div 
                    key={i}
                    className="w-28 h-28 lg:w-36 lg:h-36 rounded-lg bg-muted/50 flex items-center justify-center"
                  >
                    <span className="text-sm text-foreground/60">Example {i + 1}</span>
                  </div>
                );
              })}
            </div>
        </div>
        </div>

        {/* Inspiration TikTok Videos */}
        <div className="mt-6 mb-6">
          <h3 className="text-base font-semibold text-foreground mb-4 font-montserrat">Inspiration</h3>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-24 aspect-[9/16] rounded-lg bg-muted/50 flex items-center justify-center border border-border/50"
              >
                <span className="text-xs text-foreground/60 text-center px-1">TikTok {i + 1}</span>
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
    </div>
  );
};

export default CampaignDetailView;
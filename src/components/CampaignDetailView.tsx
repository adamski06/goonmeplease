import React, { useState, useRef } from 'react';
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
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  const totalViews = (campaign.maxEarnings / campaign.ratePerThousand) * 1000;

  const handleLineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (lineRef.current) {
      const rect = lineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setHoverPosition(percentage);
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

      </div>

      {/* Earnings Display - Full width */}
      <div className="mb-6 mt-16 max-w-[calc(36rem+2.5rem+11rem)] relative">
        {/* Rate per view - left */}
        <div className="relative -mt-8 flex items-baseline gap-1 mb-2">
          <span className="text-xl font-bold text-foreground font-montserrat">{campaign.ratePerThousand}</span>
          <span className="text-sm font-bold text-foreground font-jakarta">sek</span>
          <span className="text-xs font-bold text-foreground font-jakarta">/ 1000 views</span>
        </div>

        {/* Line and bubbles container */}
        <div className="relative mt-10">
          {/* Earnings bubble - above line, right side when not hovering */}
          <div 
            className="absolute -top-14 pointer-events-none transition-all duration-100 ease-out z-20"
            style={hoverPosition !== null ? { 
              left: `${hoverPosition}%`,
              transform: 'translateX(-50%)'
            } : {
              right: 0,
              transform: 'translateX(0)'
            }}
          >
            <div className="bg-black rounded-full rounded-br-none px-6 py-3 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-white font-montserrat">
                {hoverPosition !== null 
                  ? getValuesAtPosition(hoverPosition).earnings.toLocaleString()
                  : campaign.maxEarnings.toLocaleString()}
              </span>
              <span className="text-lg text-white font-montserrat">sek</span>
            </div>
          </div>

          {/* Interactive line */}
          <div 
            ref={lineRef}
            className="relative py-8 -my-8 cursor-crosshair"
            onMouseMove={handleLineMouseMove}
            onMouseLeave={handleLineMouseLeave}
          >
            {/* The actual line */}
            <div className="h-[2px] bg-black w-full" />
            
            {/* Hover indicator tick */}
            {hoverPosition !== null && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${hoverPosition}%` }}
              >
                <div className="w-[2px] h-[12px] bg-black -translate-x-1/2" />
              </div>
            )}

            {/* Min marker */}
            {(() => {
              const minViews = Math.round(totalViews * 0.125);
              const minEarnings = Math.round((minViews / 1000) * campaign.ratePerThousand);
              const minPosition = 12.5;
              return (
                <div className="absolute group cursor-pointer z-20" style={{ left: `${minPosition}%`, top: '50%', transform: 'translateY(-50%)' }}>
                  {/* Hover area */}
                  <div className="absolute -inset-4" />
                  {/* Vertical tick */}
                  <div className="w-[2px] h-[12px] bg-black -translate-x-1/2" />
                  {/* Min bubble above with triangle */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                    <div className="bg-black text-white text-sm px-3 py-1 rounded-md whitespace-nowrap transition-all duration-300 ease-out flex items-center">
                      <span>min</span>
                      <span className="max-w-0 group-hover:max-w-[100px] overflow-hidden transition-all duration-300 ease-out">
                        <span className="pl-1 relative top-[1px]">= {minEarnings} sek</span>
                      </span>
                    </div>
                    <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-black" />
                  </div>
                  {/* Views count below */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white border border-black/10 text-sm text-black font-jakarta px-3 py-1 rounded-full whitespace-nowrap flex items-baseline gap-1 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none">
                    <span>{minViews.toLocaleString()}</span>
                    <span className="text-xs">views</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Views bubble - below line, right side when not hovering */}
          <div 
            className="absolute top-12 pointer-events-none transition-all duration-100 ease-out z-20"
            style={hoverPosition !== null ? { 
              left: `${hoverPosition}%`,
              transform: 'translateX(-50%)'
            } : {
              right: 0,
              transform: 'translateX(0)'
            }}
          >
            <div className="bg-white border border-black/10 rounded-full rounded-tr-none px-5 py-2 flex items-baseline gap-1.5">
              <span className="text-xl font-normal text-black font-jakarta">
                {hoverPosition !== null 
                  ? getValuesAtPosition(hoverPosition).views.toLocaleString()
                  : totalViews.toLocaleString()}
              </span>
              <span className="text-sm text-black font-jakarta">views</span>
            </div>
          </div>
        </div>

        {/* Spacer for the bubbles */}
        <div className="h-24" />
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
  );
};

export default CampaignDetailView;

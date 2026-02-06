import React from 'react';
import { ChevronLeft, Bookmark, Plus } from 'lucide-react';

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
  const totalViews = (campaign.maxEarnings / campaign.ratePerThousand) * 1000;

  // Swipe back handling for mobile
  let touchStartX = 0;
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance > 100) {
      onBack();
    }
  };

  return (
    <div 
      className="h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Layout */}
      <div className="h-full flex flex-col bg-white animate-slide-in-right">
        {/* White top bar with back button */}
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 bg-white border-b border-black/5">
          <button 
            onClick={onBack}
            className="p-1 -ml-1"
          >
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <div className="w-8 h-8 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0 border border-black/10 overflow-hidden">
            {campaign.logo ? (
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-sm font-bold text-black">
                {campaign.brand.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h1 className="text-base font-bold text-black font-montserrat flex-1">{campaign.brand}</h1>
          <button
            onClick={onToggleSave}
            className="flex items-center justify-center p-1"
          >
            <Bookmark 
              className={`h-5 w-5 ${isSaved ? 'fill-black text-black' : 'text-black/40'}`}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28">
          {/* Description */}
          <p className="text-base text-black font-jakarta leading-relaxed mb-6">{campaign.description}</p>

          {/* Earnings Display */}
          <div className="mb-6 relative">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-lg font-bold text-black font-montserrat">{campaign.ratePerThousand}</span>
              <span className="text-sm font-bold text-black font-jakarta">sek</span>
              <span className="text-xs font-bold text-black font-jakarta">/ 1000 views</span>
            </div>

            <div className="relative mt-4">
              <div className="absolute -top-10 right-0 pointer-events-none z-20">
                <div className="bg-black px-4 py-2 flex items-baseline gap-1 rounded-full rounded-br-none">
                  <span className="text-2xl font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                  <span className="text-sm text-white font-montserrat">sek</span>
                </div>
              </div>

              <div className="relative py-4">
                <div className="h-[2px] bg-black w-full" />
                {(() => {
                  const minViews = Math.round(totalViews * 0.125);
                  return (
                    <div className="absolute z-20" style={{ left: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                      <div className="w-[2px] h-[10px] bg-black" />
                      <div className="absolute -top-6 left-0 pointer-events-none">
                        <span className="text-xs text-black font-jakarta">min</span>
                      </div>
                      <div className="absolute top-3 left-0 pointer-events-none whitespace-nowrap">
                        <span className="text-xs text-black font-jakarta">{minViews.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div className="absolute top-10 right-0 pointer-events-none z-20">
                <div className="bg-white border border-black/10 px-3 py-1.5 flex items-baseline gap-1 rounded-full rounded-tr-none">
                  <span className="text-base font-normal text-black font-jakarta">{totalViews.toLocaleString()}</span>
                  <span className="text-xs text-black font-jakarta">views</span>
                </div>
              </div>
            </div>

            <div className="h-12" />
          </div>

          {/* Requirements */}
          <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 rounded-xl p-4 mb-6 -mx-2">
            <h3 className="text-sm font-semibold text-black mb-3 font-montserrat">Requirements</h3>
            <ul className="space-y-2 mb-4">
              {campaign.guidelines.map((guideline, idx) => (
                <li key={idx} className="text-sm text-black font-jakarta flex items-start gap-2">
                  <span className="text-black">•</span>
                  {guideline}
                </li>
              ))}
            </ul>
            
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

        {/* Fixed CTA - glass styled */}
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-white via-white to-transparent">
          <div className="flex items-center justify-center gap-3">
            <button 
              className="h-12 px-8 text-sm font-bold rounded-full flex items-center gap-2 flex-1"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                backdropFilter: 'blur(12px)',
                color: 'black',
              }}
            >
              <Plus className="h-4 w-4" />
              Submit Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailView;

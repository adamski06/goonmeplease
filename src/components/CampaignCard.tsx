import React, { useRef, useState, useEffect } from 'react';
import { Bookmark, Plus } from 'lucide-react';
import tiktokPlatformLogo from '@/assets/platforms/tiktok.png';
import tiktokIcon from '@/assets/tiktok-icon.png';
import { Campaign } from '@/data/campaigns';

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

  return (
    <div className="h-[calc(100dvh-80px)] relative flex flex-col items-center justify-start snap-start snap-always">
      {/* Card container with image + overlapping white node */}
      <div className="absolute top-14 left-3 right-3 bottom-3">
        {/* Image section */}
        <div
          onClick={handlePictureClick}
          className="absolute inset-x-0 top-0 bottom-0 rounded-[48px] overflow-hidden cursor-pointer"
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
          
          {/* Mobile overlay content - description + company logo */}
          <div className={`absolute inset-x-0 bottom-[88px] p-4 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute inset-x-0 bottom-[-40px] h-[180px] bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />
            <div className="relative flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-white text-sm font-medium line-clamp-3 drop-shadow-lg font-jakarta">
                  {campaign.description}
                </p>
              </div>
              <div className="h-[36px] w-[36px] rounded-full overflow-hidden border border-white/30 flex-shrink-0 mt-1">
                <img
                  src={campaign.logo}
                  alt={campaign.brand}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* White Node - pill with glass effect */}
      <div
        ref={nodeRef}
        onClick={handleNodeClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`absolute rounded-[48px] overflow-hidden z-10 ${isExpanded ? 'left-3 right-3 bottom-3 z-20' : 'left-5 right-5 bottom-6'}`}
        style={{
          height: isExpanded ? 'auto' : '80px',
          maxHeight: isExpanded ? `calc(100dvh - 148px)` : '80px',
          transition: isDragging ? 'none' : 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
          transform: isDragging ? `translateY(${dragY}px)` : 'translateY(0)',
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
          border: '1.5px solid rgba(255,255,255,0.8)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
        }}
      >
        {!isExpanded ? (
          /* Collapsed state */
          <div className="px-4 flex items-center justify-between h-[80px]">
            <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[24px] px-5 py-2.5 flex items-baseline gap-1.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="text-xl font-bold text-white font-montserrat">
                {campaign.maxEarnings.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-white/80 font-montserrat">
                sek
              </span>
            </div>
            <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-full h-[44px] w-[44px] flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <img
                src={tiktokIcon}
                alt="TikTok"
                className="w-6 h-6 object-contain"
              />
            </div>
          </div>
        ) : (
          /* Expanded state */
          <div className="h-full flex flex-col overflow-hidden animate-fade-in" style={{ maxHeight: 'calc(100dvh - 148px)' }}>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-black/20 rounded-full" />
            </div>
            
            <div className="flex items-center gap-3 px-5 pt-2 pb-3 border-b border-black/10">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-base font-bold text-black font-montserrat flex-1">
                {campaign.brand}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">
                {campaign.description}
              </p>

              <div 
                className="rounded-xl p-4 mb-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Requirements</h3>
                <ul className="space-y-1.5">
                  {campaign.guidelines.map((guideline, idx) => (
                    <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                      <span className="text-black/40">•</span>
                      {guideline}
                    </li>
                  ))}
                </ul>

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

              <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mb-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <h3 className="text-sm font-semibold text-white mb-2 font-montserrat">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80 font-jakarta">Max earnings</span>
                    <span className="text-sm font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()} sek</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80 font-jakarta">Rate per 1K views</span>
                    <span className="text-sm font-bold text-white font-montserrat">{campaign.ratePerThousand} sek</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80 font-jakarta">Platform</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-white font-montserrat">TikTok</span>
                      <div className="w-4 h-4 rounded-full overflow-hidden">
                        <img src={tiktokPlatformLogo} alt="TikTok" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed CTA at bottom - glass styled */}
            <div className="px-5 pb-8 pt-3 flex items-center justify-center gap-3 flex-shrink-0">
              <button
                className="h-12 px-8 text-sm font-bold rounded-full flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
                  border: '1.5px solid rgba(60,60,60,0.6)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)',
                  color: 'white',
                }}
              >
                <Plus className="h-4 w-4" />
                Submit Content
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(campaign.id, e);
                }}
                className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)',
                  border: '1.5px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Bookmark
                  className={`h-5 w-5 ${isSaved ? 'fill-black text-black' : 'text-black/50'}`}
                  strokeWidth={1.5}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;

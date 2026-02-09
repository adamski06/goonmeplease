import React, { useRef, useState, useEffect } from 'react';
import { Bookmark, Plus, X } from 'lucide-react';
import tiktokIcon from '@/assets/tiktok-icon.png';
import { Campaign } from '@/data/campaigns';
import EarningsGraph, { calculateEarningsData, formatViewsForNote, formatEarningsForNote } from '@/components/EarningsGraph';
import SubmissionGuide from '@/components/SubmissionGuide';
import SubmitDraft from '@/components/SubmitDraft';
import { addRecentCampaign } from '@/hooks/useRecentCampaigns';

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
  const [isClosing, setIsClosing] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideSliding, setGuideSliding] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitSliding, setSubmitSliding] = useState(false);
  
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const nodeRef = useRef<HTMLDivElement>(null);

  const isVisuallyExpanded = isExpanded && !isClosing;

  const handleContinue = () => {
    addRecentCampaign(campaign.id);
    // Check if guide should be skipped
    try {
      const skipped = JSON.parse(localStorage.getItem('skippedGuides') || '[]');
      if (skipped.includes(campaign.id)) {
        setSubmitSliding(true);
        setTimeout(() => {
          setShowSubmit(true);
          setSubmitSliding(false);
        }, 300);
        return;
      }
    } catch {}
    setGuideSliding(true);
    setTimeout(() => {
      setShowGuide(true);
      setGuideSliding(false);
    }, 300);
  };

  const handleBackFromGuide = () => {
    setGuideSliding(true);
    setTimeout(() => {
      setShowGuide(false);
      setGuideSliding(false);
    }, 300);
  };

  const handleGuideComplete = () => {
    setGuideSliding(true);
    setTimeout(() => {
      setShowGuide(false);
      setGuideSliding(false);
      setSubmitSliding(true);
      setTimeout(() => {
        setShowSubmit(true);
        setSubmitSliding(false);
      }, 300);
    }, 300);
  };

  const handleBackFromSubmit = () => {
    setSubmitSliding(true);
    setTimeout(() => {
      setShowSubmit(false);
      setSubmitSliding(false);
    }, 300);
  };

  const triggerClose = () => {
    if (!isExpanded || isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
      setShowGuide(false);
      setGuideSliding(false);
      setShowSubmit(false);
      setSubmitSliding(false);
    }, 500);
  };

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
      triggerClose();
    }
    setDragY(0);
  };

  // Handle picture tap to expand
  const handlePictureClick = () => {
    setIsExpanded(true);
    addRecentCampaign(campaign.id);
  };

  // Handle node tap to toggle
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showGuide || guideSliding) return; // Don't close when guide is showing
    if (isExpanded) {
      triggerClose();
    } else {
      setIsExpanded(true);
    }
  };

  // Close expanded state when scrolling away
  useEffect(() => {
    setIsExpanded(false);
    setIsClosing(false);
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
          
          {/* Mobile overlay content - company logo only (description moved to node) */}
          <div className={`absolute inset-x-0 bottom-[148px] p-4 transition-opacity duration-300 ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute inset-x-0 bottom-[-40px] h-[180px] bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />
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
        className="absolute left-3 right-3 bottom-3 rounded-[48px] overflow-hidden z-10"
        style={{
          willChange: 'clip-path',
          height: 'calc(100dvh - 148px)',
          clipPath: isVisuallyExpanded 
            ? 'inset(0 0 0 0 round 48px)' 
            : 'inset(calc(100% - 180px) 8px 12px 8px round 48px)',
          transition: isDragging ? 'none' : 'clip-path 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
          transform: isDragging ? `translateY(${dragY}px)` : 'translateY(0)',
          zIndex: isVisuallyExpanded ? 20 : 10,
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
          border: '1.5px solid rgba(255,255,255,0.8)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
        }}
      >
        {/* Collapsed state - anchored at bottom of full-height container */}
        <div
          className="absolute bottom-0 left-0 right-0 px-6 flex flex-col h-[180px]"
          style={{
            opacity: isExpanded ? 0 : 1,
            transition: isExpanded ? 'opacity 0.1s ease-out' : 'opacity 0.25s ease-out 0.25s',
            pointerEvents: isExpanded ? 'none' : 'auto',
          }}
        >
          {/* Brand logo + name */}
          <div className="flex items-center gap-2.5 pt-5 pb-1">
            <div className="h-[28px] w-[28px] rounded-full overflow-hidden border border-black/10 flex-shrink-0">
              <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold text-black font-montserrat">{campaign.brand}</span>
          </div>
          {/* Description text */}
          <div className="pb-2">
            <p className="text-sm text-black font-medium font-jakarta line-clamp-2 leading-relaxed">{campaign.description}</p>
          </div>
          {/* Original earnings + tiktok row */}
          <div className="flex items-center justify-between flex-1 pb-5">
            <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[24px] px-5 py-2.5 flex items-baseline gap-1.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="text-xl font-bold text-white font-montserrat">
                {campaign.maxEarnings.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-white/80 font-montserrat">
                sek
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-black/50 font-jakarta">Platform:</span>
              <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-full h-[44px] w-[44px] flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <img src={tiktokIcon} alt="TikTok" className="w-6 h-6 object-contain" />
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          /* Expanded state (stays rendered during closing for smooth animation) */
          <div
            className="h-full flex flex-col overflow-hidden relative"
            style={{
              maxHeight: 'calc(100dvh - 148px)',
              height: 'calc(100dvh - 148px)',
              opacity: isClosing ? 0 : 1,
              transition: isClosing ? 'opacity 0.1s ease-out' : 'opacity 0.3s ease-out 0.2s',
            }}
          >
            {/* X close button - always visible */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerClose();
              }}
              className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.1) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <X className="h-4 w-4 text-black/60" />
            </button>

            {/* Campaign details panel */}
            <div
              className="flex flex-col overflow-hidden h-full"
              style={{
                transform: (showGuide || guideSliding || showSubmit || submitSliding) ? 'translateX(-100%)' : 'translateX(0)',
                opacity: (showGuide || guideSliding || showSubmit || submitSliding) ? 0 : 1,
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                pointerEvents: (!showGuide && !guideSliding && !showSubmit && !submitSliding) ? 'auto' : 'none',
              }}
            >
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-black/10">
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
                  </div>
                  <EarningsGraph tiers={campaign.tiers} maxEarnings={campaign.maxEarnings} />
                  {(() => {
                    const data = calculateEarningsData(campaign.tiers, campaign.maxEarnings);
                    return (
                      <p className="text-xs text-white/50 font-jakarta mt-3 leading-relaxed">
                        You earn {formatEarningsForNote(data.first.earnings)} sek when you first reach {formatViewsForNote(data.first.views)} views and {formatEarningsForNote(data.max.earnings)} sek when you reach {formatViewsForNote(data.max.views)} views.
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 py-5 flex items-center justify-center gap-3 flex-shrink-0">
                <button
                  className="h-12 px-8 text-sm font-bold rounded-full flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContinue();
                  }}
                  style={{
                    background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
                    border: '1.5px solid rgba(60,60,60,0.6)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2)',
                    color: 'white',
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Continue
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

            {/* Submission Guide panel - slides in from right */}
            <div
              className="absolute inset-0"
              style={{
                transform: showGuide && !guideSliding ? 'translateX(0)' : 'translateX(100%)',
                opacity: showGuide && !guideSliding ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                pointerEvents: showGuide && !guideSliding ? 'auto' : 'none',
              }}
            >
              <SubmissionGuide campaign={campaign} onBack={handleBackFromGuide} onComplete={handleGuideComplete} />
            </div>

            {/* Submit Draft panel */}
            <div
              className="absolute inset-0"
              style={{
                transform: showSubmit && !submitSliding ? 'translateX(0)' : 'translateX(100%)',
                opacity: showSubmit && !submitSliding ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                pointerEvents: showSubmit && !submitSliding ? 'auto' : 'none',
              }}
            >
              <SubmitDraft campaign={campaign} onBack={handleBackFromSubmit} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignCard;
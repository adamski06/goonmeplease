import React, { useState } from 'react';
import { Bookmark, Plus, X } from 'lucide-react';
import EarningsGraph, { calculateEarningsData, formatViewsForNote, formatEarningsForNote } from '@/components/EarningsGraph';
import SubmissionGuide from '@/components/SubmissionGuide';
import SubmitDraft from '@/components/SubmitDraft';
import { Campaign } from '@/data/campaigns';

interface CampaignOverlayProps {
  campaign: Campaign;
  isClosing: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}

const CampaignOverlay: React.FC<CampaignOverlayProps> = ({
  campaign,
  isClosing,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  const [showPicture, setShowPicture] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guideSliding, setGuideSliding] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitSliding, setSubmitSliding] = useState(false);

  const handleContinue = () => {
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

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 0.35s ease-out',
        }}
        onClick={onClose}
      />

      <style>{`
        @keyframes pill-slide-up {
          0% { transform: translateY(calc(100% + 92px)); }
          100% { transform: translateY(0); }
        }
        @keyframes pill-slide-down {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(100% + 92px)); }
        }
      `}</style>

      {/* Full white pill */}
      <div
        className="absolute left-3 right-3 bottom-[92px] rounded-[48px] overflow-hidden z-[60]"
        style={{
          maxHeight: 'calc(100dvh - 148px)',
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)',
          border: '1.5px solid rgba(255,255,255,0.8)',
          boxShadow:
            '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
          animation: isClosing
            ? 'pill-slide-down 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards'
            : 'pill-slide-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col overflow-hidden relative" style={{ maxHeight: 'calc(100dvh - 148px)', height: 'calc(100dvh - 148px)' }}>
          {/* X close button - always visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
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
            {/* Header with brand */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-black/10">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-base font-bold text-black font-montserrat flex-1">
                {campaign.brand}
              </h2>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Show Picture toggle */}
              {!showPicture ? (
                <button
                  onClick={() => setShowPicture(true)}
                  className="w-full mb-4 h-10 rounded-full text-xs font-semibold text-black/60 font-montserrat flex items-center justify-center gap-1.5"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  Show picture
                </button>
              ) : (
                <div className="mb-4 overflow-hidden rounded-xl animate-fade-in">
                  <div className="mx-auto w-full max-w-[220px] aspect-[9/16] overflow-hidden rounded-xl">
                    <img src={campaign.image} alt={campaign.brand} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">
                {campaign.description}
              </p>

              {/* Requirements */}
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

              {/* Payment Details */}
              <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mb-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <h3 className="text-sm font-semibold text-white mb-2 font-montserrat">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/80 font-jakarta">Max earnings</span>
                    <span className="text-sm font-bold text-white font-montserrat">
                      {campaign.maxEarnings.toLocaleString()} sek
                    </span>
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
                onClick={handleContinue}
                className="h-12 px-8 text-sm font-bold rounded-full flex items-center gap-2"
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
                onClick={onToggleSave}
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
      </div>
    </div>
  );
};

export default CampaignOverlay;

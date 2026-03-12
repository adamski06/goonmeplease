import React, { useState, useEffect } from 'react';
import { Bookmark, Gift, Plus, X } from 'lucide-react';
import SubmitReward from '@/components/SubmitReward';
import { Campaign } from '@/types/campaign';

interface RewardOverlayProps {
  reward: Campaign;
  isClosing: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}

const RewardOverlay: React.FC<RewardOverlayProps> = ({
  reward,
  isClosing,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  const [backdropVisible, setBackdropVisible] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitSliding, setSubmitSliding] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setBackdropVisible(true));
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleContinue = () => {
    setSubmitSliding(true);
    setTimeout(() => {
      setShowSubmit(true);
      setSubmitSliding(false);
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
    <div className="fixed inset-0 z-40" style={{ touchAction: 'none' }} onTouchMove={(e) => e.stopPropagation()}>
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300 ease-out"
        style={{
          opacity: isClosing ? 0 : backdropVisible ? 1 : 0,
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
          {/* X close button */}
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

          {/* Reward details panel */}
          <div
            className="flex flex-col overflow-hidden h-full"
            style={{
              transform: (showSubmit || submitSliding) ? 'translateX(-100%)' : 'translateX(0)',
              opacity: (showSubmit || submitSliding) ? 0 : 1,
              transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
              pointerEvents: (!showSubmit && !submitSliding) ? 'auto' : 'none',
            }}
          >
            {/* Header with brand */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-black/10">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/5">
                {reward.logo ? (
                  <img src={reward.logo} alt={reward.brand} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-black/40">{reward.brand.charAt(0)}</span>
                )}
              </div>
              <h2 className="text-base font-bold text-black font-montserrat flex-1">
                {reward.brand}
              </h2>
              {/* Reward badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full mr-9" style={{ background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)', border: '1px solid rgba(167,139,250,0.4)' }}>
                <span className="text-[10px] font-bold text-white font-montserrat">REWARD</span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* How Rewards work */}
              <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.07) 100%)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <h3 className="text-sm font-semibold text-black/80 mb-2 font-montserrat">How Rewards work</h3>
                <ul className="space-y-1.5">
                  {[
                    'Create your video following the brand\u2019s guidelines',
                    'Post it on TikTok and submit the link',
                    `Reach ${(reward.viewsRequired || 0).toLocaleString()} views on your video`,
                    'Receive your reward (coupon code, free product, etc.)',
                  ].map((step, i) => (
                    <li key={i} className="text-sm text-black/70 font-jakarta flex items-start gap-2">
                      <span className="text-black/40 mt-0.5">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">
                {reward.description}
              </p>

              {/* Requirements */}
              {reward.guidelines.length > 0 && (
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
                    {reward.guidelines.map((guideline, idx) => (
                      <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                        <span className="text-black/40">•</span>
                        {guideline}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reward details */}
              <div className="bg-gradient-to-b from-purple-600 to-purple-800 rounded-2xl p-4 mb-4 border border-purple-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-white/80" />
                  <span className="text-xs font-semibold text-white/70 font-montserrat uppercase tracking-wider">Your Reward</span>
                </div>
                <p className="text-base font-bold text-white font-montserrat mb-2">
                  {reward.rewardDescription}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-white/60 font-jakarta">
                    Reach {(reward.viewsRequired || 0).toLocaleString()} views to unlock
                  </span>
                </div>
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
            <SubmitReward reward={reward} onBack={handleBackFromSubmit} onClose={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardOverlay;

import React, { useRef, useState, useEffect } from 'react';
import { Bookmark, Gift, Plus, X } from 'lucide-react';
import tiktokIcon from '@/assets/tiktok-icon.png';
import placeholderBlue from '@/assets/campaigns/placeholder-blue.jpg';
import { Campaign } from '@/types/campaign';
import SubmitReward from '@/components/SubmitReward';
import { addRecentCampaign } from '@/hooks/useRecentCampaigns';

interface RewardCardProps {
  reward: Campaign;
  isSaved: boolean;
  onToggleFavorite: (rewardId: string, e: React.MouseEvent) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, isSaved, onToggleFavorite }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expandReady, setExpandReady] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitSliding, setSubmitSliding] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);

  const getClipInset = () => {
    if (!nodeRef.current) return 'inset(0)';
    const rect = nodeRef.current.getBoundingClientRect();
    const finalTop = 56;
    const finalLeft = 12;
    const finalW = window.innerWidth - 24;
    const finalH = window.innerHeight - 148;
    const top = rect.top - finalTop;
    const left = rect.left - finalLeft;
    const bottom = finalH - (rect.bottom - finalTop);
    const right = finalW - (rect.right - finalLeft);
    return `inset(${Math.max(0, top)}px ${Math.max(0, right)}px ${Math.max(0, bottom)}px ${Math.max(0, left)}px round 48px)`;
  };

  const [initClip, setInitClip] = useState('inset(0)');

  const openNode = () => {
    setInitClip(getClipInset());
    setIsExpanded(true);
    setExpandReady(false);
    addRecentCampaign(reward.id, 'reward');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandReady(true);
      });
    });
  };

  const closeNode = () => {
    if (!isExpanded || isClosing) return;
    setInitClip(getClipInset());
    setExpandReady(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
      setShowSubmit(false);
      setSubmitSliding(false);
    }, 520);
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded) {
      closeNode();
    } else {
      openNode();
    }
  };

  const handleContinue = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  useEffect(() => {
    setIsExpanded(false);
    setIsClosing(false);
    setExpandReady(false);
  }, [reward.id]);

  const nodeStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
    border: '1.5px solid rgba(255,255,255,0.8)',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
  };

  return (
    <div className="h-[calc(100dvh-80px)] relative flex flex-col items-center justify-start snap-start snap-always">
      {/* Card image */}
      <div className="absolute top-14 left-3 right-3 bottom-3">
        <div
          onClick={openNode}
          className="absolute inset-x-0 top-0 bottom-0 rounded-[48px] overflow-hidden cursor-pointer"
        >
          <img src={reward.image || placeholderBlue} alt={reward.brand} className="w-full h-full object-cover" fetchPriority="high" decoding="async" />
          <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
        </div>
      </div>

      {/* Collapsed node */}
      <div
        ref={nodeRef}
        onClick={handleNodeClick}
        className={`absolute left-5 right-5 bottom-6 rounded-[48px] overflow-hidden ${isClosing ? 'z-[60]' : 'z-10'}`}
        style={{
          height: '180px',
          opacity: isClosing ? 1 : isExpanded ? 0 : 1,
          transition: isClosing ? 'opacity 0.35s ease-out 0.15s' : 'none',
          pointerEvents: isExpanded ? 'none' : 'auto',
          ...nodeStyle,
        }}
      >
        <div className="px-6 flex flex-col h-[180px]">
          <div className="flex items-center gap-2.5 pt-5 pb-1">
            <div className="h-[28px] w-[28px] rounded-full overflow-hidden border border-black/10 flex-shrink-0 flex items-center justify-center bg-black/5">
              {reward.logo ? (
                <img src={reward.logo} alt={reward.brand} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-black/40">{reward.brand.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm font-bold text-black font-montserrat flex-1">{reward.brand}</span>
            {/* Reward badge */}
            <div className="rounded-[12px] px-2 h-[22px] flex items-center border shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" style={{ background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)', borderColor: 'rgba(167,139,250,0.4)' }}>
              <span className="text-[9px] font-bold text-white font-montserrat">REWARD</span>
            </div>
          </div>
          <div className="pb-2">
            <p className="text-sm text-black font-medium font-jakarta line-clamp-2 leading-relaxed">{reward.description}</p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-1 pb-5">
            <div className="bg-gradient-to-b from-purple-600 to-purple-800 rounded-[24px] px-5 py-2.5 flex items-baseline gap-1.5 border border-purple-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <Gift className="h-4 w-4 text-white/80 mr-1" />
              <span className="text-base font-bold text-white font-montserrat">{reward.rewardDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50"
          style={{ touchAction: 'none' }}
          onClick={closeNode}
          onTouchMove={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="absolute rounded-[48px] overflow-hidden"
            style={{
              top: '56px',
              bottom: '92px',
              left: '12px',
              right: '12px',
              clipPath: expandReady ? 'inset(0 round 48px)' : initClip,
              willChange: 'clip-path',
              transition: expandReady
                ? 'clip-path 0.5s cubic-bezier(0.32, 0.72, 0, 1)'
                : 'clip-path 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.15s',
              ...nodeStyle,
            }}
          >
            <div
            className="h-full flex flex-col overflow-hidden relative"
            style={{
              opacity: expandReady && !isClosing ? 1 : 0,
              transition: expandReady ? 'opacity 0.35s ease-out 0.1s' : 'opacity 0.25s ease-out',
            }}
          >
            {/* X close */}
            <button
              onClick={(e) => { e.stopPropagation(); closeNode(); }}
              className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.1) 100%)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <X className="h-4 w-4 text-black/60" />
            </button>

            {/* Details panel */}
            <div
              className="flex flex-col overflow-hidden h-full"
              style={{
                transform: (showSubmit || submitSliding) ? 'translateX(-100%)' : 'translateX(0)',
                opacity: (showSubmit || submitSliding) ? 0 : 1,
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                pointerEvents: (!showSubmit && !submitSliding) ? 'auto' : 'none',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-black/10">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/5">
                  {reward.logo ? <img src={reward.logo} alt={reward.brand} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-black/40">{reward.brand.charAt(0)}</span>}
                </div>
                <h2 className="text-base font-bold text-black font-montserrat flex-1">{reward.brand}</h2>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full mr-9" style={{ background: 'linear-gradient(180deg, #7c3aed 0%, #6d28d9 100%)', border: '1px solid rgba(167,139,250,0.4)' }}>
                  <span className="text-[10px] font-bold text-white font-montserrat">REWARD</span>
                </div>
              </div>

              {/* Scrollable content */}
              <div
                className="flex-1 overflow-y-auto overscroll-contain px-5 py-4"
                onClick={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
              >
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

                <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">{reward.description}</p>

                {/* Requirements */}
                {reward.guidelines.length > 0 && (
                  <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)' }}>
                    <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Requirements</h3>
                    <ul className="space-y-1.5">
                      {reward.guidelines.map((g, idx) => (
                        <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                          <span className="text-black/40">•</span>{g}
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
                  <span className="text-xs text-white/60 font-jakarta">
                    Reach {(reward.viewsRequired || 0).toLocaleString()} views to unlock
                  </span>
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
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(reward.id, e); }}
                  className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)', backdropFilter: 'blur(12px)' }}
                >
                  <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-black text-black' : 'text-black/50'}`} strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Submit panel */}
            <div
              className="absolute inset-0"
              style={{
                transform: showSubmit && !submitSliding ? 'translateX(0)' : 'translateX(100%)',
                opacity: showSubmit && !submitSliding ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
                pointerEvents: showSubmit && !submitSliding ? 'auto' : 'none',
              }}
            >
              <SubmitReward reward={reward} onBack={handleBackFromSubmit} onClose={closeNode} />
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default RewardCard;

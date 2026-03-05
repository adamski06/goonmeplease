import React from 'react';
import { ChevronLeft, Bookmark, Plus, Gift, Eye } from 'lucide-react';

interface RewardAdPreviewProps {
  title: string;
  description: string;
  guidelines: string[];
  rewardDescription: string;
  viewsRequired: number;
  couponCount: number;
  audience: string;
}

const RewardAdPreview: React.FC<RewardAdPreviewProps> = ({
  title,
  description,
  guidelines,
  rewardDescription,
  viewsRequired,
  couponCount,
  audience,
}) => {
  const filteredGuidelines = guidelines.filter(g => g.trim());
  const viewsLabel = viewsRequired === 0 ? 'Just by posting' : `${viewsRequired.toLocaleString()} views`;

  return (
    <div className="h-full flex items-center justify-center bg-muted/30">
      <div className="w-[320px] rounded-[36px] border-[3px] border-border/80 bg-white shadow-2xl overflow-hidden flex flex-col" style={{ height: '580px' }}>
        {/* Status bar area */}
        <div className="h-8 bg-white" />

        {/* Top bar - matches CampaignDetailView */}
        <div className="flex items-center gap-3 px-4 pb-3 bg-white border-b border-black/5">
          <div className="p-1 -ml-1">
            <ChevronLeft className="h-5 w-5 text-black/20" />
          </div>
          <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0 border border-black/10">
            <span className="text-xs font-bold text-black">
              {title ? title.charAt(0).toUpperCase() : 'R'}
            </span>
          </div>
          <h1 className="text-sm font-bold text-black font-montserrat flex-1 truncate">
            {title || 'Your Brand'}
          </h1>
          <div className="p-1">
            <Bookmark className="h-4 w-4 text-black/20" strokeWidth={1.5} />
          </div>
        </div>

        {/* Scrollable content - matches CampaignDetailView style */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20">
          {/* Description */}
          <p className="text-[13px] text-black font-jakarta leading-relaxed mb-5">
            {description || <span className="text-black/30">Ad description will appear here...</span>}
          </p>

          {/* Reward Display - replaces earnings display */}
          <div className="mb-5 relative">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-black font-montserrat uppercase tracking-wide">Reward</span>
            </div>

            <div className="relative mt-2">
              <div className="bg-black px-4 py-2 rounded-full rounded-br-none inline-flex items-baseline gap-1">
                <span className="text-base font-bold text-white font-montserrat">
                  {rewardDescription || 'Your reward'}
                </span>
              </div>

              <div className="relative py-3">
                <div className="h-[2px] bg-black w-full" />
                <div className="absolute z-20" style={{ left: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                  <div className="w-[2px] h-[10px] bg-black" />
                </div>
              </div>

              <div className="bg-white border border-black/10 px-3 py-1.5 rounded-full rounded-tr-none inline-flex items-baseline gap-1">
                <Eye className="h-3 w-3 text-black/50 mr-1" />
                <span className="text-xs font-normal text-black font-jakarta">{viewsLabel}</span>
              </div>

              {couponCount > 0 && (
                <p className="text-xs text-emerald-600 mt-2 font-jakarta">
                  {couponCount} coupon code{couponCount > 1 ? 's' : ''} included
                </p>
              )}
            </div>

            <div className="h-4" />
          </div>

          {/* Requirements - matches CampaignDetailView */}
          <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 rounded-xl p-4 mb-5 -mx-1">
            <h3 className="text-xs font-semibold text-black mb-3 font-montserrat">Requirements</h3>
            <ul className="space-y-2">
              {filteredGuidelines.length > 0 ? (
                filteredGuidelines.map((guideline, idx) => (
                  <li key={idx} className="text-xs text-black font-jakarta flex items-start gap-2">
                    <span className="text-black">•</span>
                    {guideline}
                  </li>
                ))
              ) : (
                <li className="text-xs text-black/30 font-jakarta flex items-start gap-2">
                  <span className="text-black/30">•</span>
                  Guidelines will appear here...
                </li>
              )}
            </ul>
          </div>

          {/* Target Audience */}
          <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 rounded-xl p-4 mb-5 -mx-1">
            <h3 className="text-xs font-semibold text-black mb-3 font-montserrat">Target Audience</h3>
            <p className="text-xs text-black font-jakarta">
              {audience || <span className="text-black/30">Target audience will appear here...</span>}
            </p>
          </div>
        </div>

        {/* Fixed CTA - glass styled, matches CampaignDetailView */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-white via-white to-transparent" style={{ borderRadius: '0 0 33px 33px' }}>
          <button
            className="h-10 w-full text-xs font-bold rounded-full flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)',
              border: '1.5px solid rgba(255,255,255,0.9)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
              color: 'black',
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Post &amp; Earn Reward
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardAdPreview;

import React from 'react';
import { ChevronLeft, Bookmark, Gift, Eye } from 'lucide-react';

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
      <div className="w-[300px] rounded-[36px] border-[3px] border-border/80 bg-white shadow-2xl overflow-hidden relative" style={{ height: '560px' }}>
        {/* Status bar */}
        <div className="h-7 bg-white" />

        {/* Top bar */}
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

        {/* Scrollable content */}
        <div className="overflow-y-auto px-4 pt-4" style={{ height: 'calc(100% - 40px - 28px - 56px)' }}>
          {/* Description */}
          <p className="text-[13px] text-black font-jakarta leading-relaxed mb-5">
            {description || <span className="text-black/30">Ad description will appear here...</span>}
          </p>

          {/* Reward Display */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-black font-montserrat uppercase tracking-wide">Reward</span>
            </div>

            <div className="bg-black px-3 py-1.5 rounded-full rounded-br-none inline-flex items-baseline gap-1 max-w-full">
              <span className="text-[13px] font-bold text-white font-montserrat truncate">
                {rewardDescription || 'Your reward'}
              </span>
            </div>

            <div className="relative py-3">
              <div className="h-[2px] bg-black w-full" />
              <div className="absolute z-20" style={{ left: '0%', top: '50%', transform: 'translateY(-50%)' }}>
                <div className="w-[2px] h-[10px] bg-black" />
              </div>
            </div>

            <div className="bg-white border border-black/10 px-3 py-1.5 rounded-full rounded-tr-none inline-flex items-center gap-1">
              <Eye className="h-3 w-3 text-black/50" />
              <span className="text-xs font-normal text-black font-jakarta">{viewsLabel}</span>
            </div>

            {couponCount > 0 && (
              <p className="text-xs text-emerald-600 mt-2 font-jakarta">
                {couponCount} coupon code{couponCount > 1 ? 's' : ''} included
              </p>
            )}
          </div>

          {/* Requirements */}
          <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 rounded-xl p-4 mb-4 -mx-1">
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
          <div className="backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 rounded-xl p-4 mb-4 -mx-1">
            <h3 className="text-xs font-semibold text-black mb-3 font-montserrat">Target Audience</h3>
            <p className="text-xs text-black font-jakarta">
              {audience || <span className="text-black/30">Target audience will appear here...</span>}
            </p>
          </div>

          {/* Bottom spacing for CTA */}
          <div className="h-14" />
        </div>

        {/* CTA - positioned within phone frame */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-white via-white to-transparent" style={{ borderRadius: '0 0 33px 33px' }}>
          <button
            className="h-10 w-full text-xs font-bold rounded-full flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.92) 100%)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              backdropFilter: 'blur(12px)',
              color: 'white',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardAdPreview;

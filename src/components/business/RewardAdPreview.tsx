import React from 'react';
import { Bookmark, Gift, Eye } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

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
        <div className="h-6 bg-white" />

        {/* Top bar - Jarla icon + brand name + badge */}
        <div className="flex items-center gap-3 px-4 pb-3 bg-white border-b border-black/5">
          <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0 border border-black/10 overflow-hidden p-0.5">
            <img src={jarlaLogo} alt="J" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-[15px] font-bold text-black font-montserrat flex-1 truncate">
            {title || 'Your Brand'}
          </h1>
          <div className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Reward
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-4 pt-5" style={{ height: 'calc(100% - 34px - 40px - 56px)' }}>
          {/* Show picture placeholder */}
          <div className="w-full h-10 rounded-full bg-neutral-100 border border-black/5 flex items-center justify-center mb-5">
            <span className="text-[13px] text-black/40 font-jakarta">Show picture</span>
          </div>

          {/* Description */}
          <p className="text-[15px] text-black font-jakarta leading-relaxed mb-6">
            {description || <span className="text-black/25">Ad description will appear here...</span>}
          </p>

          {/* Reward card - light emerald tint like the blue "How Deals work" but for rewards */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 mb-6">
            <h3 className="text-[15px] font-bold text-emerald-700 font-montserrat mb-3">Reward</h3>
            <div className="flex items-start gap-2 mb-2">
              <Gift className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
              <span className="text-[14px] text-black font-jakarta">
                {rewardDescription || <span className="text-black/25">Reward description...</span>}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <Eye className="h-3.5 w-3.5 text-emerald-600/70" />
              <span className="text-[13px] text-black/60 font-jakarta">{viewsLabel}</span>
            </div>
            {couponCount > 0 && (
              <p className="text-[12px] text-emerald-600 mt-2 font-jakarta">
                {couponCount} coupon code{couponCount > 1 ? 's' : ''} included
              </p>
            )}
          </div>

          {/* Requirements - gray card matching screenshot */}
          <div className="rounded-2xl bg-neutral-100/80 p-5 mb-5">
            <h3 className="text-[15px] font-bold text-black font-montserrat mb-3">Requirements</h3>
            <ul className="space-y-2.5">
              {filteredGuidelines.length > 0 ? (
                filteredGuidelines.map((guideline, idx) => (
                  <li key={idx} className="text-[14px] text-black/80 font-jakarta flex items-start gap-2.5">
                    <span className="text-black/40 mt-0.5">•</span>
                    {guideline}
                  </li>
                ))
              ) : (
                <li className="text-[14px] text-black/25 font-jakarta flex items-start gap-2.5">
                  <span className="text-black/20 mt-0.5">•</span>
                  Guidelines will appear here...
                </li>
              )}
            </ul>
          </div>

          {/* Bottom spacing for CTA */}
          <div className="h-16" />
        </div>

        {/* CTA - black glass pill matching app style */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-6 pt-8 bg-gradient-to-t from-white via-white/95 to-transparent" style={{ borderRadius: '0 0 33px 33px' }}>
          <div className="flex items-center gap-3">
            <button
              className="h-12 flex-1 text-sm font-bold rounded-full flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.92) 100%)',
                backdropFilter: 'blur(12px)',
                color: 'white',
              }}
            >
              Continue
            </button>
            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-white">
              <Bookmark className="h-5 w-5 text-black/30" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardAdPreview;

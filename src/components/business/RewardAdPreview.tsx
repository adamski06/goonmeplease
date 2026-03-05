import React from 'react';
import { Gift, Eye, Star } from 'lucide-react';

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
    <div className="h-full flex flex-col bg-background">
      {/* Phone frame mockup */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-[320px] rounded-[32px] border-[3px] border-border bg-card shadow-xl overflow-hidden">
          {/* Status bar */}
          <div className="h-6 bg-card" />

          {/* Top bar */}
          <div className="flex items-center gap-3 px-5 pb-3 border-b border-border/50">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center border border-border overflow-hidden">
              <span className="text-xs font-bold text-foreground">
                {title ? title.charAt(0).toUpperCase() : 'R'}
              </span>
            </div>
            <h1 className="text-sm font-bold text-foreground font-montserrat flex-1 truncate">
              {title || 'Ad Title'}
            </h1>
          </div>

          {/* Scrollable content */}
          <div className="px-5 pt-4 pb-6 space-y-5 max-h-[480px] overflow-y-auto">
            {/* Description */}
            <p className="text-sm text-foreground/80 font-jakarta leading-relaxed">
              {description || 'Your ad description will appear here...'}
            </p>

            {/* Reward card */}
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Reward</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {rewardDescription || 'Reward description...'}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{viewsLabel}</span>
              </div>
              {couponCount > 0 && (
                <p className="text-xs text-emerald-600 mt-1.5">
                  {couponCount} coupon code{couponCount > 1 ? 's' : ''} available
                </p>
              )}
            </div>

            {/* Requirements */}
            {filteredGuidelines.length > 0 && (
              <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                <h3 className="text-xs font-semibold text-foreground mb-3 font-montserrat uppercase tracking-wide">Requirements</h3>
                <ul className="space-y-2">
                  {filteredGuidelines.map((guideline, idx) => (
                    <li key={idx} className="text-xs text-foreground/80 font-jakarta flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="h-2 w-2 text-emerald-600" />
                      </div>
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Audience */}
            {audience && (
              <div className="rounded-xl bg-muted/50 border border-border/50 p-4">
                <h3 className="text-xs font-semibold text-foreground mb-2 font-montserrat uppercase tracking-wide">Target Audience</h3>
                <p className="text-xs text-foreground/80 font-jakarta">{audience}</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5">
            <div
              className="h-11 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)',
                border: '1.5px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                color: 'var(--foreground)',
              }}
            >
              Post &amp; Earn Reward
            </div>
          </div>
        </div>
      </div>

      {/* Label */}
      <div className="text-center pb-4">
        <p className="text-xs text-muted-foreground">Live preview — what creators will see</p>
      </div>
    </div>
  );
};

export default RewardAdPreview;

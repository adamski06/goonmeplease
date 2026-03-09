import React, { useEffect, useState } from 'react';
import { ChevronLeft, Eye, Clock, CheckCircle, Gift, HelpCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RewardSubmission {
  id: string;
  reward_ad_id: string;
  tiktok_video_url: string;
  tiktok_video_id: string | null;
  status: string;
  current_views: number;
  current_likes: number;
  created_at: string;
  coupon_code: string | null;
  reward_brand: string;
  reward_title: string;
  reward_logo: string;
  reward_description: string;
  views_required: number;
}

interface RewardInActionDetailProps {
  submission: RewardSubmission;
  onBack: () => void;
}

const statusConfig: Record<string, { label: string; gradient: string; border: string }> = {
  pending_review: {
    label: 'Under Review',
    gradient: 'linear-gradient(180deg, rgba(245,158,11,0.85) 0%, rgba(217,119,6,0.95) 100%)',
    border: 'rgba(252,211,77,0.5)',
  },
  approved: {
    label: 'Approved',
    gradient: 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)',
    border: 'rgba(52,211,153,0.5)',
  },
  denied: {
    label: 'Denied',
    gradient: 'linear-gradient(180deg, rgba(220,38,38,0.85) 0%, rgba(185,28,28,0.95) 100%)',
    border: 'rgba(252,165,165,0.5)',
  },
  completed: {
    label: 'Completed',
    gradient: 'linear-gradient(180deg, rgba(124,58,237,0.9) 0%, rgba(109,40,217,0.95) 100%)',
    border: 'rgba(167,139,250,0.5)',
  },
};

const RewardInActionDetail: React.FC<RewardInActionDetailProps> = ({ submission, onBack }) => {
  const status = statusConfig[submission.status] || statusConfig.pending_review;
  const [views, setViews] = useState(submission.current_views || 0);
  const [likes, setLikes] = useState(submission.current_likes || 0);
  const [refreshing, setRefreshing] = useState(false);
  const [showHelpForm, setShowHelpForm] = useState(false);
  const [helpMessage, setHelpMessage] = useState('');
  const [submittingHelp, setSubmittingHelp] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [couponCode, setCouponCode] = useState(submission.coupon_code || null);

  const isApproved = submission.status === 'approved' || submission.status === 'completed';
  const viewsProgress = submission.views_required > 0 && isApproved
    ? Math.min((views / submission.views_required) * 100, 100)
    : 0;
  const goalReached = views >= submission.views_required && isApproved;

  useEffect(() => {
    const fetchStats = async () => {
      setRefreshing(true);
      try {
        const { data: statsData } = await supabase.functions.invoke('fetch-tiktok-stats', {
          body: { reward_submission_ids: [submission.id] },
        });
        if (statsData?.results?.[submission.id]) {
          const r = statsData.results[submission.id];
          if (r.views > 0) setViews(r.views);
          if (r.likes > 0) setLikes(r.likes);
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
      setRefreshing(false);
    };
    fetchStats();
  }, [submission.id]);

  const submitHelpRequest = async () => {
    if (!helpMessage.trim()) return;
    setSubmittingHelp(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('support_requests').insert({
        user_id: user.id,
        submission_id: submission.id,
        submission_type: 'reward',
        subject: `Issue with reward submission for ${submission.reward_brand}`,
        message: helpMessage.trim(),
      });
      if (error) throw error;
      toast.success('Your request has been submitted.');
      setShowHelpForm(false);
      setHelpMessage('');
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit. Please try again.');
    }
    setSubmittingHelp(false);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-black/60" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center pr-6">
          {submission.reward_logo && (
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img src={submission.reward_logo} alt={submission.reward_brand} className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className="text-sm font-bold text-black font-montserrat">{submission.reward_brand}</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Status badge */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-[14px]"
            style={{
              background: status.gradient,
              border: `1px solid ${status.border}`,
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.1)',
            }}
          >
            <span className="text-sm font-bold text-white font-montserrat">{status.label}</span>
          </div>
        </div>

        {/* TikTok embed */}
        {submission.tiktok_video_id && (
          <div className="flex justify-center mb-4">
            <div style={{
              transform: 'scale(0.75)',
              transformOrigin: 'top center',
              height: '565px',
              marginBottom: '-100px',
              overflow: 'hidden',
              borderRadius: '12px',
            }}>
              <iframe
                src={`https://www.tiktok.com/embed/v2/${submission.tiktok_video_id}`}
                style={{ width: '325px', height: '720px', border: 'none' }}
                allowFullScreen
                allow="encrypted-media"
              />
            </div>
          </div>
        )}

        {/* Performance stats */}
        <div
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-black font-montserrat">Performance</h3>
            {refreshing && (
              <div className="h-3 w-3 border border-black/20 border-t-black/60 rounded-full animate-spin" />
            )}
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            {[
              { value: views, label: 'Views' },
              { value: likes, label: 'Likes' },
              { value: new Date(submission.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), label: 'Submitted' },
            ].map((stat, i, arr) => (
              <div key={stat.label}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <span className="text-[12px] text-black/50 font-jakarta">{stat.label}</span>
                  <p className="text-base font-bold text-black font-montserrat">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                </div>
                {i < arr.length - 1 && <div className="h-px bg-black/[0.06] mx-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Reward Progress */}
        <div
          className="rounded-2xl p-4 mt-4"
          style={{
            background: 'linear-gradient(180deg, rgba(124,58,237,0.9) 0%, rgba(88,28,195,0.95) 100%)',
            border: '1px solid rgba(167,139,250,0.4)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 20px rgba(124,58,237,0.25)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Gift className="h-4 w-4 text-white/70" />
            <span className="text-[11px] font-semibold text-white/60 font-montserrat uppercase tracking-wider">Reward Progress</span>
          </div>

          {/* Views progress bar */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white font-montserrat">{views.toLocaleString()} views</span>
            <span className="text-xs text-white/50 font-jakarta">/ {submission.views_required.toLocaleString()} goal</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden bg-white/10 mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${viewsProgress}%`,
                background: goalReached
                  ? 'linear-gradient(90deg, rgba(52,211,153,0.9), rgba(16,185,129,1))'
                  : 'linear-gradient(90deg, rgba(255,255,255,0.5), rgba(255,255,255,0.7))',
              }}
            />
          </div>

          {/* Reward description */}
          <div
            className="rounded-xl p-3 mb-3"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <span className="text-[11px] font-semibold text-white/50 font-montserrat uppercase tracking-wider block mb-1">Reward</span>
            <p className="text-sm font-semibold text-white font-jakarta">{submission.reward_description}</p>
          </div>

          {/* Coupon code or status */}
          {submission.coupon_code ? (
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.9) 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              <span className="text-[10px] font-semibold text-purple-600/60 font-montserrat uppercase tracking-wider block mb-1">Your Coupon Code</span>
              <p className="text-lg font-bold text-purple-700 font-montserrat tracking-wider">{submission.coupon_code}</p>
            </div>
          ) : goalReached && submission.status === 'approved' ? (
            <div
              className="w-full py-3 rounded-full text-center"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span className="text-sm font-semibold text-white/70 font-montserrat">🎉 Goal reached! Coupon incoming...</span>
            </div>
          ) : (
            <div
              className="w-full py-3 rounded-full text-center"
              style={{
                background: 'rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-sm font-semibold text-white/60 font-montserrat">
                {submission.status === 'pending_review'
                  ? 'Under Review'
                  : submission.status === 'denied'
                    ? 'Submission Denied'
                    : `${Math.max(0, submission.views_required - views).toLocaleString()} views to go`
                }
              </span>
            </div>
          )}
        </div>

        {/* Need Help */}
        <div className="mt-6 mb-2">
          {!showHelpForm ? (
            <button
              onClick={() => setShowHelpForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <HelpCircle className="h-4 w-4 text-black/40" />
              <span className="text-black/50 font-jakarta">Need help?</span>
            </button>
          ) : (
            <div
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <h4 className="text-sm font-semibold text-black font-montserrat mb-3">Report a problem</h4>
              <textarea
                value={helpMessage}
                onChange={(e) => setHelpMessage(e.target.value)}
                placeholder="Describe the issue you're experiencing..."
                className="w-full rounded-lg p-3 text-sm font-jakarta resize-none h-24 focus:outline-none focus:ring-1 focus:ring-black/20"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  color: '#000',
                }}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setShowHelpForm(false); setHelpMessage(''); }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-medium text-black/50 transition-colors hover:bg-black/5"
                  style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitHelpRequest}
                  disabled={!helpMessage.trim() || submittingHelp}
                  className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(180deg, hsl(0,0%,18%) 0%, hsl(0,0%,10%) 100%)',
                  }}
                >
                  {submittingHelp ? (
                    <div className="h-3 w-3 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardInActionDetail;

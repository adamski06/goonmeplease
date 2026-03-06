import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCurrency } from '@/contexts/CurrencyContext';

interface SubmissionData {
  id: string;
  tiktok_video_url: string;
  tiktok_video_id: string | null;
  status: string;
  current_views: number | null;
  current_likes: number | null;
  current_shares: number | null;
  created_at: string;
  creator_id: string;
  campaign_id: string;
}

const statusStyles: Record<string, string> = {
  pending_review: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  denied: 'bg-red-500/10 text-red-600 border-red-500/20',
  paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
};

const statusLabels: Record<string, string> = {
  pending_review: 'Under Review',
  approved: 'Approved',
  denied: 'Denied',
  paid: 'Paid',
};

const BusinessSubmissionDetail: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [creatorUsername, setCreatorUsername] = useState<string>('');
  const [creatorEarnings, setCreatorEarnings] = useState<number>(0);
  const [poolTotal, setPoolTotal] = useState<number>(0);
  const [poolSpent, setPoolSpent] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) return;
    const load = async () => {
      const { data } = await supabase
        .from('content_submissions')
        .select('id, tiktok_video_url, tiktok_video_id, status, current_views, current_likes, current_shares, created_at, creator_id, campaign_id')
        .eq('id', submissionId)
        .maybeSingle();
      if (data) {
        setSubmission(data as SubmissionData);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', data.creator_id)
          .maybeSingle();
        setCreatorUsername(profile?.username || `User ${data.creator_id.slice(0, 6)}`);

        const { data: earningsData } = await supabase
          .from('earnings')
          .select('amount')
          .eq('submission_id', data.id)
          .maybeSingle();
        if (earningsData) setCreatorEarnings(earningsData.amount);

        const { data: campaign } = await supabase
          .from('campaigns')
          .select('total_budget, budget_spent')
          .eq('id', data.campaign_id)
          .maybeSingle();
        if (campaign) {
          setPotTotal(campaign.total_budget || 0);
          setPotSpent((campaign as any).budget_spent || 0);
        }
      }
      setLoading(false);

      if (data) {
        try {
          const { data: statsData } = await supabase.functions.invoke('fetch-tiktok-stats', {
            body: { submission_ids: [data.id] },
          });
          if (statsData?.results?.[data.id]) {
            const r = statsData.results[data.id];
            if (r.views > 0 || r.likes > 0 || r.shares > 0) {
              setSubmission(prev => prev ? {
                ...prev,
                current_views: r.views > 0 ? r.views : prev.current_views,
                current_likes: r.likes > 0 ? r.likes : prev.current_likes,
                current_shares: r.shares > 0 ? r.shares : prev.current_shares,
              } : prev);
            }
            if (r.earnings > 0) {
              setCreatorEarnings(r.earnings);
            }
          }
        } catch (e) {
          console.error('Auto-fetch TikTok stats failed:', e);
        }
      }
    };
    load();
  }, [submissionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Submission not found</p>
        <button onClick={() => navigate(-1)} className="text-sm text-primary hover:underline">Go back</button>
      </div>
    );
  }

  const { formatPrice, label, convert } = useCurrency();
  const tiktokEmbedUrl = submission.tiktok_video_id
    ? `https://www.tiktok.com/embed/v2/${submission.tiktok_video_id}`
    : null;

  const tiktokUsernameMatch = submission.tiktok_video_url?.match(/tiktok\.com\/@([^/]+)/);
  const tiktokUsername = tiktokUsernameMatch ? tiktokUsernameMatch[1] : null;

  const cardStyle = {
    background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
    border: '1px solid hsl(var(--border))',
    boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
  };

  // Embed sizing — bigger video
  const embedScale = 0.78;
  const embedNativeW = 325;
  const embedNativeH = 740;
  const embedW = Math.ceil(embedNativeW * embedScale);
  const embedH = Math.ceil(embedNativeH * embedScale);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Side-by-side: TikTok embed LEFT, info RIGHT */}
        <div className="flex gap-8 items-start">
          {/* TikTok video embed — left column */}
          <div className="flex-shrink-0">
            {tiktokEmbedUrl ? (
              <div
                style={{
                  width: embedW,
                  height: embedH,
                  background: 'hsl(var(--card))',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <iframe
                  src={tiktokEmbedUrl}
                  style={{
                    width: embedNativeW,
                    height: embedNativeH,
                    border: 'none',
                    display: 'block',
                    transform: `scale(${embedScale})`,
                    transformOrigin: 'top left',
                    colorScheme: 'normal',
                    willChange: 'transform',
                  }}
                  allow="encrypted-media"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="rounded-2xl p-8 text-center" style={{ ...cardStyle, width: embedW }}>
                <p className="text-sm text-muted-foreground mb-3">TikTok embed unavailable</p>
                <a
                  href={submission.tiktok_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Open on TikTok →
                </a>
              </div>
            )}
          </div>

          {/* Right column — all info nodes */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Creator header */}
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-muted flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-muted-foreground/60 font-montserrat">
                  {creatorUsername.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-foreground font-montserrat">@{creatorUsername}</p>
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className={statusStyles[submission.status] || 'bg-muted text-muted-foreground'}>
                {statusLabels[submission.status] || submission.status}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[20px] p-4" style={cardStyle}>
                <span className="text-xs text-muted-foreground">Views</span>
                <p className="text-xl font-bold text-foreground mt-1">
                  {(submission.current_views || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-[20px] p-4" style={cardStyle}>
                <span className="text-xs text-muted-foreground">Likes</span>
                <p className="text-xl font-bold text-foreground mt-1">
                  {(submission.current_likes || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-[20px] p-4" style={cardStyle}>
                <span className="text-xs text-muted-foreground">Shares</span>
                <p className="text-xl font-bold text-foreground mt-1">
                  {(submission.current_shares || 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Earnings & Pot */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[20px] p-4" style={cardStyle}>
                <span className="text-xs text-muted-foreground">Creator Earnings</span>
                <p className="text-xl font-bold text-foreground mt-1">
                  {convert(creatorEarnings).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{label}</span>
                </p>
              </div>
              <div className="rounded-[20px] p-4" style={cardStyle}>
                <span className="text-xs text-muted-foreground">Pot</span>
                <p className="text-xl font-bold text-foreground mt-1">
                  {convert(potSpent).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ {convert(potTotal).toLocaleString()} {label}</span>
                </p>
                {potTotal > 0 && (
                  <div className="w-full h-1.5 rounded-full bg-muted mt-2">
                    <div className="h-full rounded-full bg-foreground/60" style={{ width: `${Math.min((potSpent / potTotal) * 100, 100)}%` }} />
                  </div>
                )}
              </div>
            </div>

            {/* TikTok profile embed */}
            {tiktokUsername && (
              <div
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid hsl(var(--border))' }}
              >
                <iframe
                  src={`https://www.tiktok.com/embed/@${tiktokUsername}`}
                  style={{ width: '100%', height: 300, border: 'none', display: 'block', background: 'hsl(var(--background))', colorScheme: 'normal' }}
                  allow="encrypted-media"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSubmissionDetail;

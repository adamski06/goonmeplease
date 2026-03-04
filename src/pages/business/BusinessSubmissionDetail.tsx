import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubmissionData {
  id: string;
  tiktok_video_url: string;
  tiktok_video_id: string | null;
  status: string;
  current_views: number | null;
  current_likes: number | null;
  created_at: string;
  creator_id: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) return;
    const load = async () => {
      const { data } = await supabase
        .from('content_submissions')
        .select('id, tiktok_video_url, tiktok_video_id, status, current_views, current_likes, created_at, creator_id')
        .eq('id', submissionId)
        .maybeSingle();
      if (data) {
        setSubmission(data);
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', data.creator_id)
          .maybeSingle();
        setCreatorUsername(profile?.username || `User ${data.creator_id.slice(0, 6)}`);
      }
      setLoading(false);
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

  const tiktokEmbedUrl = submission.tiktok_video_id
    ? `https://www.tiktok.com/embed/v2/${submission.tiktok_video_id}`
    : null;

  // Extract TikTok username from URL for profile embed
  const tiktokUsernameMatch = submission.tiktok_video_url?.match(/tiktok\.com\/@([^/]+)/);
  const tiktokUsername = tiktokUsernameMatch ? tiktokUsernameMatch[1] : null;

  const cardStyle = {
    background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
    border: '1px solid hsl(var(--border))',
    boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin pr-0">
      <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Creator header */}
      <div className="flex items-center gap-3 mb-6">
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

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
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
      </div>

      {/* TikTok embeds: video + profile side by side */}
      <div className="flex gap-4 items-start">
        {tiktokEmbedUrl ? (
          <div className="flex-shrink-0 rounded-2xl" style={{ width: Math.ceil(325 * 0.63), height: 455 }}>
            <iframe
              src={tiktokEmbedUrl}
              style={{ width: 325, height: 740, border: 'none', display: 'block', transform: 'scale(0.63)', transformOrigin: 'top left', colorScheme: 'normal', willChange: 'transform' }}
              allow="encrypted-media"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="rounded-2xl p-8 text-center flex-1" style={cardStyle}>
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

        {tiktokUsername && (
          <iframe
            src={`https://www.tiktok.com/embed/@${tiktokUsername}`}
            className="flex-shrink-0 rounded-2xl"
            style={{ width: 580, height: 455, border: 'none', display: 'block', background: 'hsl(var(--background))', colorScheme: 'normal' }}
            allow="encrypted-media"
            allowFullScreen
          />
        )}
      </div>
      </div>
    </div>
  );
};

export default BusinessSubmissionDetail;

import React from 'react';
import { Eye, Heart, Clock, CheckCircle } from 'lucide-react';

export interface ActiveSubmission {
  id: string;
  campaign_id: string;
  tiktok_video_url: string;
  tiktok_video_id: string | null;
  status: 'pending_review' | 'approved' | 'denied' | 'paid';
  current_views: number;
  current_likes: number;
  created_at: string;
  campaign_title: string;
  campaign_brand: string;
  campaign_logo: string;
}

interface InActionCardProps {
  submission: ActiveSubmission;
  onClick: () => void;
}

const statusConfig = {
  pending_review: { label: 'Under Review', color: 'text-amber-600', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: Clock },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
  denied: { label: 'Denied', color: 'text-red-500', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: Clock },
  paid: { label: 'Paid', color: 'text-emerald-600', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
};

const InActionCard: React.FC<InActionCardProps> = ({ submission, onClick }) => {
  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-[28px] overflow-hidden flex items-center gap-3 px-4 py-3 text-left transition-all active:scale-[0.98]"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
        border: '1.5px solid rgba(255,255,255,0.8)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
      }}
    >
      {/* Brand logo */}
      <div className="w-14 h-14 rounded-[18px] overflow-hidden flex-shrink-0 bg-black/5 flex items-center justify-center">
        {submission.campaign_logo ? (
          <img src={submission.campaign_logo} alt={submission.campaign_brand} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-black/30">{submission.campaign_brand[0]}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-sm font-bold text-black font-montserrat truncate block">{submission.campaign_brand}</span>
        <p className="text-xs text-black/50 font-jakarta line-clamp-1">{submission.campaign_title}</p>
        {/* Stats row */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3 text-black/40" />
            <span className="text-[11px] font-medium text-black/50 font-jakarta">{(submission.current_views || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full flex-shrink-0"
        style={{ background: status.bg, border: `1px solid ${status.border}` }}
      >
        <StatusIcon className={`h-3 w-3 ${status.color}`} />
        <span className={`text-[10px] font-semibold font-montserrat ${status.color}`}>{status.label}</span>
      </div>
    </button>
  );
};

export default InActionCard;

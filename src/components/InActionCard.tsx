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
  pending_review: {
    label: 'Under Review',
    gradient: 'linear-gradient(180deg, rgba(245,158,11,0.85) 0%, rgba(217,119,6,0.95) 100%)',
    border: 'rgba(252,211,77,0.5)',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    gradient: 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)',
    border: 'rgba(52,211,153,0.5)',
    icon: CheckCircle,
  },
  denied: {
    label: 'Denied',
    gradient: 'linear-gradient(180deg, rgba(220,38,38,0.85) 0%, rgba(185,28,28,0.95) 100%)',
    border: 'rgba(252,165,165,0.5)',
    icon: Clock,
  },
  paid: {
    label: 'Paid',
    gradient: 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)',
    border: 'rgba(52,211,153,0.5)',
    icon: CheckCircle,
  },
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

      {/* Status badge - glassy pill */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full flex-shrink-0"
        style={{
          background: status.gradient,
          border: `1px solid ${status.border}`,
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)',
        }}
      >
        <span className="text-[10px] font-semibold text-white/80 font-montserrat">Status:</span>
        <span className="text-[10px] font-bold text-white font-montserrat">{status.label}</span>
      </div>
    </button>
  );
};

export default InActionCard;

import React from 'react';
import { ChevronLeft, Eye, Clock, CheckCircle } from 'lucide-react';
import { ActiveSubmission } from './InActionCard';

interface InActionDetailProps {
  submission: ActiveSubmission;
  onBack: () => void;
}

const statusConfig = {
  pending_review: { label: 'Under Review', color: 'text-amber-600', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: Clock },
  approved: { label: 'Approved', color: 'text-emerald-600', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
  denied: { label: 'Denied', color: 'text-red-500', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', icon: Clock },
  paid: { label: 'Paid', color: 'text-emerald-600', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
};

const InActionDetail: React.FC<InActionDetailProps> = ({ submission, onBack }) => {
  const status = statusConfig[submission.status];
  const StatusIcon = status.icon;

  return (
    <div className="h-full flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-black/60" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center pr-6">
          {submission.campaign_logo && (
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              <img src={submission.campaign_logo} alt={submission.campaign_brand} className="w-full h-full object-cover" />
            </div>
          )}
          <h2 className="text-sm font-bold text-black font-montserrat">{submission.campaign_brand}</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Status badge */}
        <div className="flex justify-center mb-4">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: status.bg, border: `1.5px solid ${status.border}` }}
          >
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <span className={`text-sm font-semibold font-montserrat ${status.color}`}>{status.label}</span>
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
                style={{
                  width: '325px',
                  height: '720px',
                  border: 'none',
                }}
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
          <h3 className="text-sm font-semibold text-black mb-3 font-montserrat">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Eye className="h-4 w-4 text-black/40 mx-auto mb-1" />
              <p className="text-lg font-bold text-black font-montserrat">{(submission.current_views || 0).toLocaleString()}</p>
              <p className="text-[11px] text-black/50 font-jakarta">Views</p>
            </div>
            <div className="rounded-xl p-3 text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Clock className="h-4 w-4 text-black/40 mx-auto mb-1" />
              <p className="text-lg font-bold text-black font-montserrat">
                {new Date(submission.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </p>
              <p className="text-[11px] text-black/50 font-jakarta">Submitted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InActionDetail;

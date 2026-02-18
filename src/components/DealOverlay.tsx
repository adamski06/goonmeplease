import React, { useState } from 'react';
import placeholderBlue from '@/assets/campaigns/placeholder-blue.jpg';
import { Bookmark, HandshakeIcon, X, Send } from 'lucide-react';
import EarningsGraph from '@/components/EarningsGraph';
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DealOverlayProps {
  deal: Campaign;
  isClosing: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}

const DealOverlay: React.FC<DealOverlayProps> = ({
  deal,
  isClosing,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  const { user } = useAuth();
  const [showPicture, setShowPicture] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleSendRequest = async () => {
    if (!user) {
      toast.error('You need to be logged in to apply for deals.');
      return;
    }

    setRequesting(true);
    try {
      // Check if already applied
      const { data: existing } = await supabase
        .from('deal_applications')
        .select('id')
        .eq('deal_id', deal.id)
        .eq('creator_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.info('You have already sent a request for this deal.');
        setRequested(true);
        setRequesting(false);
        return;
      }

      const { error } = await supabase
        .from('deal_applications')
        .insert({
          deal_id: deal.id,
          creator_id: user.id,
          status: 'pending',
        });

      if (error) throw error;

      setRequested(true);
      toast.success('Request sent! The brand will review your profile.');
    } catch (e) {
      console.error('Failed to apply for deal:', e);
      toast.error('Failed to send request. Please try again.');
    }
    setRequesting(false);
  };

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        style={{
          opacity: isClosing ? 0 : 1,
          transition: 'opacity 0.35s ease-out',
        }}
        onClick={onClose}
      />

      <style>{`
        @keyframes pill-slide-up {
          0% { transform: translateY(calc(100% + 92px)); }
          100% { transform: translateY(0); }
        }
        @keyframes pill-slide-down {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(100% + 92px)); }
        }
      `}</style>

      {/* Full white pill */}
      <div
        className="absolute left-3 right-3 bottom-[92px] rounded-[48px] overflow-hidden z-[60]"
        style={{
          maxHeight: 'calc(100dvh - 148px)',
          background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)',
          border: '1.5px solid rgba(255,255,255,0.8)',
          boxShadow:
            '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
          animation: isClosing
            ? 'pill-slide-down 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards'
            : 'pill-slide-up 0.5s cubic-bezier(0.32, 0.72, 0, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col overflow-hidden relative" style={{ maxHeight: 'calc(100dvh - 148px)', height: 'calc(100dvh - 148px)' }}>
          {/* X close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.1) 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <X className="h-4 w-4 text-black/60" />
          </button>

          {/* Header with brand */}
          <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-black/10">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/5">
              {deal.logo ? (
                <img src={deal.logo} alt={deal.brand} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-black/40">{deal.brand.charAt(0)}</span>
              )}
            </div>
            <h2 className="text-base font-bold text-black font-montserrat flex-1">
              {deal.brand}
            </h2>
            {/* Deal badge */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)', border: '1px solid rgba(96,165,250,0.4)' }}>
              <span className="text-[10px] font-bold text-white font-montserrat">DEAL</span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {/* Show Picture toggle */}
            {!showPicture ? (
              <button
                onClick={() => setShowPicture(true)}
                className="w-full mb-4 h-10 rounded-full text-xs font-semibold text-black/60 font-montserrat flex items-center justify-center gap-1.5"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                Show picture
              </button>
            ) : (
              <div className="mb-4 overflow-hidden rounded-xl animate-fade-in">
                <div className="mx-auto w-full max-w-[220px] aspect-[9/16] overflow-hidden rounded-xl">
                  <img src={deal.image || placeholderBlue} alt={deal.brand} className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">
              {deal.description}
            </p>

            {/* How Deals work info */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: 'linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(29,78,216,0.1) 100%)',
                border: '1px solid rgba(37,99,235,0.15)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)',
              }}
            >
              <h3 className="text-sm font-semibold text-blue-700 mb-2 font-montserrat">How Deals work</h3>
              <ul className="space-y-1.5">
                <li className="text-sm text-black/70 font-jakarta flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">1.</span>
                  Send a request to the brand
                </li>
                <li className="text-sm text-black/70 font-jakarta flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">2.</span>
                  Brand reviews your profile and accepts or declines
                </li>
                <li className="text-sm text-black/70 font-jakarta flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">3.</span>
                  If accepted, you create the content and submit your video
                </li>
                <li className="text-sm text-black/70 font-jakarta flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">4.</span>
                  Earn based on your video's performance
                </li>
              </ul>
            </div>

            {/* Requirements */}
            {deal.guidelines.length > 0 && (
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Requirements</h3>
                <ul className="space-y-1.5">
                  {deal.guidelines.map((guideline, idx) => (
                    <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                      <span className="text-black/40">•</span>
                      {guideline}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Earnings */}
            {deal.maxEarnings > 0 && (
              <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mb-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-semibold text-white/70 font-montserrat uppercase tracking-wider">Max Earnings</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white font-montserrat">{deal.maxEarnings.toLocaleString()}</span>
                    <span className="text-xs text-white/60 font-jakarta">sek</span>
                  </div>
                </div>
                <p className="text-xs text-white/50 font-jakarta">
                  Based on your video's views after acceptance.
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-5 py-5 flex items-center justify-center gap-3 flex-shrink-0">
            <button
              onClick={handleSendRequest}
              disabled={requesting || requested}
              className="h-12 px-8 text-sm font-bold rounded-full flex items-center gap-2 transition-all disabled:opacity-60"
              style={{
                background: requested
                  ? 'linear-gradient(180deg, rgba(5,150,105,0.9) 0%, rgba(4,120,87,0.95) 100%)'
                  : 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                border: '1.5px solid rgba(96,165,250,0.4)',
                boxShadow: '0 4px 20px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.15)',
                color: 'white',
              }}
            >
              <Send className="h-4 w-4" />
              {requested ? 'Request Sent!' : requesting ? 'Sending...' : 'Send Request'}
            </button>
            <button
              onClick={onToggleSave}
              className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <Bookmark
                className={`h-5 w-5 ${isSaved ? 'fill-black text-black' : 'text-black/50'}`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealOverlay;

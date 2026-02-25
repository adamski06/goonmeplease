import React, { useRef, useState, useEffect } from 'react';
import { Bookmark, X, Send } from 'lucide-react';
import tiktokIcon from '@/assets/tiktok-icon.png';
import placeholderBlue from '@/assets/campaigns/placeholder-blue.jpg';
import { Campaign } from '@/types/campaign';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface DealCardProps {
  deal: Campaign;
  isSaved: boolean;
  onToggleFavorite: (dealId: string, e: React.MouseEvent) => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, isSaved, onToggleFavorite }) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [expandReady, setExpandReady] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const nodeRef = useRef<HTMLDivElement>(null);

  const getClipInset = () => {
    if (!nodeRef.current) return 'inset(0)';
    const rect = nodeRef.current.getBoundingClientRect();
    const finalTop = 56;
    const finalLeft = 12;
    const finalW = window.innerWidth - 24;
    const finalH = window.innerHeight - 148;
    const top = rect.top - finalTop;
    const left = rect.left - finalLeft;
    const bottom = finalH - (rect.bottom - finalTop);
    const right = finalW - (rect.right - finalLeft);
    return `inset(${Math.max(0, top)}px ${Math.max(0, right)}px ${Math.max(0, bottom)}px ${Math.max(0, left)}px round 48px)`;
  };

  const [initClip, setInitClip] = useState('inset(0)');

  const openNode = () => {
    setInitClip(getClipInset());
    setIsExpanded(true);
    setExpandReady(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandReady(true);
      });
    });
  };

  const closeNode = () => {
    if (!isExpanded || isClosing) return;
    setInitClip(getClipInset());
    setExpandReady(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsClosing(false);
    }, 520);
  };

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isExpanded) {
      closeNode();
    } else {
      openNode();
    }
  };

  const handleSendRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('You need to be logged in to apply for deals.');
      return;
    }
    setRequesting(true);
    try {
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
        .insert({ deal_id: deal.id, creator_id: user.id, status: 'pending' });

      if (error) throw error;
      setRequested(true);
      toast.success('Request sent! The brand will review your profile.');
    } catch {
      toast.error('Failed to send request. Please try again.');
    }
    setRequesting(false);
  };

  useEffect(() => {
    setIsExpanded(false);
    setIsClosing(false);
    setExpandReady(false);
  }, [deal.id]);

  const nodeStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
    border: '1.5px solid rgba(255,255,255,0.8)',
    boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
  };

  return (
    <div className="h-[calc(100dvh-80px)] relative flex flex-col items-center justify-start snap-start snap-always">
      {/* Card image */}
      <div className="absolute top-14 left-3 right-3 bottom-3">
        <div
          onClick={openNode}
          className="absolute inset-x-0 top-0 bottom-0 rounded-[48px] overflow-hidden cursor-pointer"
        >
          <img src={deal.image || placeholderBlue} alt={deal.brand} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
        </div>
      </div>

      {/* Collapsed node */}
      <div
        ref={nodeRef}
        onClick={handleNodeClick}
        className={`absolute left-5 right-5 bottom-6 rounded-[48px] overflow-hidden ${isClosing ? 'z-[60]' : 'z-10'}`}
        style={{
          height: '180px',
          opacity: isClosing ? 1 : isExpanded ? 0 : 1,
          transition: isClosing ? 'opacity 0.35s ease-out 0.15s' : 'none',
          pointerEvents: isExpanded ? 'none' : 'auto',
          ...nodeStyle,
        }}
      >
        <div className="px-6 flex flex-col h-[180px]">
          <div className="flex items-center gap-2.5 pt-5 pb-1">
            <div className="h-[28px] w-[28px] rounded-full overflow-hidden border border-black/10 flex-shrink-0 flex items-center justify-center bg-black/5">
              {deal.logo ? (
                <img src={deal.logo} alt={deal.brand} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-black/40">{deal.brand.charAt(0)}</span>
              )}
            </div>
            <span className="text-sm font-bold text-black font-montserrat flex-1">{deal.brand}</span>
            {/* Deal badge */}
            <div className="rounded-[12px] px-2 h-[22px] flex items-center border shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" style={{ background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)', borderColor: 'rgba(96,165,250,0.4)' }}>
              <span className="text-[9px] font-bold text-white font-montserrat">DEAL</span>
            </div>
          </div>
          <div className="pb-2">
            <p className="text-sm text-black font-medium font-jakarta line-clamp-2 leading-relaxed">{deal.description}</p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-1 pb-5">
            <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[24px] px-5 py-2.5 flex items-baseline gap-1.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
              <span className="text-[10px] font-bold text-white/80 font-montserrat">Max</span>
              <span className="text-xl font-bold text-white font-montserrat">${deal.maxEarnings.toLocaleString()}</span>
            </div>
            {deal.ratePerView ? (
              <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[24px] px-5 py-2.5 flex items-baseline gap-1.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <span className="text-xl font-bold text-white font-montserrat">${deal.ratePerView}</span>
                <span className="text-sm font-semibold text-white/80 font-montserrat">/1k</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Expanded overlay */}
      {isExpanded && (
        <div
          onClick={closeNode}
          className="fixed z-50 rounded-[48px] overflow-hidden"
          style={{
            top: '56px',
            bottom: '92px',
            left: '12px',
            right: '12px',
            clipPath: expandReady ? 'inset(0 round 48px)' : initClip,
            willChange: 'clip-path',
            transition: expandReady
              ? 'clip-path 0.5s cubic-bezier(0.32, 0.72, 0, 1)'
              : 'clip-path 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.15s',
            ...nodeStyle,
          }}
        >
          <div
            className="h-full flex flex-col overflow-hidden relative"
            style={{
              opacity: expandReady && !isClosing ? 1 : 0,
              transition: expandReady ? 'opacity 0.35s ease-out 0.1s' : 'opacity 0.25s ease-out',
            }}
          >
            {/* X close */}
            <button
              onClick={(e) => { e.stopPropagation(); closeNode(); }}
              className="absolute top-4 right-4 z-20 h-8 w-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.1) 100%)', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <X className="h-4 w-4 text-black/60" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-black/10">
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-black/5">
                {deal.logo ? <img src={deal.logo} alt={deal.brand} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-black/40">{deal.brand.charAt(0)}</span>}
              </div>
              <h2 className="text-base font-bold text-black font-montserrat flex-1">{deal.brand}</h2>
              <div className="px-2.5 py-1 rounded-full" style={{ background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)', border: '1px solid rgba(96,165,250,0.4)' }}>
                <span className="text-[10px] font-bold text-white font-montserrat">DEAL</span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">{deal.description}</p>

              {/* How Deals work */}
              <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(29,78,216,0.1) 100%)', border: '1px solid rgba(37,99,235,0.15)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}>
                <h3 className="text-sm font-semibold text-blue-700 mb-2 font-montserrat">How Deals work</h3>
                <ul className="space-y-1.5">
                  {['Send a request to the brand', 'Brand reviews your profile and accepts or declines', 'If accepted, create your content and submit your video', 'Earn based on your video\'s performance'].map((step, i) => (
                    <li key={i} className="text-sm text-black/70 font-jakarta flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              {deal.guidelines.length > 0 && (
                <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)' }}>
                  <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Requirements</h3>
                  <ul className="space-y-1.5">
                    {deal.guidelines.map((g, idx) => (
                      <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                        <span className="text-black/40">•</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Max earnings */}
              {deal.maxEarnings > 0 && (
                <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mb-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold text-white/70 font-montserrat uppercase tracking-wider">Max Earnings</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-white font-montserrat">{deal.maxEarnings.toLocaleString()}</span>
                      <span className="text-xs text-white/60 font-jakarta">sek</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 font-jakarta">Based on your video's views after acceptance.</p>
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
                  boxShadow: '0 4px 20px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                  color: 'white',
                }}
              >
                <Send className="h-4 w-4" />
                {requested ? 'Request Sent!' : requesting ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(deal.id, e); }}
                className="h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(240,240,240,0.85) 100%)', border: '1.5px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,1)', backdropFilter: 'blur(12px)' }}
              >
                <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-black text-black' : 'text-black/50'}`} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealCard;

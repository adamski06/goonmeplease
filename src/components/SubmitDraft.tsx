import React, { useState, useEffect } from 'react';
import { ChevronLeft, Link2, Upload, X, CheckCircle, Loader2 } from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubmitDraftProps {
  campaign: Campaign;
  onBack: () => void;
}

const extractTikTokVideoId = (url: string): string | null => {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
};

const isValidTikTokUrl = (url: string): boolean => {
  return /tiktok\.com\/.+\/video\/\d+/.test(url) || /vm\.tiktok\.com\/\w+/.test(url);
};

const SubmitDraft: React.FC<SubmitDraftProps> = ({ campaign, onBack }) => {
  const { user } = useAuth();
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [guidelinesConfirmed, setGuidelinesConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isValidTikTokUrl(tiktokUrl)) {
      const id = extractTikTokVideoId(tiktokUrl);
      setVideoId(id);
      setConfirmed(false);
    } else {
      setVideoId(null);
      setConfirmed(false);
    }
  }, [tiktokUrl]);

  const handleClear = () => {
    setTiktokUrl('');
    setVideoId(null);
    setConfirmed(false);
  };

  const handleSubmit = async () => {
    if (!user || !videoId || !confirmed || !guidelinesConfirmed) return;

    setSubmitting(true);
    try {
      // Extract TikTok username from URL
      const usernameMatch = tiktokUrl.match(/tiktok\.com\/@([^/]+)/);
      const tiktokUsername = usernameMatch ? usernameMatch[1] : 'unknown';

      // Get or create tiktok account via security definer function
      const { data: accountId, error: accountError } = await supabase
        .rpc('get_or_create_tiktok_account', { p_tiktok_username: tiktokUsername });

      if (accountError || !accountId) {
        throw accountError || new Error('Could not resolve TikTok account');
      }

      const { data: existing } = await supabase
        .from('content_submissions')
        .select('id')
        .eq('campaign_id', campaign.id)
        .eq('creator_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.error('You have already submitted to this campaign');
        setSubmitting(false);
        return;
      }

      // Insert submission
      const { error: insertError } = await supabase
        .from('content_submissions')
        .insert({
          campaign_id: campaign.id,
          creator_id: user.id,
          tiktok_account_id: accountId,
          tiktok_video_url: tiktokUrl,
          tiktok_video_id: videoId,
          status: 'pending_review',
        });

      if (insertError) throw insertError;

      toast.success('Submission sent! The brand will review your video.');
      onBack();
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = videoId && confirmed && guidelinesConfirmed && !submitting;

  return (
    <div className="h-full flex flex-col overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-black/60" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center pr-6">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            <img src={campaign.logo} alt={campaign.brand} className="w-full h-full object-cover" />
          </div>
          <h2 className="text-sm font-bold text-black font-montserrat">Submit TikTok</h2>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Link input */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-black mb-3 font-montserrat">Your TikTok link</h3>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Link2 className="h-4 w-4 text-black/40" />
            </div>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              placeholder="https://www.tiktok.com/@user/video/..."
              className="w-full h-12 pl-10 pr-10 rounded-xl text-sm font-jakarta text-black placeholder:text-black/30 outline-none transition-all"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: videoId ? '1.5px solid rgba(16,185,129,0.4)' : '1.5px solid rgba(0,0,0,0.1)',
              }}
            />
            {tiktokUrl && (
              <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-black/40" />
              </button>
            )}
          </div>
        </div>

        {/* TikTok embed preview */}
        {videoId && (
          <div className="mb-5">
            <div className="flex justify-center mb-0">
              <div style={{
                transform: 'scale(0.75)',
                transformOrigin: 'top center',
                height: '565px',
                marginBottom: '-100px',
                overflow: 'hidden',
                borderRadius: '12px',
              }}>
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${videoId}`}
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

            {/* Confirmation */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl -mt-2"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: '1.5px solid rgba(0,0,0,0.08)',
              }}
            >
              <p className="text-sm font-semibold text-black font-montserrat">Is this your video?</p>
              <button
                onClick={() => setConfirmed(!confirmed)}
                className="flex items-center gap-2 px-3 py-2 rounded-full transition-all active:scale-[0.97]"
                style={{
                  background: confirmed
                    ? 'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.2) 100%)'
                    : 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                  border: confirmed
                    ? '1.5px solid rgba(16,185,129,0.4)'
                    : '1.5px solid rgba(0,0,0,0.1)',
                }}
              >
                <div
                  className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: confirmed
                      ? 'linear-gradient(180deg, rgba(16,185,129,1) 0%, rgba(5,150,105,1) 100%)'
                      : 'rgba(0,0,0,0.1)',
                  }}
                >
                  {confirmed && <CheckCircle className="h-3 w-3 text-white" />}
                </div>
                <span className={`text-xs font-medium font-jakarta ${confirmed ? 'text-emerald-700' : 'text-black/60'}`}>
                  Yes, confirm
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Show placeholder when no link */}
        {!videoId && (
          <div
            className="w-full aspect-[9/14] rounded-2xl flex flex-col items-center justify-center gap-3"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
              border: '2px dashed rgba(0,0,0,0.1)',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <Link2 className="h-6 w-6 text-black/40" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-black/60 font-montserrat">Paste your TikTok link</p>
              <p className="text-xs text-black/40 font-jakarta mt-1">The video will appear here</p>
            </div>
          </div>
        )}

        {/* Requirements */}
        <div
          className="rounded-xl p-4 mt-5"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Video requirements</h3>
          <ul className="space-y-1.5">
            {campaign.guidelines.map((guideline, idx) => (
              <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                <span className="text-black/40">•</span>
                {guideline}
              </li>
            ))}
          </ul>
        </div>

        {/* Guidelines confirmation */}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl mt-3"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
            border: guidelinesConfirmed ? '1.5px solid rgba(16,185,129,0.4)' : '1.5px solid rgba(0,0,0,0.08)',
          }}
        >
          <p className="text-sm font-semibold text-black font-montserrat">I followed all requirements</p>
          <button
            onClick={() => setGuidelinesConfirmed(!guidelinesConfirmed)}
            className="flex items-center gap-2 px-3 py-2 rounded-full transition-all active:scale-[0.97]"
            style={{
              background: guidelinesConfirmed
                ? 'linear-gradient(180deg, rgba(16,185,129,0.12) 0%, rgba(16,185,129,0.2) 100%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
              border: guidelinesConfirmed
                ? '1.5px solid rgba(16,185,129,0.4)'
                : '1.5px solid rgba(0,0,0,0.1)',
            }}
          >
            <div
              className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: guidelinesConfirmed
                  ? 'linear-gradient(180deg, rgba(16,185,129,1) 0%, rgba(5,150,105,1) 100%)'
                  : 'rgba(0,0,0,0.1)',
              }}
            >
              {guidelinesConfirmed && <CheckCircle className="h-3 w-3 text-white" />}
            </div>
            <span className={`text-xs font-medium font-jakarta ${guidelinesConfirmed ? 'text-emerald-700' : 'text-black/60'}`}>
              Confirm
            </span>
          </button>
        </div>
      </div>

      {/* Submit button */}
      <div className="px-5 py-5 flex-shrink-0">
        <button
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{
            background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
            border: '1.5px solid rgba(60,60,60,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            color: 'white',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {submitting ? 'Submitting...' : 'Submit'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default SubmitDraft;

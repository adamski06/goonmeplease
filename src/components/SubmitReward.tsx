import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Link2, X, CheckCircle, Loader2 } from 'lucide-react';
import { Campaign } from '@/types/campaign';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import tiktokLogo from '@/assets/tiktok-logo.png';
import { useNavigate } from 'react-router-dom';

interface SubmitRewardProps {
  reward: Campaign;
  onBack: () => void;
  onClose?: () => void;
}

const extractTikTokVideoId = (url: string): string | null => {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
};

const isValidTikTokUrl = (url: string): boolean => {
  try {
    const u = new URL(url.trim());
    const host = u.hostname.toLowerCase();
    return host === 'www.tiktok.com' || host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'm.tiktok.com';
  } catch {
    return false;
  }
};

const SubmitReward: React.FC<SubmitRewardProps> = ({ reward, onBack, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [guidelinesConfirmed, setGuidelinesConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [urlValid, setUrlValid] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasTikTok, setHasTikTok] = useState<boolean | null>(null);

  // Check if user has a TikTok account linked
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from('tiktok_accounts_safe')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      setHasTikTok(data && data.length > 0);
    };
    check();
  }, [user]);

  const resolveVideoId = useCallback(async (url: string) => {
    const directId = extractTikTokVideoId(url);
    if (directId) {
      setVideoId(directId);
      return;
    }
    setResolving(true);
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url.trim())}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        const embedMatch = data.html?.match(/video\/(\d+)/);
        if (embedMatch) {
          setVideoId(embedMatch[1]);
        } else if (data.embed_product_id) {
          setVideoId(data.embed_product_id);
        }
      }
    } catch (e) {
      console.error('oEmbed resolve failed:', e);
    }
    setResolving(false);
  }, []);

  useEffect(() => {
    const trimmed = tiktokUrl.trim();
    const valid = isValidTikTokUrl(trimmed);
    setUrlValid(valid);
    if (valid) {
      setConfirmed(false);
      resolveVideoId(trimmed);
    } else {
      setVideoId(null);
      setConfirmed(false);
    }
  }, [tiktokUrl, resolveVideoId]);

  const handleClear = () => {
    setTiktokUrl('');
    setVideoId(null);
    setConfirmed(false);
  };

  const handleSubmit = async () => {
    if (!user || !urlValid || !confirmed || !guidelinesConfirmed) return;

    setSubmitting(true);
    try {
      // Use the creator's registered TikTok account (don't extract username from URL)
      const { data: registeredAccounts } = await supabase
        .rpc('get_user_tiktok_accounts', { p_user_id: user.id });

      const tiktokUsername = registeredAccounts?.[0]?.tiktok_username;

      if (!tiktokUsername) {
        toast.error('No TikTok account linked. Please add your TikTok in settings.');
        setSubmitting(false);
        return;
      }

      const { data: accountId, error: accountError } = await supabase
        .rpc('get_or_create_tiktok_account', { p_tiktok_username: tiktokUsername });

      if (accountError || !accountId) {
        throw accountError || new Error('Could not resolve TikTok account');
      }

      // Check for existing submission
      const { data: existing } = await supabase
        .from('reward_submissions')
        .select('id')
        .eq('reward_ad_id', reward.id)
        .eq('creator_id', user.id)
        .maybeSingle();

      if (existing) {
        toast.error('You have already submitted to this reward ad');
        setSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase
        .from('reward_submissions')
        .insert({
          reward_ad_id: reward.id,
          creator_id: user.id,
          tiktok_account_id: accountId,
          tiktok_video_url: tiktokUrl,
          tiktok_video_id: videoId,
          status: 'pending_review',
        });

      if (insertError) throw insertError;

      toast.success('Submission sent! The brand will review your video.');
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submission error:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = urlValid && confirmed && guidelinesConfirmed && !submitting && !resolving;

  // Block if no TikTok linked
  if (hasTikTok === false) {
    return (
      <div className="h-full flex flex-col overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
          <button onClick={onBack} className="p-1 -ml-1">
            <ChevronLeft className="h-5 w-5 text-black/60" />
          </button>
          <div className="flex items-center gap-2 flex-1 justify-center pr-6">
            <h2 className="text-sm font-bold text-black font-montserrat">Submit TikTok</h2>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center mb-5">
            <img src={tiktokLogo} alt="TikTok" className="w-9 h-9 object-contain" />
          </div>
          <h3 className="text-lg font-bold text-black font-montserrat mb-2">Connect TikTok first</h3>
          <p className="text-sm text-black/50 font-jakarta leading-relaxed mb-6">
            You need to link your TikTok account before you can submit videos.
          </p>
          <button
            onClick={() => navigate('/user/edit-profile')}
            className="px-6 py-3 rounded-full text-sm font-bold text-white font-montserrat transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
              border: '1.5px solid rgba(60,60,60,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            Go to Profile Settings
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="h-full flex flex-col overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 justify-center">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              {reward.logo && <img src={reward.logo} alt={reward.brand} className="w-full h-full object-cover" />}
            </div>
            <h2 className="text-sm font-bold text-black font-montserrat">{reward.brand}</h2>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
            style={{
              background: 'linear-gradient(180deg, rgba(124,58,237,0.15) 0%, rgba(124,58,237,0.25) 100%)',
              border: '2px solid rgba(124,58,237,0.4)',
            }}
          >
            <CheckCircle className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-black font-montserrat mb-2">Video Submitted</h3>
          <p className="text-sm text-black/60 font-jakarta leading-relaxed mb-2">
            Your TikTok has been sent to {reward.brand} for review. Once your video reaches {(reward.viewsRequired || 0).toLocaleString()} views, you'll receive your reward!
          </p>

          {videoId && (
            <div className="mt-4">
              <div style={{
                transform: 'scale(0.6)',
                transformOrigin: 'top center',
                height: '432px',
                marginBottom: '-150px',
                overflow: 'hidden',
                borderRadius: '12px',
              }}>
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${videoId}`}
                  style={{ width: '325px', height: '720px', border: 'none' }}
                  allowFullScreen
                  allow="encrypted-media"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-5 flex-shrink-0">
          <button
            onClick={onClose || onBack}
            className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97]"
            style={{
              background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
              border: '1.5px solid rgba(60,60,60,0.6)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
              color: 'white',
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center px-5 pt-5 pb-3 border-b border-black/10 flex-shrink-0">
        <button onClick={onBack} className="p-1 -ml-1">
          <ChevronLeft className="h-5 w-5 text-black/60" />
        </button>
        <div className="flex items-center gap-2 flex-1 justify-center pr-6">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
            {reward.logo && <img src={reward.logo} alt={reward.brand} className="w-full h-full object-cover" />}
          </div>
          <h2 className="text-sm font-bold text-black font-montserrat">Submit TikTok</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-black mb-3 font-montserrat">Your TikTok link</h3>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
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
                  border: urlValid ? '1.5px solid rgba(124,58,237,0.4)' : '1.5px solid rgba(0,0,0,0.1)',
                }}
              />
              {tiktokUrl && (
                <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-black/40" />
                </button>
              )}
            </div>
            <button
              disabled={!urlValid || resolving}
              onClick={() => setConfirmed(true)}
              className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.95]"
              style={{
                background: urlValid
                  ? confirmed
                    ? 'linear-gradient(180deg, rgba(124,58,237,1) 0%, rgba(109,40,217,1) 100%)'
                    : 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)'
                  : 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                border: urlValid
                  ? confirmed
                    ? '1.5px solid rgba(167,139,250,0.5)'
                    : '1.5px solid rgba(60,60,60,0.6)'
                  : '1.5px solid rgba(0,0,0,0.1)',
                boxShadow: urlValid ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
              }}
            >
              {resolving ? (
                <Loader2 className="h-5 w-5 text-black/40 animate-spin" />
              ) : (
                <CheckCircle className={`h-5 w-5 ${urlValid ? 'text-white' : 'text-black/20'}`} />
              )}
            </button>
          </div>
        </div>

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
                  style={{ width: '325px', height: '720px', border: 'none' }}
                  allowFullScreen
                  allow="encrypted-media"
                />
              </div>
            </div>

            <button
              onClick={() => setConfirmed(!confirmed)}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl -mt-2 transition-all active:scale-[0.98]"
              style={{
                background: confirmed
                  ? 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.15) 100%)'
                  : 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: confirmed
                  ? '1.5px solid rgba(124,58,237,0.4)'
                  : '1.5px solid rgba(0,0,0,0.08)',
              }}
            >
              <div
                className="h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: confirmed
                    ? 'linear-gradient(180deg, rgba(124,58,237,1) 0%, rgba(109,40,217,1) 100%)'
                    : 'rgba(0,0,0,0.08)',
                  border: confirmed ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
                }}
              >
                {confirmed && <CheckCircle className="h-3.5 w-3.5 text-white" />}
              </div>
              <span className={`text-sm font-semibold font-montserrat ${confirmed ? 'text-purple-700' : 'text-black/70'}`}>
                This is my video
              </span>
            </button>
          </div>
        )}

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

        {reward.guidelines.length > 0 && (
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
              {reward.guidelines.map((guideline, idx) => (
                <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                  <span className="text-black/40">•</span>
                  {guideline}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setGuidelinesConfirmed(!guidelinesConfirmed)}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl mt-3 transition-all active:scale-[0.98]"
          style={{
            background: guidelinesConfirmed
              ? 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(124,58,237,0.15) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
            border: guidelinesConfirmed
              ? '1.5px solid rgba(124,58,237,0.4)'
              : '1.5px solid rgba(0,0,0,0.08)',
          }}
        >
          <div
            className="h-5 w-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: guidelinesConfirmed
                ? 'linear-gradient(180deg, rgba(124,58,237,1) 0%, rgba(109,40,217,1) 100%)'
                : 'rgba(0,0,0,0.08)',
              border: guidelinesConfirmed ? 'none' : '1.5px solid rgba(0,0,0,0.12)',
            }}
          >
            {guidelinesConfirmed && <CheckCircle className="h-3.5 w-3.5 text-white" />}
          </div>
          <span className={`text-sm font-semibold font-montserrat ${guidelinesConfirmed ? 'text-purple-700' : 'text-black/70'}`}>
            I followed all requirements
          </span>
        </button>
      </div>

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
          {submitting ? 'Submitting...' : 'Submit Video'}
        </button>
      </div>
    </div>
  );
};

export default SubmitReward;

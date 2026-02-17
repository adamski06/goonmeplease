import React, { useState, useEffect } from 'react';
import { ChevronLeft, Link2, Upload, X, CheckCircle } from 'lucide-react';
import { Campaign } from '@/types/campaign';

interface SubmitDraftProps {
  campaign: Campaign;
  onBack: () => void;
}

const extractTikTokVideoId = (url: string): string | null => {
  // Match patterns like tiktok.com/@user/video/1234567890
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
};

const isValidTikTokUrl = (url: string): boolean => {
  return /tiktok\.com\/.+\/video\/\d+/.test(url) || /vm\.tiktok\.com\/\w+/.test(url);
};

const SubmitDraft: React.FC<SubmitDraftProps> = ({ campaign, onBack }) => {
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

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
            <div
              className="flex items-stretch gap-4 rounded-2xl overflow-hidden p-3"
              style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                border: '1.5px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              {/* Video embed — scaled down to fit without cropping */}
              <div
                className="flex-shrink-0 rounded-xl overflow-hidden"
                style={{
                  width: '40%',
                  height: '360px',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <iframe
                  src={`https://www.tiktok.com/embed/v2/${videoId}`}
                  style={{
                    width: '208%',
                    height: '750px',
                    border: 'none',
                    transform: 'scale(0.48)',
                    transformOrigin: 'top left',
                  }}
                  allowFullScreen
                  allow="encrypted-media"
                />
              </div>

              {/* Right side — confirmation */}
              <div className="flex-1 flex flex-col items-start justify-center gap-3">
                <p className="text-sm font-semibold text-black font-montserrat">Is this your video?</p>
                <p className="text-xs text-black/50 font-jakarta">Make sure this is the correct TikTok before submitting.</p>
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
      </div>

      {/* Submit button */}
      <div className="px-5 py-5 flex-shrink-0">
        <button
          disabled={!videoId || !confirmed}
          className="w-full py-4 rounded-full text-base font-bold font-montserrat transition-all active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          style={{
            background: 'linear-gradient(180deg, rgba(30,30,30,1) 0%, rgba(10,10,10,1) 100%)',
            border: '1.5px solid rgba(60,60,60,0.6)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            color: 'white',
          }}
        >
          <span className="flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />
            Submit
          </span>
        </button>
      </div>
    </div>
  );
};

export default SubmitDraft;

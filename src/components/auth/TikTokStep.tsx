import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import tiktokLogo from '@/assets/tiktok-logo.png';

interface TikTokStepProps {
  userId: string;
  onNext: (username: string) => void;
  onSkip: () => void;
}

const blackGlassStyle = {
  background: 'linear-gradient(180deg, rgba(30,30,30,0.92) 0%, rgba(0,0,0,0.95) 100%)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
};

const TikTokStep: React.FC<TikTokStepProps> = ({ userId, onNext, onSkip }) => {
  const [linkInput, setLinkInput] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');

  const extractUsername = (input: string): string | null => {
    const trimmed = input.trim();
    if (/^@[\w.]+$/.test(trimmed)) return trimmed.replace('@', '');
    const urlMatch = trimmed.match(/tiktok\.com\/@([\w.]+)/i);
    if (urlMatch) return urlMatch[1];
    if (/^[\w.]{2,24}$/.test(trimmed)) return trimmed;
    return null;
  };

  const handleCheck = async () => {
    setError('');
    const extracted = extractUsername(linkInput);
    if (!extracted) {
      setError('Please enter a valid TikTok username or profile link');
      return;
    }
    setResolving(true);
    await new Promise(r => setTimeout(r, 600));
    setUsername(extracted);
    setResolving(false);
  };

  const handleContinue = () => {
    if (username) onNext(username);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <img src={tiktokLogo} alt="TikTok" className="w-12 h-12 object-contain" />
        </div>
        <h2 className="text-xl font-bold text-black mb-1">Add your TikTok</h2>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="@username or profile link"
            value={linkInput}
            onChange={(e) => {
              setLinkInput(e.target.value);
              setUsername(null);
              setError('');
            }}
            className="flex-1 bg-transparent border-0 border-b border-black/20 rounded-none px-0 py-2 text-black placeholder:text-black/40 focus-visible:ring-0 focus-visible:border-black"
          />
          <Button
            type="button"
            onClick={handleCheck}
            disabled={!linkInput.trim() || resolving}
            className="px-4 bg-black hover:bg-black/90 text-white rounded-full"
          >
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {username && (
        <div className="animate-fade-in rounded-xl border border-black/10 overflow-hidden bg-black/[0.02]">
          <iframe
            src={`https://www.tiktok.com/embed/@${username}`}
            className="w-full h-[340px] border-0"
            allowFullScreen
            allow="encrypted-media"
          />
          <div className="px-4 py-3 flex items-center gap-2 border-t border-black/5">
            <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center overflow-hidden">
              <img src={tiktokLogo} alt="" className="w-3 h-3 object-contain" />
            </div>
            <span className="text-sm font-medium text-black">@{username}</span>
            <Check className="h-3.5 w-3.5 text-green-600 ml-auto" />
          </div>
        </div>
      )}

      <div className="space-y-2 pt-2">
        <Button
          onClick={handleContinue}
          disabled={!username}
          className="w-full py-3 h-auto rounded-full font-semibold text-white border border-white/20 shadow-lg hover:opacity-90"
          style={blackGlassStyle}
        >
          Continue
        </Button>
        <button
          onClick={onSkip}
          className="w-full py-2 text-xs font-medium text-black/40 hover:text-black/60 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default TikTokStep;

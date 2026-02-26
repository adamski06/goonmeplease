import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import tiktokIcon from '@/assets/tiktok-icon.png';

interface TikTokStepProps {
  userId: string;
  onNext: (username: string) => void;
  onSkip: () => void;
}

const TikTokStep: React.FC<TikTokStepProps> = ({ userId, onNext, onSkip }) => {
  const [linkInput, setLinkInput] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState('');

  const extractUsername = (input: string): string | null => {
    const trimmed = input.trim();

    // Direct @username
    if (/^@[\w.]+$/.test(trimmed)) {
      return trimmed.replace('@', '');
    }

    // URL patterns: tiktok.com/@username
    const urlMatch = trimmed.match(/tiktok\.com\/@([\w.]+)/i);
    if (urlMatch) return urlMatch[1];

    // Plain username without @
    if (/^[\w.]{2,24}$/.test(trimmed)) {
      return trimmed;
    }

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
    // Small delay for UX
    await new Promise(r => setTimeout(r, 600));
    setUsername(extracted);
    setResolving(false);
  };

  const handleContinue = () => {
    if (username) {
      onNext(username);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center">
            <img src={tiktokIcon} alt="TikTok" className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-black mb-1">Add your TikTok</h2>
        <p className="text-sm text-black/50">Paste your profile link or username</p>
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
            className="flex-1 bg-white border-black/10 text-black placeholder:text-black/30"
          />
          <Button
            type="button"
            onClick={handleCheck}
            disabled={!linkInput.trim() || resolving}
            className="px-4 bg-black hover:bg-black/90 text-white rounded-[4px]"
          >
            {resolving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {/* TikTok embed preview */}
      {username && (
        <div className="animate-fade-in rounded-xl border border-black/10 overflow-hidden bg-black/[0.02]">
          <iframe
            src={`https://www.tiktok.com/embed/@${username}`}
            className="w-full h-[340px] border-0"
            allowFullScreen
            allow="encrypted-media"
          />
          <div className="px-4 py-3 flex items-center gap-2 border-t border-black/5">
            <img src={tiktokIcon} alt="" className="w-4 h-4" />
            <span className="text-sm font-medium text-black">@{username}</span>
            <Check className="h-3.5 w-3.5 text-green-600 ml-auto" />
          </div>
        </div>
      )}

      <div className="space-y-2 pt-2">
        <button
          onClick={handleContinue}
          disabled={!username}
          className="w-full py-2.5 rounded-full text-sm font-semibold text-white bg-black hover:bg-black/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
        </button>
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

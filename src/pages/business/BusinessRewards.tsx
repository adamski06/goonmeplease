import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const BusinessRewards: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Generate embed snippet
  const projectUrl = import.meta.env.VITE_SUPABASE_URL?.replace('.supabase.co', '') || '';
  const embedSnippet = `<iframe
  src="${window.location.origin}/rewards-embed"
  width="100%"
  height="520"
  frameborder="0"
  style="border-radius: 20px; border: none; max-width: 480px;"
  allow="camera; microphone"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Top bar */}
      <div
        className="w-full flex items-center shrink-0 animate-in slide-in-from-top-2 duration-300"
        style={{
          height: '64px',
          borderBottom: '1px solid hsl(var(--border))',
          background: 'hsl(var(--background))',
          paddingLeft: '20px',
        }}
      >
        <button onClick={() => navigate('/business/new')} className="text-muted-foreground hover:text-foreground transition-colors mr-3">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground font-montserrat">Jarla Rewards</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div
          className="w-full rounded-[28px] p-10 flex flex-col gap-6"
          style={{
            maxWidth: '720px',
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
          }}
        >
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground font-montserrat mb-2">Rewards Embed</h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
              Embed Jarla Rewards on your website or app. Visitors can earn credit on your platform by posting a video about your brand — driving authentic UGC and traffic to your Jarla ad.
            </p>
          </div>

          {/* How it works */}
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">How it works</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { step: '1', title: 'Embed', desc: 'Add the widget to your site or checkout flow.' },
                { step: '2', title: 'Create', desc: 'Users post a video about your brand on TikTok.' },
                { step: '3', title: 'Reward', desc: 'They earn credit on your platform based on views.' },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                  <span className="text-xs font-bold text-muted-foreground">{item.step}</span>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Embed code */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Embed code</p>
            <div className="relative">
              <pre className="rounded-xl border border-border bg-background p-4 text-xs text-foreground overflow-x-auto font-mono leading-relaxed">
                {embedSnippet}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          {/* Preview link */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('/rewards-embed', '_blank')}
              className="gap-1.5"
            >
              Preview embed
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">Opens the embed widget in a new tab</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRewards;

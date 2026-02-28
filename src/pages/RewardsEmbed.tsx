import React, { useState } from 'react';
import { ArrowRight, Video, Gift, Eye } from 'lucide-react';

/**
 * Standalone embeddable Jarla Rewards widget.
 * Designed to be placed inside an iframe on a partner's website.
 */
const RewardsEmbed: React.FC = () => {
  const [step, setStep] = useState<'intro' | 'how'>('intro');

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'hsl(0 0% 98%)' }}
    >
      <div
        className="w-full rounded-[24px] overflow-hidden"
        style={{
          maxWidth: '440px',
          background: '#ffffff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {step === 'intro' && (
          <div className="p-8 flex flex-col items-center text-center gap-5">
            {/* Logo area */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
              }}
            >
              <Gift className="h-6 w-6 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Earn rewards
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Post a video about us on TikTok and earn credit on our platform based on your views.
              </p>
            </div>

            <button
              onClick={() => setStep('how')}
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 'how' && (
          <div className="p-8 flex flex-col gap-5">
            <h3 className="text-lg font-bold text-gray-900 text-center" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              How it works
            </h3>

            <div className="space-y-3">
              {[
                { icon: Video, title: 'Post a video', desc: 'Film a short TikTok featuring our brand or product.' },
                { icon: Eye, title: 'Get views', desc: 'Share it and let the views roll in organically.' },
                { icon: Gift, title: 'Earn credit', desc: 'We\'ll reward you with platform credit based on your performance.' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl"
                  style={{ background: '#f8f8f8' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#1a1a1a' }}
                  >
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="/user"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] mt-1"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              Start earning
              <ArrowRight className="h-4 w-4" />
            </a>

            <p className="text-[10px] text-gray-400 text-center">
              Powered by Jarla
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsEmbed;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    q: 'How do I earn money on Jarla?',
    a: 'Create TikTok videos for brand campaigns listed on the Discover page. Once your video is approved and reaches views, you earn based on the campaign\'s pay-per-view rate.',
  },
  {
    q: 'When do I get paid?',
    a: 'After your video is approved, earnings accumulate based on views. You can request a payout once your balance reaches the minimum threshold. Payouts are processed to your connected Stripe account.',
  },
  {
    q: 'How do I connect my TikTok account?',
    a: 'Go to your Profile, tap the edit icon, and scroll down to "TikTok Account". Tap "Link your TikTok account" and enter your TikTok username.',
  },
  {
    q: 'What are Reward Ads?',
    a: 'Reward Ads let you earn coupon codes or discounts instead of money. Create a video, hit the required views, and claim your reward.',
  },
  {
    q: 'How do I submit a video?',
    a: 'Open a campaign, tap "Submit", paste your TikTok video URL, and submit for review. The brand will review your content within a few days.',
  },
  {
    q: 'Why was my video denied?',
    a: 'Videos may be denied if they don\'t follow the campaign guidelines. Check the review notes for details, and you can submit a new video.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Go to Settings → More → Delete Account. You\'ll need to type "DELETE" to confirm. This action is permanent and cannot be undone.',
  },
  {
    q: 'How do I change my username?',
    a: 'Go to Edit Profile and update your username. You can change it once every 14 days.',
  },
];

const HelpCenter: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="flex flex-col border-b border-black/10 safe-area-top">
        <div className="flex items-center px-4 py-3 relative">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1">
            <ChevronLeft className="h-6 w-6 text-black" />
          </button>
          <span className="text-base font-semibold text-black flex-1 text-center pr-6 font-montserrat">Help Center</span>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* FAQ */}
        <div>
          <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat mb-3 px-1">
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-2xl overflow-hidden border-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <AccordionTrigger className="px-4 py-3.5 text-sm text-black font-jakarta text-left hover:no-underline [&[data-state=open]>svg]:rotate-180">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-black/60 font-jakarta leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wider font-montserrat mb-3 px-1">
            Still need help?
          </h3>
          <button
            onClick={() => navigate('/user/support')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span className="text-sm text-black font-jakarta flex-1 text-left">Contact Support</span>
            <ChevronRight className="h-4 w-4 text-black/20" />
          </button>
          <button
            onClick={() => window.open('https://jarla.org', '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl mt-2"
            style={{
              background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.06) 100%)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <span className="text-sm text-black font-jakarta flex-1 text-left">Visit jarla.org</span>
            <ExternalLink className="h-4 w-4 text-black/20" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;

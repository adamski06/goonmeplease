import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getHighResLogoUrl } from '@/lib/logoUrl';
import { ExternalLink, Eye, Users, Clock } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

interface PublicAdData {
  id: string;
  title: string;
  brand_name: string;
  brand_logo_url: string | null;
  description: string | null;
  cover_image_url: string | null;
  guidelines: string[] | null;
  category: string | null;
  video_length: string | null;
  max_earnings: number | null;
  total_budget: number | null;
  created_at: string;
  business_id: string;
  type: 'spread' | 'deal';
  rate_display: string;
}

interface BusinessInfo {
  company_name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
}

const PublicAd: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<PublicAdData | null>(null);
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissionCount, setSubmissionCount] = useState(0);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      // Try campaigns first
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, brand_logo_url, description, cover_image_url, guidelines, category, video_length, max_earnings, total_budget, created_at, business_id')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (campaign) {
        // Get tier for rate
        const { data: tiers } = await supabase
          .from('campaign_tiers')
          .select('rate_per_view')
          .eq('campaign_id', id)
          .order('min_views', { ascending: true })
          .limit(1);
        
        const rate = tiers?.[0]?.rate_per_view;
        setAd({
          ...campaign,
          type: 'spread',
          rate_display: rate ? `$${(rate * 1000).toFixed(2)}/1k views` : '',
        });

        // Count submissions
        const { count } = await supabase
          .from('content_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('campaign_id', id);
        setSubmissionCount(count || 0);

        // Get business info
        const { data: biz } = await supabase
          .from('business_profiles')
          .select('company_name, logo_url, website, description, industry')
          .eq('user_id', campaign.business_id)
          .maybeSingle();
        if (biz) setBusiness(biz);
      } else {
        // Try deals
        const { data: deal } = await supabase
          .from('deals')
          .select('id, title, brand_name, brand_logo_url, description, cover_image_url, guidelines, category, video_length, max_earnings, total_budget, created_at, business_id, rate_per_view')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (deal) {
          setAd({
            ...deal,
            type: 'deal',
            rate_display: deal.rate_per_view ? `$${(deal.rate_per_view * 1000).toFixed(2)}/1k views` : '',
          });

          const { count } = await supabase
            .from('deal_applications')
            .select('id', { count: 'exact', head: true })
            .eq('deal_id', id);
          setSubmissionCount(count || 0);

          const { data: biz } = await supabase
            .from('business_profiles')
            .select('company_name, logo_url, website, description, industry')
            .eq('user_id', deal.business_id)
            .maybeSingle();
          if (biz) setBusiness(biz);
        }
      }

      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-white/50">This ad is no longer available</p>
        <Link to="/" className="text-sm text-blue-400 hover:underline">Go to Jarla →</Link>
      </div>
    );
  }

  const logoSrc = ad.brand_logo_url
    ? getHighResLogoUrl(ad.brand_logo_url) || ad.brand_logo_url
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative">
        {ad.cover_image_url ? (
          <div className="w-full aspect-[16/7] overflow-hidden">
            <img src={ad.cover_image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
          </div>
        ) : (
          <div className="w-full aspect-[16/7] bg-gradient-to-br from-white/5 to-white/[0.02]" />
        )}

        {/* Floating brand card */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-full max-w-2xl px-6">
          <div
            className="rounded-3xl px-8 py-6 flex items-center gap-5"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div className="h-16 w-16 rounded-2xl bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
              {logoSrc ? (
                <img src={logoSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white/40 font-montserrat">
                  {ad.brand_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40 font-jakarta uppercase tracking-wider mb-1">{ad.type === 'spread' ? 'Spread' : 'Deal'}</p>
              <h1 className="text-xl font-bold text-white font-montserrat truncate">{ad.title}</h1>
              <p className="text-sm text-white/50 font-jakarta">{ad.brand_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-20">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {ad.rate_display && (
            <div
              className="rounded-2xl px-4 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-lg font-bold text-white font-montserrat">{ad.rate_display}</p>
              <p className="text-[11px] text-white/35 font-jakarta mt-1">Rate</p>
            </div>
          )}
          {ad.max_earnings != null && ad.max_earnings > 0 && (
            <div
              className="rounded-2xl px-4 py-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-lg font-bold text-emerald-400 font-montserrat">${ad.max_earnings}</p>
              <p className="text-[11px] text-white/35 font-jakarta mt-1">Max per creator</p>
            </div>
          )}
          <div
            className="rounded-2xl px-4 py-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-lg font-bold text-white font-montserrat">{submissionCount}</p>
            <p className="text-[11px] text-white/35 font-jakarta mt-1">Creators</p>
          </div>
        </div>

        {/* Description */}
        {ad.description && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-white/70 font-montserrat mb-3">About this ad</h2>
            <p className="text-sm text-white/50 leading-relaxed font-jakarta">{ad.description}</p>
          </div>
        )}

        {/* Guidelines */}
        {ad.guidelines && ad.guidelines.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-white/70 font-montserrat mb-3">Guidelines</h2>
            <ul className="space-y-2">
              {ad.guidelines.map((g, i) => (
                <li key={i} className="text-sm text-white/50 font-jakarta flex items-start gap-2">
                  <span className="text-white/20 mt-0.5">•</span>
                  {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Details pills */}
        <div className="flex flex-wrap gap-2 mb-10">
          {ad.category && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white/60 border border-white/10 bg-white/[0.03]">
              {ad.category}
            </span>
          )}
          {ad.video_length && (
            <span className="px-3 py-1.5 rounded-full text-xs font-medium text-white/60 border border-white/10 bg-white/[0.03] flex items-center gap-1">
              <Clock className="h-3 w-3" /> {ad.video_length}
            </span>
          )}
        </div>

        {/* Business card */}
        {business && (
          <Link
            to={`/brand/${ad.business_id}`}
            className="block rounded-2xl p-5 mb-10 transition-all hover:ring-1 hover:ring-white/10"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                {business.logo_url ? (
                  <img src={getHighResLogoUrl(business.logo_url) || business.logo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white/30 font-montserrat">
                    {business.company_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white font-montserrat">{business.company_name}</p>
                {business.industry && (
                  <p className="text-xs text-white/40 font-jakarta">{business.industry}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-white/20" />
            </div>
          </Link>
        )}

        {/* CTA */}
        <div className="text-center">
          <a
            href="/user"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-black bg-white hover:bg-white/90 transition-colors font-montserrat"
          >
            Open in Jarla
          </a>
          <p className="text-xs text-white/25 mt-3 font-jakarta">Join as a creator and start earning</p>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-white/[0.06] flex items-center justify-center gap-2">
          <img src={jarlaLogo} alt="Jarla" className="h-3.5" />
          <span className="text-[11px] text-white/20 font-jakarta">Powered by Jarla</span>
        </div>
      </div>
    </div>
  );
};

export default PublicAd;

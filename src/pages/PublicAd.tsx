import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getHighResLogoUrl } from '@/lib/logoUrl';
import { ExternalLink, Clock } from 'lucide-react';
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

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      // Try campaigns first
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, brand_logo_url, description, cover_image_url, guidelines, category, video_length, max_earnings, total_budget, business_id')
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (campaign) {
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

        const { data: biz } = await supabase
          .from('business_profiles')
          .select('company_name, logo_url, website, description, industry')
          .eq('user_id', campaign.business_id)
          .maybeSingle();
        if (biz) setBusiness(biz);
      } else {
        const { data: deal } = await supabase
          .from('deals')
          .select('id, title, brand_name, brand_logo_url, description, cover_image_url, guidelines, category, video_length, max_earnings, total_budget, business_id, rate_per_view')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();

        if (deal) {
          setAd({
            ...deal,
            type: 'deal',
            rate_display: deal.rate_per_view ? `$${(deal.rate_per_view * 1000).toFixed(2)}/1k views` : '',
          });

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
      <div className="min-h-screen bg-[#f5f3ef] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-black/10 border-t-black/60 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-[#f5f3ef] flex flex-col items-center justify-center gap-4">
        <p className="text-black/40 font-jakarta">This ad is no longer available</p>
        <Link to="/" className="text-sm text-black/60 hover:text-black transition-colors font-jakarta">Go to Jarla →</Link>
      </div>
    );
  }

  const logoSrc = ad.brand_logo_url
    ? getHighResLogoUrl(ad.brand_logo_url) || ad.brand_logo_url
    : null;

  const cardStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(240,238,234,0.6) 100%)',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header — brand logo + title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-full bg-white/60 shrink-0 overflow-hidden flex items-center justify-center" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
            {logoSrc ? (
              <img src={logoSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-black/30 font-montserrat">
                {ad.brand_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-black font-montserrat">{ad.title}</h1>
            <p className="text-sm text-black/40 font-jakarta">{ad.brand_name}</p>
          </div>
        </div>

        {/* Main ad card — brief left, thumbnail right (mirrors business detail) */}
        <div className="rounded-[28px] p-6 flex gap-5 mb-6" style={cardStyle}>
          {/* Left: text content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-black font-montserrat mb-3">{ad.title}</h3>

            {ad.description && (
              <p className="text-sm text-black/50 leading-relaxed mb-4 font-jakarta">{ad.description}</p>
            )}

            {ad.guidelines && ad.guidelines.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-black/70 mb-2 font-montserrat">Guidelines</h4>
                <ul className="space-y-1.5">
                  {ad.guidelines.map((g, i) => (
                    <li key={i} className="text-sm text-black/50 font-jakarta flex items-start gap-2">
                      <span className="text-black/20 mt-0.5">•</span>
                      {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Details pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {ad.category && (
                <span className="px-3 py-1.5 rounded-full text-[11px] font-medium text-black/50 border border-black/8 bg-white/40 font-jakarta">
                  {ad.category}
                </span>
              )}
              {ad.video_length && (
                <span className="px-3 py-1.5 rounded-full text-[11px] font-medium text-black/50 border border-black/8 bg-white/40 font-jakarta flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {ad.video_length}
                </span>
              )}
            </div>

            {/* Earnings rows */}
            <div className="pt-3 space-y-1.5 border-t border-black/[0.04]">
              {ad.max_earnings != null && ad.max_earnings > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black/40 w-20 font-jakarta">Max payout</span>
                  <span className="text-sm font-semibold text-black font-montserrat">${ad.max_earnings}</span>
                </div>
              )}
              {ad.rate_display && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black/40 w-20 font-jakarta">Rate</span>
                  <span className="text-sm font-semibold text-black font-montserrat">{ad.rate_display}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: thumbnail */}
          <div className="shrink-0 w-[182px]">
            <div
              className="w-full aspect-[9/14] rounded-[28px] overflow-hidden"
              style={{ border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {ad.cover_image_url ? (
                <img src={ad.cover_image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className="h-full w-full flex flex-col items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.05) 100%)' }}
                >
                  <span className="text-lg font-bold text-black/15 font-montserrat">
                    {ad.brand_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pot / Budget info */}
        {ad.total_budget != null && ad.total_budget > 0 && (
          <div
            className="rounded-[20px] p-5 mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(5,150,105,0.03) 100%)',
              border: '1px solid rgba(5,150,105,0.15)',
            }}
          >
            <span className="text-xs font-jakarta" style={{ color: 'rgba(5,120,87,0.6)' }}>Total Pot</span>
            <p className="text-xl font-bold font-montserrat mt-1" style={{ color: 'hsl(160, 70%, 25%)' }}>
              ${ad.total_budget.toLocaleString()}
            </p>
          </div>
        )}

        {/* Business link */}
        {business && (
          <Link
            to={`/brand/${ad.business_id}`}
            className="flex items-center gap-4 rounded-2xl p-4 transition-all hover:ring-1 hover:ring-black/5 mb-10"
            style={cardStyle}
          >
            <div className="h-10 w-10 rounded-full bg-white/60 shrink-0 overflow-hidden flex items-center justify-center" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              {business.logo_url ? (
                <img src={getHighResLogoUrl(business.logo_url) || business.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-black/25 font-montserrat">
                  {business.company_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-black font-montserrat">{business.company_name}</p>
              {business.industry && (
                <p className="text-xs text-black/40 font-jakarta">{business.industry}</p>
              )}
            </div>
            <ExternalLink className="h-4 w-4 text-black/15" />
          </Link>
        )}

        {/* CTA */}
        <div className="text-center mb-10">
          <a
            href="/user"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-black hover:bg-black/85 transition-colors font-montserrat"
          >
            Open in Jarla
          </a>
          <p className="text-xs text-black/25 mt-3 font-jakarta">Join as a creator and start earning</p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-black/[0.04] flex items-center justify-center gap-2">
          <img src={jarlaLogo} alt="Jarla" className="h-3.5" style={{ filter: 'invert(1)' }} />
          <span className="text-[11px] text-black/20 font-jakarta">Powered by Jarla</span>
        </div>
      </div>
    </div>
  );
};

export default PublicAd;

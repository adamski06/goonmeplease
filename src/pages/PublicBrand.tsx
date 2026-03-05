import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getHighResLogoUrl } from '@/lib/logoUrl';
import { ExternalLink, Megaphone, Handshake } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

interface BrandData {
  company_name: string;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  industry: string | null;
  user_id: string;
}

interface PublicAd {
  id: string;
  title: string;
  cover_image_url: string | null;
  max_earnings: number | null;
  type: 'spread' | 'deal';
}

const PublicBrand: React.FC = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [ads, setAds] = useState<PublicAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;
    const load = async () => {
      const { data: profile } = await supabase
        .from('business_profiles')
        .select('company_name, logo_url, website, description, industry, user_id')
        .eq('user_id', businessId)
        .maybeSingle();

      if (profile) {
        setBrand(profile);

        const [campaignsRes, dealsRes] = await Promise.all([
          supabase.from('campaigns')
            .select('id, title, cover_image_url, max_earnings')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
          supabase.from('deals')
            .select('id, title, cover_image_url, max_earnings')
            .eq('business_id', businessId)
            .eq('is_active', true)
            .order('created_at', { ascending: false }),
        ]);

        const spreads: PublicAd[] = (campaignsRes.data || []).map(c => ({ ...c, type: 'spread' as const }));
        const deals: PublicAd[] = (dealsRes.data || []).map(d => ({ ...d, type: 'deal' as const }));
        setAds([...spreads, ...deals]);
      }
      setLoading(false);
    };
    load();
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-white/50">Brand not found</p>
        <Link to="/" className="text-sm text-blue-400 hover:underline">Go to Jarla →</Link>
      </div>
    );
  }

  const logoSrc = brand.logo_url ? getHighResLogoUrl(brand.logo_url) || brand.logo_url : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="h-24 w-24 rounded-full bg-white/10 mx-auto mb-5 overflow-hidden flex items-center justify-center">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-white/30 font-montserrat">
              {brand.company_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white font-montserrat mb-2">{brand.company_name}</h1>
        {brand.industry && (
          <p className="text-sm text-white/40 font-jakarta mb-2">{brand.industry}</p>
        )}
        {brand.description && (
          <p className="text-sm text-white/50 font-jakarta leading-relaxed max-w-lg mx-auto mb-4">{brand.description}</p>
        )}
        {brand.website && (
          <a
            href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            {brand.website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      {/* Ads grid */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-sm font-semibold text-white/60 font-montserrat mb-5">
          Active Ads ({ads.length})
        </h2>
        {ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-white/30 font-jakarta">No active ads right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {ads.map(ad => (
              <Link
                key={`${ad.type}-${ad.id}`}
                to={`/ad/${ad.id}`}
                className="group aspect-[9/14] rounded-3xl overflow-hidden relative transition-all hover:ring-1 hover:ring-white/15"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {ad.cover_image_url ? (
                  <img src={ad.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/[0.01]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                {/* Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {ad.type === 'spread' ? <Megaphone className="h-2.5 w-2.5" /> : <Handshake className="h-2.5 w-2.5" />}
                    {ad.type === 'spread' ? 'Spread' : 'Deal'}
                  </span>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs font-bold text-white font-montserrat line-clamp-2 leading-snug">{ad.title}</p>
                  {ad.max_earnings != null && ad.max_earnings > 0 && (
                    <p className="text-[10px] text-emerald-400 font-jakarta mt-1">Up to ${ad.max_earnings}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-white/[0.06] flex items-center justify-center gap-2">
          <img src={jarlaLogo} alt="Jarla" className="h-3.5" />
          <span className="text-[11px] text-white/20 font-jakarta">Powered by Jarla</span>
        </div>
      </div>
    </div>
  );
};

export default PublicBrand;

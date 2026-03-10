import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getHighResLogoUrl } from '@/lib/logoUrl';
import jarlaLogo from '@/assets/jarla-logo.png';

interface EmbedData {
  id: string;
  title: string;
  brand_name: string;
  brand_logo_url: string | null;
  cover_image_url: string | null;
  max_earnings: number | null;
  description: string | null;
  type: 'spread' | 'deal' | 'reward';
  rate_display: string;
}

const EmbedAd: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ad, setAd] = useState<EmbedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('id, title, brand_name, brand_logo_url, cover_image_url, max_earnings, description')
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
        setAd({ ...campaign, type: 'spread', rate_display: rate ? `$${(rate * 1000).toFixed(2)}/1k` : '' });
      } else {
        const { data: deal } = await supabase
          .from('deals')
          .select('id, title, brand_name, brand_logo_url, cover_image_url, max_earnings, description, rate_per_view')
          .eq('id', id)
          .eq('is_active', true)
          .maybeSingle();
        if (deal) {
          setAd({ ...deal, type: 'deal', rate_display: deal.rate_per_view ? `$${(deal.rate_per_view * 1000).toFixed(2)}/1k` : '' });
        } else {
          // Try reward_ads
          const { data: reward } = await supabase
            .from('reward_ads')
            .select('id, title, brand_name, brand_logo_url, cover_image_url, description, reward_description, views_required')
            .eq('id', id)
            .eq('is_active', true)
            .maybeSingle();
          if (reward) {
            setAd({
              ...reward,
              type: 'reward',
              max_earnings: null,
              rate_display: reward.views_required > 0 ? `${reward.views_required.toLocaleString()} views` : 'Just post',
            });
          }
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0a' }}>
        <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
      </div>
    );
  }

  if (!ad) return null;

  const logoSrc = ad.brand_logo_url ? getHighResLogoUrl(ad.brand_logo_url) || ad.brand_logo_url : null;
  const publicUrl = `${window.location.origin}/ad/${ad.id}`;

  return (
    <a
      href={publicUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        gap: 16,
        padding: 16,
        borderRadius: 20,
        background: 'linear-gradient(180deg, #141414 0%, #0e0e0e 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'white',
        textDecoration: 'none',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        maxWidth: 420,
        overflow: 'hidden',
      }}
    >
      {/* Thumbnail */}
      {ad.cover_image_url && (
        <div style={{ width: 80, height: 120, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
          <img src={ad.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {logoSrc && (
            <img src={logoSrc} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{ad.brand_name}</span>
        </div>
        <p style={{ fontSize: 14, fontWeight: 700, color: 'white', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ad.title}
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {ad.rate_display && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{ad.rate_display}</span>
          )}
          {ad.max_earnings != null && ad.max_earnings > 0 && (
            <span style={{ fontSize: 11, color: '#34d399' }}>Up to ${ad.max_earnings}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <img src={jarlaLogo} alt="Jarla" style={{ height: 10, filter: 'invert(1)' }} />
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.15)' }}>Powered by Jarla</span>
        </div>
      </div>
    </a>
  );
};

export default EmbedAd;

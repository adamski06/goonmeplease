import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Eye, DollarSign, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CampaignData {
  id: string;
  title: string;
  brand_name: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean | null;
  status: string | null;
  total_budget: number | null;
  max_earnings: number | null;
  created_at: string;
  guidelines: string[] | null;
  category: string | null;
  video_length: string | null;
}

interface Submission {
  id: string;
  tiktok_video_url: string;
  tiktok_video_id: string | null;
  status: string;
  current_views: number | null;
  current_likes: number | null;
  created_at: string;
  creator_id: string;
  creator_username?: string;
}

const BusinessCampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tiers, setTiers] = useState<{ min_views: number; max_views: number | null; rate_per_view: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [campRes, subRes, tierRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', id).maybeSingle(),
        supabase.from('content_submissions')
          .select('id, tiktok_video_url, tiktok_video_id, status, current_views, current_likes, created_at, creator_id')
          .eq('campaign_id', id)
          .order('created_at', { ascending: false }),
        supabase.from('campaign_tiers')
          .select('min_views, max_views, rate_per_view')
          .eq('campaign_id', id)
          .order('min_views', { ascending: true }),
      ]);
      if (campRes.data) setCampaign(campRes.data);
      setTiers(tierRes.data || []);

      const subs = subRes.data || [];
      // Fetch usernames
      if (subs.length > 0) {
        const creatorIds = [...new Set(subs.map(s => s.creator_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', creatorIds);
        const usernameMap: Record<string, string> = {};
        (profiles || []).forEach(p => {
          if (p.username) usernameMap[p.user_id] = p.username;
        });
        setSubmissions(subs.map(s => ({
          ...s,
          creator_username: usernameMap[s.creator_id] || `User ${s.creator_id.slice(0, 6)}`,
        })));
      } else {
        setSubmissions([]);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `thumbnails/${id}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('campaign-assets')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('campaign-assets').getPublicUrl(path);
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ cover_image_url: urlData.publicUrl })
      .eq('id', id);
    if (updateError) {
      toast({ title: 'Error', description: updateError.message, variant: 'destructive' });
    } else {
      setCampaign(prev => prev ? { ...prev, cover_image_url: urlData.publicUrl } : prev);
      toast({ title: 'Thumbnail updated' });
    }
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Campaign not found</p>
        <Button variant="outline" onClick={() => navigate('/business')}>Go back</Button>
      </div>
    );
  }

  const totalViews = submissions.reduce((sum, s) => sum + (s.current_views || 0), 0);
  const potUsed = campaign.total_budget ? Math.min(totalViews * 0.003, campaign.total_budget) : 0; // rough estimate
  const potTotal = campaign.total_budget || 0;
  const potPercent = potTotal > 0 ? Math.min((potUsed / potTotal) * 100, 100) : 0;
  const approved = submissions.filter(s => s.status === 'approved' || s.status === 'paid');

  const greenPillStyle = {
    background: 'linear-gradient(135deg, hsla(142, 71%, 45%, 0.12) 0%, hsla(142, 71%, 45%, 0.06) 100%)',
    border: '1px solid hsla(142, 71%, 45%, 0.25)',
    color: 'hsl(142, 71%, 35%)',
    backdropFilter: 'blur(8px)',
  };

  const cardStyle = {
    background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
    border: '1px solid hsl(var(--border))',
    boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back */}
      <button
        onClick={() => navigate('/business')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="relative group">
          <div className="h-16 w-16 rounded-xl bg-muted shrink-0 overflow-hidden">
            {campaign.cover_image_url ? (
              <img src={campaign.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground/40 font-montserrat">
                  {campaign.brand_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            {uploading ? (
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="h-4 w-4 text-white" />
            )}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground font-montserrat">{campaign.title}</h1>
            <Badge variant="outline" className={campaign.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
              {campaign.is_active ? 'Active' : 'Ended'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats: Views + Pot */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="rounded-[28px] p-5" style={cardStyle}>
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
          </p>
        </div>
        <div className="rounded-[28px] p-5" style={cardStyle}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Pot</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            ${potUsed >= 1000 ? `${(potUsed / 1000).toFixed(1)}k` : potUsed.toFixed(0)}
            <span className="text-sm font-normal text-muted-foreground ml-1">/ ${potTotal.toLocaleString()}</span>
          </p>
          {potTotal > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${potPercent}%`, background: 'hsl(142, 71%, 45%)' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* In Action Creators (approved submissions) — half width */}
      <div className="mb-8 max-w-[50%]">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          In Action Creators ({approved.length})
        </h3>

        {approved.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-4 text-center">
            <p className="text-xs text-muted-foreground">No active creators yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {approved.map(sub => (
              <div key={sub.id} className="rounded-[20px] p-4" style={cardStyle}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground/60 font-montserrat">
                      {(sub.creator_username || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">@{sub.creator_username}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{(sub.current_views || 0).toLocaleString()}</span>
                  </div>
                </div>
                {sub.tiktok_video_url && (
                  <a
                    href={sub.tiktok_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-xs text-primary hover:underline"
                  >
                    View posted video →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ad Details node — description + thumbnail */}
      <div className="rounded-[28px] p-6 flex gap-5" style={cardStyle}>
        {/* Left: text content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground font-montserrat mb-3">{campaign.title}</h3>

          {campaign.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{campaign.description}</p>
          )}

          {campaign.guidelines && campaign.guidelines.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-foreground mb-2">Guidelines</h4>
              <ul className="space-y-1.5">
                {campaign.guidelines.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-foreground/40 mt-0.5">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing pills — glassy green */}
          <div className="flex items-center gap-2 pt-3 border-t border-border flex-wrap">
            {tiers.length > 0 ? (
              tiers.map((tier, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1 rounded-full" style={greenPillStyle}>
                  {tier.min_views.toLocaleString()}–{tier.max_views ? tier.max_views.toLocaleString() : '∞'} views: ${tier.rate_per_view}/1k
                </span>
              ))
            ) : (
              <>
                {campaign.max_earnings != null && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={greenPillStyle}>
                    Max ${campaign.max_earnings}/creator
                  </span>
                )}
                {campaign.total_budget != null && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full" style={greenPillStyle}>
                    Budget ${campaign.total_budget.toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: thumbnail — full height, 9/14 aspect ratio */}
        <div className="shrink-0 self-stretch" style={{ aspectRatio: '9/14' }}>
          <div
            className="w-full h-full rounded-[28px] overflow-hidden"
            style={{ border: '1px solid hsl(var(--border))' }}
          >
            {campaign.cover_image_url ? (
              <img src={campaign.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{ background: 'linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--border)) 100%)' }}
              >
                <span className="text-2xl font-bold text-muted-foreground/30 font-montserrat">
                  {campaign.brand_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCampaignDetail;

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Eye, Users, Upload } from 'lucide-react';
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
}

const BusinessCampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [campRes, subRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('id', id).maybeSingle(),
        supabase.from('content_submissions').select('id, tiktok_video_url, tiktok_video_id, status, current_views, current_likes, created_at, creator_id').eq('campaign_id', id).order('created_at', { ascending: false }),
      ]);
      if (campRes.data) setCampaign(campRes.data);
      const subs = subRes.data || [];
      setSubmissions(subs);
      setLoading(false);

      // Fetch live TikTok stats
      if (subs.length > 0) {
        try {
          const { data, error } = await supabase.functions.invoke('fetch-tiktok-stats', {
            body: { submission_ids: subs.map(s => s.id) },
          });
          if (!error && data?.results) {
            setSubmissions(prev => prev.map(s => {
              const r = data.results[s.id];
              if (r) {
                return { ...s, current_views: r.views || s.current_views, current_likes: r.likes || s.current_likes };
              }
              return s;
            }));
          }
        } catch (e) {
          console.error('Failed to fetch TikTok stats:', e);
        }
      }
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
        <Button variant="outline" onClick={() => navigate('/business/campaigns')}>Go back</Button>
      </div>
    );
  }

  const statusLabel = campaign.is_active ? 'Active' : 'Ended';
  const totalViews = submissions.reduce((sum, s) => sum + (s.current_views || 0), 0);

  const statusBadge: Record<string, string> = {
    pending_review: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    denied: 'bg-red-500/10 text-red-600 border-red-500/20',
    paid: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <button onClick={() => navigate('/business/campaigns')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </button>

      <div className="flex items-start gap-6 mb-8">
        {/* Thumbnail with upload */}
        <div className="relative group">
          <div className="h-20 w-20 rounded-xl bg-muted shrink-0 overflow-hidden">
            {campaign.cover_image_url ? (
              <img src={campaign.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-2xl font-bold text-muted-foreground/40 font-montserrat">{campaign.brand_name.charAt(0).toUpperCase()}</span>
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            className="hidden"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-foreground font-montserrat">{campaign.title}</h1>
            <Badge variant="outline" className={campaign.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
              {statusLabel}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Created {new Date(campaign.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {[
          { label: 'Submissions', value: submissions.length, icon: Users },
          { label: 'Total Views', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews, icon: Eye },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[28px] p-5"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              border: '1px solid hsl(var(--border))',
              boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Description above guidelines */}
      {campaign.description && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{campaign.description}</p>
        </div>
      )}

      {/* Guidelines */}
      {campaign.guidelines && campaign.guidelines.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Guidelines</h3>
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

      {/* Submissions */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Submissions ({submissions.length})</h3>
        {submissions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">No submissions yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl border border-border overflow-hidden flex flex-col"
                style={{ width: '210px', justifySelf: 'center', background: 'hsl(var(--card))' }}
              >
                {/* TikTok Embed */}
                {sub.tiktok_video_id ? (
                  <div
                    style={{ width: '210px', height: '375px', flexShrink: 0, overflow: 'hidden', background: '#000', display: 'block', lineHeight: 0 }}
                  >
                    <iframe
                      src={`https://www.tiktok.com/embed/v2/${sub.tiktok_video_id}`}
                      style={{
                        width: '325px',
                        height: '580px',
                        border: 'none',
                        transform: 'scale(0.645)',
                        transformOrigin: 'top left',
                        display: 'block',
                      }}
                      allowFullScreen
                      allow="encrypted-media"
                    />
                  </div>
                ) : (
                  <div style={{ height: '375px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'hsl(var(--muted))' }} className="p-4 text-center">
                    <a href={sub.tiktok_video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">
                      {sub.tiktok_video_url}
                    </a>
                  </div>
                )}

                {/* Stats bar — views only */}
                <div className="px-3 py-2.5 flex items-center justify-between border-t border-border" style={{ width: '210px' }}>
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{(sub.current_views || 0).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">views</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusBadge[sub.status] || ''}`}>
                    {sub.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCampaignDetail;

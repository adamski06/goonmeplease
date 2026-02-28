import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, CheckCircle, XCircle, Eye, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import ThumbnailUploadModal from '@/components/business/ThumbnailUploadModal';

interface DealData {
  id: string;
  title: string;
  brand_name: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean | null;
  status: string | null;
  total_budget: number | null;
  rate_per_view: number | null;
  max_earnings: number | null;
  created_at: string;
  guidelines: string[] | null;
}

interface Application {
  id: string;
  creator_id: string;
  status: string;
  message: string | null;
  tiktok_video_url: string | null;
  tiktok_video_id: string | null;
  current_views: number | null;
  created_at: string;
  creator_username?: string;
}

const appStatusBadge: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  accepted: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const BusinessDealDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<DealData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [thumbModalOpen, setThumbModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [dealRes, appRes] = await Promise.all([
        supabase.from('deals').select('*').eq('id', id).maybeSingle(),
        supabase.from('deal_applications')
          .select('id, creator_id, status, message, tiktok_video_url, tiktok_video_id, current_views, created_at')
          .eq('deal_id', id)
          .order('created_at', { ascending: false }),
      ]);
      if (dealRes.data) setDeal(dealRes.data);

      const apps = appRes.data || [];
      if (apps.length > 0) {
        const creatorIds = [...new Set(apps.map(a => a.creator_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', creatorIds);

        const usernameMap: Record<string, string> = {};
        (profiles || []).forEach(p => {
          if (p.username) usernameMap[p.user_id] = p.username;
        });

        setApplications(apps.map(a => ({
          ...a,
          creator_username: usernameMap[a.creator_id] || `User ${a.creator_id.slice(0, 6)}`,
        })));
      } else {
        setApplications([]);
      }

      setLoading(false);
    };
    load();
  }, [id]);

  const updateStatus = async (appId: string, newStatus: 'accepted' | 'rejected') => {
    setUpdating(appId);
    const { error } = await supabase
      .from('deal_applications')
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq('id', appId);

    if (error) {
      toast.error('Failed to update application');
    } else {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      toast.success(newStatus === 'accepted' ? 'Creator accepted!' : 'Application rejected');
    }
    setUpdating(null);
  };

  const handleThumbnailCropSave = async (blob: Blob) => {
    if (!id) return;
    setUploading(true);
    const path = `thumbnails/deal-${id}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('campaign-assets')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (uploadError) {
      toast.error('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('campaign-assets').getPublicUrl(path);
    const ts = Date.now();
    const freshUrl = `${urlData.publicUrl}?t=${ts}`;
    const { error: updateError } = await supabase
      .from('deals')
      .update({ cover_image_url: freshUrl })
      .eq('id', id);
    if (updateError) {
      toast.error(updateError.message);
    } else {
      setDeal(prev => prev ? { ...prev, cover_image_url: freshUrl } : prev);
      toast.success('Thumbnail updated');
      setThumbModalOpen(false);
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

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Deal not found</p>
        <Button variant="outline" onClick={() => navigate('/business/deals')}>Go back</Button>
      </div>
    );
  }

  const pending = applications.filter(a => a.status === 'pending');
  const accepted = applications.filter(a => a.status === 'accepted');
  const totalViews = applications.reduce((sum, a) => sum + (a.current_views || 0), 0);
  // Estimate money spent: sum of (views / 1000 * rate_per_view) per creator, capped at max_earnings
  const moneySpent = accepted.reduce((sum, a) => {
    const earned = ((a.current_views || 0) / 1000) * (deal?.rate_per_view || 0);
    const capped = deal?.max_earnings ? Math.min(earned, deal.max_earnings) : earned;
    return sum + capped;
  }, 0);

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
      <div className="flex items-center gap-4 mb-8">
        <div className="h-14 w-14 rounded-full bg-muted shrink-0 overflow-hidden">
          {deal.cover_image_url ? (
            <img src={deal.cover_image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground/40 font-montserrat">
                {deal.brand_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-xl font-bold text-foreground font-montserrat">{deal.title}</h1>
          <Badge variant="outline" className={deal.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
            {deal.is_active ? 'Active' : 'Ended'}
          </Badge>
        </div>
        <button
          onClick={async () => {
            if (!confirm('Are you sure you want to delete this deal? This cannot be undone.')) return;
            const { error } = await supabase.from('deals').delete().eq('id', deal.id);
            if (error) {
              toast.error('Failed to delete deal');
              return;
            }
            toast.success('Deal deleted');
            navigate('/business');
          }}
          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
          title="Delete deal"
        >
          <Trash2 className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="rounded-[28px] p-5"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
          }}
        >
          <div className="mb-2">
            <span className="text-xs text-muted-foreground">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
          </p>
        </div>
        <div
          className="rounded-[28px] p-5"
          style={{
            background: 'linear-gradient(135deg, hsla(142, 71%, 45%, 0.15) 0%, hsla(142, 71%, 35%, 0.08) 100%)',
            border: '1px solid hsla(142, 71%, 45%, 0.30)',
            boxShadow: 'inset 0 1px 0 hsla(142, 71%, 80%, 0.2), 0 2px 8px hsla(142, 71%, 30%, 0.08)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="mb-2">
            <span className="text-xs" style={{ color: 'hsl(142, 50%, 40%)' }}>Money Spent</span>
          </div>
          <p className="text-2xl font-bold" style={{ color: 'hsl(142, 60%, 30%)' }}>
            ${moneySpent >= 1000 ? `${(moneySpent / 1000).toFixed(1)}k` : moneySpent.toFixed(0)}
          </p>
        </div>
      </div>

      {/* Creator Requests (pending) — half width */}
      <div className="mb-8 max-w-[50%]">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Creator Requests ({pending.length})
        </h3>

        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-4 text-center">
            <p className="text-xs text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(app => (
              <div
                key={app.id}
                className="rounded-[20px] p-4"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground/60 font-montserrat">
                      {(app.creator_username || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">@{app.creator_username}</p>
                    {app.message && (
                      <p className="text-xs text-muted-foreground truncate">{app.message}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(app.id, 'rejected')}
                      disabled={updating === app.id}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'accepted')}
                      disabled={updating === app.id}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In Action Creators (accepted) — half width */}
      <div className="mb-8 max-w-[50%]">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          In Action Creators ({accepted.length})
        </h3>

        {accepted.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-5 py-4 text-center">
            <p className="text-xs text-muted-foreground">No active creators yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accepted.map(app => (
              <div
                key={app.id}
                className="rounded-[20px] p-4 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  border: '1px solid hsl(var(--border))',
                }}
                onClick={() => navigate(`/business/deals/${id}/applications/${app.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground/60 font-montserrat">
                      {(app.creator_username || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">@{app.creator_username}</p>
                    {app.tiktok_video_url && (
                      <p className="text-xs text-primary truncate">View submission →</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{(app.current_views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ad Details node — description + thumbnail side by side */}
      <div
        className="rounded-[28px] p-6 flex gap-5"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
          border: '1px solid hsl(var(--border))',
          boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
        }}
      >
        {/* Left: text content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground font-montserrat mb-3">{deal.title}</h3>

          {deal.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{deal.description}</p>
          )}

          {deal.guidelines && deal.guidelines.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-foreground mb-2">Guidelines</h4>
              <ul className="space-y-1.5">
                {deal.guidelines.map((g, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-foreground/40 mt-0.5">•</span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing pills — glassy green */}
          <div className="flex items-center gap-2 pt-3 flex-wrap">
            {deal.rate_per_view != null && (
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, hsla(142, 71%, 45%, 0.12) 0%, hsla(142, 71%, 45%, 0.06) 100%)',
                  border: '1px solid hsla(142, 71%, 45%, 0.25)',
                  color: 'hsl(142, 71%, 35%)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                ${deal.rate_per_view}/1k views
              </span>
            )}
            {deal.max_earnings != null && (
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, hsla(142, 71%, 45%, 0.12) 0%, hsla(142, 71%, 45%, 0.06) 100%)',
                  border: '1px solid hsla(142, 71%, 45%, 0.25)',
                  color: 'hsl(142, 71%, 35%)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Max ${deal.max_earnings}/creator
              </span>
            )}
            {deal.total_budget != null && (
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, hsla(142, 71%, 45%, 0.12) 0%, hsla(142, 71%, 45%, 0.06) 100%)',
                  border: '1px solid hsla(142, 71%, 45%, 0.25)',
                  color: 'hsl(142, 71%, 35%)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Budget ${deal.total_budget.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Right: thumbnail — clickable to open upload/crop modal */}
        <div className="shrink-0 w-[182px]">
          <button
            onClick={() => setThumbModalOpen(true)}
            className="w-full aspect-[9/14] rounded-[28px] overflow-hidden relative group cursor-pointer"
            style={{ border: '1px solid hsl(var(--border))' }}
          >
            {deal.cover_image_url ? (
              <img src={deal.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex flex-col items-center justify-center gap-2"
                style={{ background: 'linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--border)) 100%)' }}
              >
                <ImagePlus className="h-6 w-6 text-muted-foreground/40" />
                <span className="text-xs text-muted-foreground/50 font-medium">Add thumbnail</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[28px]">
              <ImagePlus className="h-5 w-5 text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* Thumbnail upload/crop modal */}
      <ThumbnailUploadModal
        open={thumbModalOpen}
        onClose={() => setThumbModalOpen(false)}
        onSave={handleThumbnailCropSave}
        saving={uploading}
      />
    </div>
  );
};

export default BusinessDealDetail;

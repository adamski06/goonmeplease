import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

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
        <div className="h-16 w-16 rounded-xl bg-muted shrink-0 overflow-hidden">
          {deal.cover_image_url ? (
            <img src={deal.cover_image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-xl font-bold text-muted-foreground/40 font-montserrat">
                {deal.brand_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground font-montserrat">{deal.title}</h1>
            <Badge variant="outline" className={deal.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
              {deal.is_active ? 'Active' : 'Ended'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Views stat */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className="rounded-[28px] p-5"
          style={{
            background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
            border: '1px solid hsl(var(--border))',
            boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Views</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}k` : totalViews}
          </p>
        </div>
      </div>

      {/* Creator Requests (pending) */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Creator Requests ({pending.length})
        </h3>

        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-5 text-center">
            <p className="text-xs text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(app => (
              <div
                key={app.id}
                className="flex items-center gap-4 rounded-[20px] p-4"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-muted-foreground/60 font-montserrat">
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
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{(app.current_views || 0).toLocaleString()}</span>
                  </div>
                </div>
                {app.tiktok_video_url && (
                  <a
                    href={app.tiktok_video_url}
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

          {/* Pricing info */}
          <div className="flex items-center gap-3 pt-3 border-t border-border flex-wrap">
            {deal.rate_per_view != null && (
              <span className="text-xs text-muted-foreground">${deal.rate_per_view}/1k views</span>
            )}
            {deal.max_earnings != null && (
              <span className="text-xs text-muted-foreground">Max ${deal.max_earnings}/creator</span>
            )}
            {deal.total_budget != null && (
              <span className="text-xs text-muted-foreground">Budget ${deal.total_budget.toLocaleString()}</span>
            )}
          </div>
        </div>

        {/* Right: thumbnail (same as homepage card: 9/14 aspect, 48px rounded) */}
        <div className="w-[120px] shrink-0">
          <div
            className="w-full aspect-[9/14] rounded-[28px] overflow-hidden"
            style={{ border: '1px solid hsl(var(--border))' }}
          >
            {deal.cover_image_url ? (
              <img src={deal.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div
                className="h-full w-full flex items-center justify-center"
                style={{ background: 'linear-gradient(180deg, hsl(var(--muted)) 0%, hsl(var(--border)) 100%)' }}
              >
                <span className="text-2xl font-bold text-muted-foreground/30 font-montserrat">
                  {deal.brand_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDealDetail;

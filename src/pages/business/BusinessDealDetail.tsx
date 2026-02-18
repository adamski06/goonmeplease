import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
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
      setApplications(appRes.data || []);
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
  const rejected = applications.filter(a => a.status === 'rejected');

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back */}
      <button
        onClick={() => navigate('/business/deals')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Deals
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
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-foreground font-montserrat">{deal.title}</h1>
            <Badge variant="outline" className={deal.is_active ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-muted text-muted-foreground'}>
              {deal.is_active ? 'Active' : 'Ended'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Created {new Date(deal.created_at).toLocaleDateString()}</p>
          {deal.rate_per_view && (
            <p className="text-xs text-muted-foreground mt-1">${deal.rate_per_view}/1k views · Max ${deal.max_earnings}/creator · Budget ${deal.total_budget?.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Pending', value: pending.length, icon: Clock, color: 'text-amber-600' },
          { label: 'Accepted', value: accepted.length, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Rejected', value: rejected.length, icon: XCircle, color: 'text-red-500' },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-[28px] p-5"
            style={{
              background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              border: '1px solid hsl(var(--border))',
              boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {deal.description && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{deal.description}</p>
        </div>
      )}

      {/* Guidelines */}
      {deal.guidelines && deal.guidelines.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-foreground mb-3">Guidelines</h3>
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

      {/* Applications */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Creator Requests ({applications.length})
        </h3>

        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <Users className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No creator requests yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Creators will appear here once they apply</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => (
              <div
                key={app.id}
                className="flex items-center gap-4 rounded-[20px] p-4"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                {/* Avatar placeholder */}
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-muted-foreground/50" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-foreground truncate">Creator #{app.creator_id.slice(0, 8)}</p>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${appStatusBadge[app.status] || ''}`}>
                      {app.status}
                    </Badge>
                  </div>
                  {app.message && (
                    <p className="text-xs text-muted-foreground truncate">{app.message}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Video link if submitted */}
                {app.tiktok_video_url && (
                  <a
                    href={app.tiktok_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline shrink-0"
                  >
                    View video
                  </a>
                )}

                {/* Accept / Reject buttons (only for pending) */}
                {app.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(app.id, 'rejected')}
                      disabled={updating === app.id}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDealDetail;

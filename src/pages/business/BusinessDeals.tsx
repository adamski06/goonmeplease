import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DealItem {
  id: string;
  title: string;
  brand_name: string;
  cover_image_url: string | null;
  is_active: boolean | null;
  status: string | null;
  total_budget: number | null;
  created_at: string;
  description: string | null;
}

interface DealStats {
  deal_id: string;
  applications: number;
  accepted: number;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  active: { label: 'Active', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  paused: { label: 'Paused', icon: Clock, className: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  ended: { label: 'Ended', icon: XCircle, className: 'bg-muted text-muted-foreground border-border' },
};

const BusinessDeals: React.FC = () => {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [stats, setStats] = useState<Record<string, DealStats>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rows } = await supabase
        .from('deals')
        .select('id, title, brand_name, cover_image_url, is_active, status, total_budget, created_at, description')
        .eq('business_id', user.id)
        .order('created_at', { ascending: false });

      setDeals(rows || []);

      if (rows && rows.length > 0) {
        const ids = rows.map(r => r.id);
        const { data: apps } = await supabase
          .from('deal_applications')
          .select('deal_id, status')
          .in('deal_id', ids);

        if (apps) {
          const grouped: Record<string, DealStats> = {};
          for (const a of apps) {
            if (!grouped[a.deal_id]) {
              grouped[a.deal_id] = { deal_id: a.deal_id, applications: 0, accepted: 0 };
            }
            grouped[a.deal_id].applications++;
            if (a.status === 'accepted') grouped[a.deal_id].accepted++;
          }
          setStats(grouped);
        }
      }

      setLoading(false);
    };
    load();
  }, []);

  const handleDelete = async (e: React.MouseEvent, dealId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this deal? This cannot be undone.')) return;
    const { error } = await supabase.from('deals').delete().eq('id', dealId);
    if (error) {
      toast.error('Failed to delete deal');
      return;
    }
    setDeals(prev => prev.filter(d => d.id !== dealId));
    toast.success('Deal deleted');
  };

  const getStatus = (d: DealItem) => {
    if (d.status && statusConfig[d.status]) return d.status;
    return d.is_active ? 'active' : 'ended';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-montserrat">Deals</h1>
          <p className="text-sm text-muted-foreground mt-1">{deals.length} deal{deals.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          onClick={() => navigate('/business/deals/new')}
          className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4" />
          New Deal
        </Button>
      </div>

      {deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Plus className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">No deals yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Create a deal and let creators request to collaborate with your brand.
          </p>
          <Button
            onClick={() => navigate('/business/deals/new')}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Deal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((d) => {
            const status = getStatus(d);
            const cfg = statusConfig[status] || statusConfig.active;
            const StatusIcon = cfg.icon;
            const s = stats[d.id];

            return (
              <button
                key={d.id}
                onClick={() => navigate(`/business/deals/${d.id}`)}
                className="w-full flex items-center gap-4 rounded-[28px] p-4 transition-all text-left active:scale-[0.99]"
                style={{
                  background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
                  border: '1px solid hsl(var(--border))',
                  boxShadow: 'inset 0 1px 0 hsl(var(--background) / 0.6), 0 2px 8px hsl(var(--foreground) / 0.04)',
                }}
              >
                {/* Thumbnail */}
                <div className="h-[72px] w-[46px] rounded-[14px] bg-muted shrink-0 overflow-hidden shadow-sm border border-border">
                  {d.cover_image_url ? (
                    <img src={d.cover_image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-muted to-muted/80">
                      <span className="text-xs font-bold text-muted-foreground/40 font-montserrat">
                        {d.brand_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold text-foreground truncate">{d.title}</h3>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 shrink-0 ${cfg.className}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{d.description || 'No description'}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{s?.applications || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Requests</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">{s?.accepted || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Accepted</p>
                  </div>
                  {d.total_budget && (
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">${d.total_budget.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Budget</p>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, d.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
                    title="Delete deal"
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                  </button>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessDeals;

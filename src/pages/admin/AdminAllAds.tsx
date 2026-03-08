import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type AdItem = {
  id: string;
  type: 'Spread' | 'Deal' | 'Reward';
  table: 'campaigns' | 'deals' | 'reward_ads';
  title: string;
  brand_name: string;
  status: string;
  is_active: boolean;
  budget: number | null;
  created_at: string;
};

const money = (n: number | null) => (n != null ? `$${Number(n).toLocaleString()}` : '–');

const statusVariant = (s: string) => {
  if (s === 'active') return 'default' as const;
  if (s === 'pending') return 'outline' as const;
  if (s === 'paused') return 'secondary' as const;
  return 'secondary' as const;
};

const AdminAllAds = () => {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'paused'>('all');
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const [campRes, dealRes, rewardRes] = await Promise.all([
      supabase.from('campaigns').select('id, title, brand_name, status, is_active, total_budget, created_at').order('created_at', { ascending: false }),
      supabase.from('deals').select('id, title, brand_name, status, is_active, total_budget, created_at').order('created_at', { ascending: false }),
      supabase.from('reward_ads').select('id, title, brand_name, status, is_active, created_at').order('created_at', { ascending: false }),
    ]);

    const all: AdItem[] = [
      ...(campRes.data || []).map(c => ({ id: c.id, type: 'Spread' as const, table: 'campaigns' as const, title: c.title, brand_name: c.brand_name, status: c.status || 'active', is_active: c.is_active ?? true, budget: c.total_budget, created_at: c.created_at })),
      ...(dealRes.data || []).map(d => ({ id: d.id, type: 'Deal' as const, table: 'deals' as const, title: d.title, brand_name: d.brand_name, status: d.status || 'active', is_active: d.is_active ?? true, budget: d.total_budget, created_at: d.created_at })),
      ...(rewardRes.data || []).map(r => ({ id: r.id, type: 'Reward' as const, table: 'reward_ads' as const, title: r.title, brand_name: r.brand_name, status: r.status || 'active', is_active: r.is_active ?? true, budget: null, created_at: r.created_at })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setAds(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleStatus = async (ad: AdItem) => {
    setToggling(ad.id);
    const isActivating = ad.status !== 'active';
    const newStatus = isActivating ? 'active' : 'pending';

    await supabase.from(ad.table).update({ status: newStatus, is_active: isActivating }).eq('id', ad.id);

    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, status: newStatus, is_active: isActivating } : a));
    toast({ title: isActivating ? 'Ad set live' : 'Ad paused' });
    setToggling(null);
  };

  const filtered = filter === 'all' ? ads : ads.filter(a => {
    if (filter === 'active') return a.status === 'active';
    if (filter === 'pending') return a.status === 'pending';
    if (filter === 'paused') return a.status !== 'active' && a.status !== 'pending';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat font-semibold text-lg">All Ads</h1>
        <Badge variant="secondary">{ads.length} total</Badge>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({ads.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({ads.filter(a => a.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({ads.filter(a => a.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="paused">Other</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No ads match this filter</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Toggle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ad) => (
              <TableRow key={`${ad.table}-${ad.id}`}>
                <TableCell className="font-medium max-w-[200px] truncate">{ad.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground truncate max-w-[120px]">{ad.brand_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ad.type}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(ad.status)}>{ad.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{money(ad.budget)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{format(new Date(ad.created_at), 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={toggling === ad.id}
                    onClick={() => toggleStatus(ad)}
                    className={ad.status === 'active' ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600'}
                  >
                    {ad.status === 'active' ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {ad.status === 'active' ? 'Pause' : 'Set Live'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminAllAds;

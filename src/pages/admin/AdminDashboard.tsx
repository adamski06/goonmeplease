import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Megaphone, Handshake, Gift, Video } from 'lucide-react';
import { format } from 'date-fns';

const statusColor = (s: string | null) => {
  if (!s) return 'secondary';
  if (s === 'active') return 'default';
  if (s === 'paused' || s === 'ended') return 'secondary';
  if (s === 'approved' || s === 'paid') return 'default';
  if (s === 'denied') return 'destructive';
  return 'outline';
};

const fmt = (d: string) => format(new Date(d), 'MMM d, yyyy');
const money = (n: number | null) => (n != null ? `$${Number(n).toLocaleString()}` : '–');

const AdminDashboard = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [dealApps, setDealApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [biz, camp, dl, rw, sub, da] = await Promise.all([
        supabase.from('business_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('deals').select('*').order('created_at', { ascending: false }),
        supabase.from('reward_ads').select('*').order('created_at', { ascending: false }),
        supabase.from('content_submissions').select('*').order('created_at', { ascending: false }),
        supabase.from('deal_applications').select('*').order('created_at', { ascending: false }),
      ]);
      setBusinesses(biz.data || []);
      setCampaigns(camp.data || []);
      setDeals(dl.data || []);
      setRewards(rw.data || []);
      setSubmissions(sub.data || []);
      setDealApps(da.data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const totalBudget = campaigns.reduce((s, c) => s + (Number(c.total_budget) || 0), 0)
    + deals.reduce((s, d) => s + (Number(d.total_budget) || 0), 0);
  const totalSpent = campaigns.reduce((s, c) => s + (Number(c.budget_spent) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Businesses', value: businesses.length, icon: Building2 },
          { label: 'Spread Ads', value: campaigns.length, icon: Megaphone },
          { label: 'Deals', value: deals.length, icon: Handshake },
          { label: 'Rewards', value: rewards.length, icon: Gift },
          { label: 'Submissions', value: submissions.length + dealApps.length, icon: Video },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-2xl font-semibold font-montserrat">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Total budget: {money(totalBudget)} · Total spent: {money(totalSpent)}
      </div>

      <Tabs defaultValue="businesses">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="spreads">Spread Ads</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="deal-apps">Deal Apps</TabsTrigger>
        </TabsList>

        {/* Businesses */}
        <TabsContent value="businesses">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Company</TableHead><TableHead>Industry</TableHead><TableHead>Website</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {businesses.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.company_name}</TableCell>
                  <TableCell>{b.industry || '–'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{b.website || '–'}</TableCell>
                  <TableCell>{fmt(b.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Spread Ads */}
        <TabsContent value="spreads">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Title</TableHead><TableHead>Brand</TableHead><TableHead>Status</TableHead><TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                  <TableCell>{c.brand_name}</TableCell>
                  <TableCell><Badge variant={statusColor(c.status)}>{c.status || 'active'}</Badge></TableCell>
                  <TableCell>{money(c.total_budget)}</TableCell>
                  <TableCell>{money(c.budget_spent)}</TableCell>
                  <TableCell>{fmt(c.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Deals */}
        <TabsContent value="deals">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Title</TableHead><TableHead>Brand</TableHead><TableHead>Status</TableHead><TableHead>Budget</TableHead><TableHead>Rate/View</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {deals.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{d.title}</TableCell>
                  <TableCell>{d.brand_name}</TableCell>
                  <TableCell><Badge variant={statusColor(d.status)}>{d.status || 'active'}</Badge></TableCell>
                  <TableCell>{money(d.total_budget)}</TableCell>
                  <TableCell>{d.rate_per_view ? `$${d.rate_per_view}` : '–'}</TableCell>
                  <TableCell>{fmt(d.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Title</TableHead><TableHead>Brand</TableHead><TableHead>Status</TableHead><TableHead>Views Req.</TableHead><TableHead>Reward</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {rewards.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                  <TableCell>{r.brand_name}</TableCell>
                  <TableCell><Badge variant={statusColor(r.status)}>{r.status || 'active'}</Badge></TableCell>
                  <TableCell>{r.views_required?.toLocaleString()}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{r.reward_description}</TableCell>
                  <TableCell>{fmt(r.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Content Submissions (Spread) */}
        <TabsContent value="submissions">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Campaign</TableHead><TableHead>Status</TableHead><TableHead>Views</TableHead><TableHead>Likes</TableHead><TableHead>Video</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium truncate max-w-[160px]">{s.campaign_id?.slice(0, 8)}</TableCell>
                  <TableCell><Badge variant={statusColor(s.status)}>{s.status}</Badge></TableCell>
                  <TableCell>{s.current_views?.toLocaleString() || 0}</TableCell>
                  <TableCell>{s.current_likes?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {s.tiktok_video_url ? (
                      <a href={s.tiktok_video_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View</a>
                    ) : '–'}
                  </TableCell>
                  <TableCell>{fmt(s.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Deal Applications */}
        <TabsContent value="deal-apps">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Deal</TableHead><TableHead>Status</TableHead><TableHead>Views</TableHead><TableHead>Likes</TableHead><TableHead>Video</TableHead><TableHead>Created</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {dealApps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium truncate max-w-[160px]">{a.deal_id?.slice(0, 8)}</TableCell>
                  <TableCell><Badge variant={statusColor(a.status)}>{a.status}</Badge></TableCell>
                  <TableCell>{a.current_views?.toLocaleString() || 0}</TableCell>
                  <TableCell>{a.current_likes?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {a.tiktok_video_url ? (
                      <a href={a.tiktok_video_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View</a>
                    ) : '–'}
                  </TableCell>
                  <TableCell>{fmt(a.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;

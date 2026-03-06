import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Megaphone, Handshake, Gift } from 'lucide-react';
import { format } from 'date-fns';

const statusVariant = (s: string | null) => {
  if (!s) return 'secondary' as const;
  if (s === 'active' || s === 'approved' || s === 'paid') return 'default' as const;
  if (s === 'denied') return 'destructive' as const;
  return 'secondary' as const;
};

const fmt = (d: string) => format(new Date(d), 'MMM d, yyyy');
const money = (n: number | null) => (n != null ? `$${Number(n).toLocaleString()}` : '–');

const AdminBusinessDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down state for viewing submissions
  const [selectedAd, setSelectedAd] = useState<{ type: 'spread' | 'deal'; id: string; title: string } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [bp, camp, dl, rw] = await Promise.all([
        supabase.from('business_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('campaigns').select('*').eq('business_id', userId).order('created_at', { ascending: false }),
        supabase.from('deals').select('*').eq('business_id', userId).order('created_at', { ascending: false }),
        supabase.from('reward_ads').select('*').eq('business_id', userId).order('created_at', { ascending: false }),
      ]);
      setProfile(bp.data);
      setCampaigns(camp.data || []);
      setDeals(dl.data || []);
      setRewards(rw.data || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  const openSubmissions = async (type: 'spread' | 'deal', id: string, title: string) => {
    setSelectedAd({ type, id, title });
    setSubsLoading(true);
    if (type === 'spread') {
      const { data } = await supabase.from('content_submissions').select('*').eq('campaign_id', id).order('created_at', { ascending: false });
      setSubmissions(data || []);
    } else {
      const { data } = await supabase.from('deal_applications').select('*').eq('deal_id', id).order('created_at', { ascending: false });
      setSubmissions(data || []);
    }
    setSubsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Submissions sub-view
  if (selectedAd) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedAd(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to {profile?.company_name}
        </Button>
        <h2 className="font-montserrat font-semibold text-lg">
          {selectedAd.type === 'spread' ? 'Submissions' : 'Applications'} — {selectedAd.title}
        </h2>

        {subsLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">No {selectedAd.type === 'spread' ? 'submissions' : 'applications'} yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell><Badge variant={statusVariant(s.status)}>{s.status}</Badge></TableCell>
                  <TableCell>{(s.current_views || 0).toLocaleString()}</TableCell>
                  <TableCell>{(s.current_likes || 0).toLocaleString()}</TableCell>
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
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> All Businesses
      </Button>

      {/* Business header */}
      <div className="flex items-center gap-3">
        {profile?.logo_url ? (
          <img src={profile.logo_url} alt="" className="h-12 w-12 rounded-full object-cover bg-muted" />
        ) : (
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div>
          <h1 className="font-montserrat font-semibold text-xl">{profile?.company_name || 'Unknown'}</h1>
          <p className="text-sm text-muted-foreground">
            {profile?.industry || '–'} · {profile?.website || '–'}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Spread Ads', value: campaigns.length, icon: Megaphone },
          { label: 'Deals', value: deals.length, icon: Handshake },
          { label: 'Rewards', value: rewards.length, icon: Gift },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-lg font-semibold font-montserrat">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="spreads">
        <TabsList>
          <TabsTrigger value="spreads">Spread Ads</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="spreads">
          {campaigns.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No spread ads</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Created</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-accent/50" onClick={() => openSubmissions('spread', c.id, c.title)}>
                    <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                    <TableCell><Badge variant={statusVariant(c.status)}>{c.status || 'active'}</Badge></TableCell>
                    <TableCell>{money(c.total_budget)}</TableCell>
                    <TableCell>{money(c.budget_spent)}</TableCell>
                    <TableCell>{fmt(c.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="deals">
          {deals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No deals</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Budget</TableHead><TableHead>Rate/View</TableHead><TableHead>Created</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {deals.map((d) => (
                  <TableRow key={d.id} className="cursor-pointer hover:bg-accent/50" onClick={() => openSubmissions('deal', d.id, d.title)}>
                    <TableCell className="font-medium max-w-[200px] truncate">{d.title}</TableCell>
                    <TableCell><Badge variant={statusVariant(d.status)}>{d.status || 'active'}</Badge></TableCell>
                    <TableCell>{money(d.total_budget)}</TableCell>
                    <TableCell>{d.rate_per_view ? `$${d.rate_per_view}` : '–'}</TableCell>
                    <TableCell>{fmt(d.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="rewards">
          {rewards.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No rewards</p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Views Req.</TableHead><TableHead>Reward</TableHead><TableHead>Created</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rewards.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                    <TableCell><Badge variant={statusVariant(r.status)}>{r.status || 'active'}</Badge></TableCell>
                    <TableCell>{r.views_required?.toLocaleString()}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{r.reward_description}</TableCell>
                    <TableCell>{fmt(r.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBusinessDetail;

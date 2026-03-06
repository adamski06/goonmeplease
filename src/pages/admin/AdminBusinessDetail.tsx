import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Megaphone, Handshake, Gift, Check, X, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusVariant = (s: string | null) => {
  if (!s) return 'secondary' as const;
  if (s === 'active' || s === 'approved' || s === 'paid') return 'default' as const;
  if (s === 'denied') return 'destructive' as const;
  if (s === 'pending') return 'outline' as const;
  return 'secondary' as const;
};

const fmt = (d: string) => format(new Date(d), 'MMM d, yyyy');
const money = (n: number | null) => (n != null ? `$${Number(n).toLocaleString()}` : '–');

const AdminBusinessDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drill-down: ad submissions list
  const [selectedAd, setSelectedAd] = useState<{ type: 'spread' | 'deal'; id: string; title: string; ad: any } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // Drill-down: single submission review
  const [reviewItem, setReviewItem] = useState<any | null>(null);
  const [reviewType, setReviewType] = useState<'spread' | 'deal'>('spread');
  const [reviewAd, setReviewAd] = useState<any>(null);
  const [acting, setActing] = useState(false);
  const [togglingAd, setTogglingAd] = useState<string | null>(null);

  const toggleAdStatus = async (type: 'campaign' | 'deal' | 'reward', id: string, currentStatus: string) => {
    setTogglingAd(id);
    const isActivating = currentStatus !== 'active';
    const newStatus = isActivating ? 'active' : 'pending';
    const newIsActive = isActivating;

    const table = type === 'campaign' ? 'campaigns' : type === 'deal' ? 'deals' : 'reward_ads';
    await supabase.from(table).update({ status: newStatus, is_active: newIsActive }).eq('id', id);

    // Refresh local state
    if (type === 'campaign') setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, is_active: newIsActive } : c));
    if (type === 'deal') setDeals(prev => prev.map(d => d.id === id ? { ...d, status: newStatus, is_active: newIsActive } : d));
    if (type === 'reward') setRewards(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, is_active: newIsActive } : r));

    toast({ title: isActivating ? 'Ad set live' : 'Ad paused' });
    setTogglingAd(null);
  };

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

  const openSubmissions = async (type: 'spread' | 'deal', id: string, title: string, ad: any) => {
    setSelectedAd({ type, id, title, ad });
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

  const openReview = (item: any, type: 'spread' | 'deal', ad: any) => {
    setReviewItem(item);
    setReviewType(type);
    setReviewAd(ad);
  };

  const handleAction = async (action: 'approve' | 'deny') => {
    if (!reviewItem) return;
    setActing(true);

    const now = new Date();
    const payoutDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (reviewType === 'spread') {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'denied',
        reviewed_at: now.toISOString(),
      };
      if (action === 'approve') {
        updateData.payout_available_at = payoutDate.toISOString();
      }
      await supabase.from('content_submissions').update(updateData).eq('id', reviewItem.id);
    } else {
      const newStatus = action === 'approve' ? 'accepted' : 'denied';
      const updateData: any = {
        status: newStatus,
        reviewed_at: now.toISOString(),
      };
      if (action === 'approve') {
        updateData.payout_available_at = payoutDate.toISOString();
      }
      await supabase.from('deal_applications').update(updateData).eq('id', reviewItem.id);
    }

    toast({ title: action === 'approve' ? 'Submission approved' : 'Submission denied' });

    // Refresh submissions list
    setReviewItem(null);
    if (selectedAd) {
      await openSubmissions(selectedAd.type, selectedAd.id, selectedAd.title, selectedAd.ad);
    }
    setActing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ============ REVIEW VIEW (side-by-side) ============
  if (reviewItem && reviewAd) {
    const guidelines = reviewAd.guidelines || [];
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setReviewItem(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to submissions
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Ad requirements */}
          <div className="space-y-4">
            <h2 className="font-montserrat font-semibold text-lg">Ad Requirements</h2>
            <Card className="border-border">
              <CardContent className="p-5 space-y-4">
                {reviewAd.cover_image_url && (
                  <img src={reviewAd.cover_image_url} alt="" className="w-full h-40 object-cover rounded-[4px]" />
                )}
                <div>
                  <p className="font-semibold">{reviewAd.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{reviewAd.brand_name}</p>
                </div>
                {reviewAd.description && (
                  <p className="text-sm">{reviewAd.description}</p>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {reviewAd.category && (
                    <div><span className="text-muted-foreground">Category:</span> {reviewAd.category}</div>
                  )}
                  {reviewAd.video_length && (
                    <div><span className="text-muted-foreground">Video Length:</span> {reviewAd.video_length}</div>
                  )}
                  {reviewAd.product_visibility && (
                    <div><span className="text-muted-foreground">Product Visibility:</span> {reviewAd.product_visibility}</div>
                  )}
                  {reviewAd.total_budget && (
                    <div><span className="text-muted-foreground">Budget:</span> {money(reviewAd.total_budget)}</div>
                  )}
                </div>
                {guidelines.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Guidelines</p>
                    <ul className="space-y-1">
                      {guidelines.map((g: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-primary shrink-0">•</span> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Submission / TikTok embed */}
          <div className="space-y-4">
            <h2 className="font-montserrat font-semibold text-lg">Submission</h2>
            <Card className="border-border">
              <CardContent className="p-5 space-y-4">
                <Badge variant={statusVariant(reviewItem.status)}>{reviewItem.status}</Badge>

                {reviewItem.tiktok_video_url ? (
                  <div className="rounded-[4px] overflow-hidden bg-black aspect-[9/16] max-h-[500px]">
                    <iframe
                      src={`https://www.tiktok.com/embed/v2/${reviewItem.tiktok_video_id || ''}`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="encrypted-media"
                    />
                  </div>
                ) : (
                  <div className="bg-muted rounded-[4px] aspect-[9/16] max-h-[500px] flex items-center justify-center text-muted-foreground text-sm">
                    No video submitted
                  </div>
                )}

                {reviewItem.tiktok_video_url && (
                  <a href={reviewItem.tiktok_video_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline block">
                    Open on TikTok ↗
                  </a>
                )}

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-semibold">{(reviewItem.current_views || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{(reviewItem.current_likes || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{(reviewItem.current_shares || 0).toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">Shares</p>
                  </div>
                </div>

                {reviewItem.message && (
                  <div>
                    <p className="text-sm font-medium">Creator message</p>
                    <p className="text-sm text-muted-foreground">{reviewItem.message}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">Submitted {fmt(reviewItem.created_at)}</p>

                {/* Action buttons — only for pending items */}
                {(reviewItem.status === 'pending_review' || reviewItem.status === 'pending') && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleAction('approve')}
                      disabled={acting}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleAction('deny')}
                      disabled={acting}
                    >
                      <X className="h-4 w-4 mr-1" /> Deny
                    </Button>
                  </div>
                )}

                {reviewItem.payout_available_at && (
                  <p className="text-xs text-muted-foreground">
                    Payout available: {fmt(reviewItem.payout_available_at)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ============ SUBMISSIONS LIST ============
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
                <TableRow
                  key={s.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => openReview(s, selectedAd.type, selectedAd.ad)}
                >
                  <TableCell><Badge variant={statusVariant(s.status)}>{s.status}</Badge></TableCell>
                  <TableCell>{(s.current_views || 0).toLocaleString()}</TableCell>
                  <TableCell>{(s.current_likes || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    {s.tiktok_video_url ? (
                      <span className="text-primary text-xs">Has video</span>
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

  // ============ BUSINESS DETAIL (ads tabs) ============
  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> All Businesses
      </Button>

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
                <TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Created</TableHead><TableHead>Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-accent/50" onClick={() => openSubmissions('spread', c.id, c.title, c)}>
                    <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
                    <TableCell><Badge variant={statusVariant(c.status)}>{c.status || 'active'}</Badge></TableCell>
                    <TableCell>{money(c.total_budget)}</TableCell>
                    <TableCell>{money(c.budget_spent)}</TableCell>
                    <TableCell>{fmt(c.created_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={c.status === 'active' ? 'outline' : 'default'}
                        disabled={togglingAd === c.id}
                        onClick={(e) => { e.stopPropagation(); toggleAdStatus('campaign', c.id, c.status || 'pending'); }}
                      >
                        {c.status === 'active' ? <><Pause className="h-3 w-3 mr-1" /> Pause</> : <><Play className="h-3 w-3 mr-1" /> Set Live</>}
                      </Button>
                    </TableCell>
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
                  <TableRow key={d.id} className="cursor-pointer hover:bg-accent/50" onClick={() => openSubmissions('deal', d.id, d.title, d)}>
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

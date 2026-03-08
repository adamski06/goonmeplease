import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, ArrowLeft, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type ReviewItem = {
  id: string;
  type: 'spread' | 'deal';
  status: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string | null;
  ad_title: string;
  brand_name: string;
  tiktok_video_url: string | null;
  tiktok_video_id: string | null;
  current_views: number;
  current_likes: number;
  current_shares: number;
  message: string | null;
  created_at: string;
  ad: any;
  raw: any;
};

const fmt = (d: string) => format(new Date(d), 'MMM d, yyyy');
const money = (n: number | null) => (n != null ? `$${Number(n).toLocaleString()}` : '–');

const AdminReviewQueue = () => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [acting, setActing] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const [subsRes, appsRes] = await Promise.all([
      supabase
        .from('content_submissions')
        .select('*, campaigns(title, brand_name, description, cover_image_url, guidelines, category, video_length, product_visibility, total_budget)')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false }),
      supabase
        .from('deal_applications')
        .select('*, deals(title, brand_name, description, cover_image_url, guidelines, category, video_length, product_visibility, total_budget)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    const allCreatorIds = [
      ...((subsRes.data || []).map(s => s.creator_id)),
      ...((appsRes.data || []).map(a => a.creator_id)),
    ];
    const uniqueIds = [...new Set(allCreatorIds)];

    let profilesMap: Record<string, any> = {};
    if (uniqueIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, username')
        .in('user_id', uniqueIds);
      (profiles || []).forEach(p => { profilesMap[p.user_id] = p; });
    }

    const spreadItems: ReviewItem[] = (subsRes.data || []).map(s => ({
      id: s.id,
      type: 'spread' as const,
      status: s.status,
      creator_id: s.creator_id,
      creator_name: profilesMap[s.creator_id]?.full_name || profilesMap[s.creator_id]?.username || 'Unknown',
      creator_avatar: profilesMap[s.creator_id]?.avatar_url || null,
      ad_title: (s.campaigns as any)?.title || '–',
      brand_name: (s.campaigns as any)?.brand_name || '–',
      tiktok_video_url: s.tiktok_video_url,
      tiktok_video_id: s.tiktok_video_id,
      current_views: s.current_views || 0,
      current_likes: s.current_likes || 0,
      current_shares: s.current_shares || 0,
      message: null,
      created_at: s.created_at,
      ad: s.campaigns,
      raw: s,
    }));

    const dealItems: ReviewItem[] = (appsRes.data || []).map(a => ({
      id: a.id,
      type: 'deal' as const,
      status: a.status,
      creator_id: a.creator_id,
      creator_name: profilesMap[a.creator_id]?.full_name || profilesMap[a.creator_id]?.username || 'Unknown',
      creator_avatar: profilesMap[a.creator_id]?.avatar_url || null,
      ad_title: (a.deals as any)?.title || '–',
      brand_name: (a.deals as any)?.brand_name || '–',
      tiktok_video_url: a.tiktok_video_url,
      tiktok_video_id: a.tiktok_video_id,
      current_views: a.current_views || 0,
      current_likes: a.current_likes || 0,
      current_shares: 0,
      message: a.message,
      created_at: a.created_at,
      ad: a.deals,
      raw: a,
    }));

    const all = [...spreadItems, ...dealItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setItems(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (item: ReviewItem, action: 'approve' | 'deny') => {
    setActing(true);
    const now = new Date();
    const payoutDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    if (item.type === 'spread') {
      const updateData: any = {
        status: action === 'approve' ? 'approved' : 'denied',
        reviewed_at: now.toISOString(),
      };
      if (action === 'approve') updateData.payout_available_at = payoutDate.toISOString();
      await supabase.from('content_submissions').update(updateData).eq('id', item.id);
    } else {
      const updateData: any = {
        status: action === 'approve' ? 'accepted' : 'denied',
        reviewed_at: now.toISOString(),
      };
      if (action === 'approve') updateData.payout_available_at = payoutDate.toISOString();
      await supabase.from('deal_applications').update(updateData).eq('id', item.id);
    }

    toast({ title: action === 'approve' ? 'Approved' : 'Denied' });
    setReviewItem(null);
    setActing(false);
    await load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ============ REVIEW VIEW ============
  if (reviewItem) {
    const ad = reviewItem.ad || {};
    const guidelines = ad.guidelines || [];
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setReviewItem(null)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to queue
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Ad requirements */}
          <div className="space-y-4">
            <h2 className="font-montserrat font-semibold text-lg">Ad Requirements</h2>
            <Card className="border-border">
              <CardContent className="p-5 space-y-4">
                {ad.cover_image_url && (
                  <img src={ad.cover_image_url} alt="" className="w-full h-40 object-cover rounded-[4px]" />
                )}
                <div>
                  <p className="font-semibold">{reviewItem.ad_title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{reviewItem.brand_name}</p>
                </div>
                {ad.description && <p className="text-sm">{ad.description}</p>}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {ad.category && <div><span className="text-muted-foreground">Category:</span> {ad.category}</div>}
                  {ad.video_length && <div><span className="text-muted-foreground">Video Length:</span> {ad.video_length}</div>}
                  {ad.product_visibility && <div><span className="text-muted-foreground">Visibility:</span> {ad.product_visibility}</div>}
                  {ad.total_budget && <div><span className="text-muted-foreground">Budget:</span> {money(ad.total_budget)}</div>}
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

          {/* Right: Submission */}
          <div className="space-y-4">
            <h2 className="font-montserrat font-semibold text-lg">Submission</h2>
            <Card className="border-border">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  {reviewItem.creator_avatar ? (
                    <img src={reviewItem.creator_avatar} alt="" className="h-8 w-8 rounded-full object-cover bg-muted" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-sm font-medium">{reviewItem.creator_name}</span>
                  <Badge variant="outline" className="ml-auto">{reviewItem.type === 'spread' ? 'Spread' : 'Deal'}</Badge>
                </div>

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
                    <p className="text-lg font-semibold">{reviewItem.current_views.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">Views</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{reviewItem.current_likes.toLocaleString()}</p>
                    <p className="text-[11px] text-muted-foreground">Likes</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{reviewItem.current_shares.toLocaleString()}</p>
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

                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={() => handleAction(reviewItem, 'approve')} disabled={acting}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleAction(reviewItem, 'deny')} disabled={acting}>
                    <X className="h-4 w-4 mr-1" /> Deny
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ============ QUEUE LIST ============
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-montserrat font-semibold text-lg">Review Queue</h1>
        <Badge variant="secondary">{items.length} pending</Badge>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">🎉 All caught up — nothing to review</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Ad</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={`${item.type}-${item.id}`} className="cursor-pointer hover:bg-accent/50" onClick={() => setReviewItem(item)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.creator_avatar ? (
                      <img src={item.creator_avatar} alt="" className="h-7 w-7 rounded-full object-cover bg-muted" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                    <span className="text-sm font-medium truncate max-w-[120px]">{item.creator_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-[180px]">
                    <p className="text-sm font-medium truncate">{item.ad_title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.brand_name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type === 'spread' ? 'Spread' : 'Deal'}</Badge>
                </TableCell>
                <TableCell className="text-sm">{item.current_views.toLocaleString()}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmt(item.created_at)}</TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleAction(item, 'approve')} disabled={acting}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleAction(item, 'deny')} disabled={acting}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminReviewQueue;

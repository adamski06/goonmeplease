import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Check, X, Trash2, RotateCcw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type AdType = 'spread' | 'deal' | 'reward';

type Row = {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_username: string | null;
  creator_avatar: string | null;
  status: string;
  tiktok_video_url: string | null;
  current_views: number;
  current_likes: number;
  coupon_code: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending_review: 'Pending',
  pending: 'Pending',
  approved: 'Approved',
  accepted: 'Approved',
  denied: 'Denied',
  rejected: 'Denied',
  completed: 'Completed',
};

const statusVariant = (s: string): 'default' | 'outline' | 'secondary' | 'destructive' => {
  if (s === 'approved' || s === 'accepted' || s === 'completed') return 'default';
  if (s === 'pending_review' || s === 'pending') return 'outline';
  if (s === 'denied' || s === 'rejected') return 'destructive';
  return 'secondary';
};

const subTable = (t: AdType) =>
  t === 'spread' ? 'content_submissions'
  : t === 'deal' ? 'deal_applications'
  : 'reward_submissions';

const adTable = (t: AdType) =>
  t === 'spread' ? 'campaigns' : t === 'deal' ? 'deals' : 'reward_ads';

const fkColumn = (t: AdType) =>
  t === 'spread' ? 'campaign_id' : t === 'deal' ? 'deal_id' : 'reward_ad_id';

const AdminAdSubmissions = () => {
  const { type, id } = useParams<{ type: AdType; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [ad, setAd] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null);

  const t = (type || 'spread') as AdType;

  const load = async () => {
    if (!id) return;
    setLoading(true);

    const [{ data: adData }, { data: subData }] = await Promise.all([
      supabase.from(adTable(t)).select('id, title, brand_name, business_id, status').eq('id', id).maybeSingle(),
      supabase.from(subTable(t) as any).select('*').eq(fkColumn(t), id).order('created_at', { ascending: false }),
    ]);

    setAd(adData);

    const creatorIds = [...new Set((subData || []).map((s: any) => s.creator_id))];
    let profilesMap: Record<string, any> = {};
    if (creatorIds.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, avatar_url')
        .in('user_id', creatorIds);
      (profs || []).forEach(p => { profilesMap[p.user_id] = p; });
    }

    const mapped: Row[] = (subData || []).map((s: any) => ({
      id: s.id,
      creator_id: s.creator_id,
      creator_name: profilesMap[s.creator_id]?.full_name || profilesMap[s.creator_id]?.username || 'Unknown',
      creator_username: profilesMap[s.creator_id]?.username || null,
      creator_avatar: profilesMap[s.creator_id]?.avatar_url || null,
      status: s.status,
      tiktok_video_url: s.tiktok_video_url,
      current_views: s.current_views || 0,
      current_likes: s.current_likes || 0,
      coupon_code: s.coupon_code || null,
      created_at: s.created_at,
    }));

    setRows(mapped);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id, type]);

  const setStatus = async (row: Row, action: 'approve' | 'deny' | 'reset') => {
    setBusy(row.id);
    const now = new Date();
    const payoutDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let update: any = {};
    if (t === 'spread') {
      update.status = action === 'approve' ? 'approved' : action === 'deny' ? 'denied' : 'pending_review';
      update.reviewed_at = action === 'reset' ? null : now.toISOString();
      update.payout_available_at = action === 'approve' ? payoutDate.toISOString() : null;
    } else if (t === 'deal') {
      update.status = action === 'approve' ? 'accepted' : action === 'deny' ? 'denied' : 'pending';
      update.reviewed_at = action === 'reset' ? null : now.toISOString();
      update.payout_available_at = action === 'approve' ? payoutDate.toISOString() : null;
    } else {
      update.status = action === 'approve' ? 'approved' : action === 'deny' ? 'denied' : 'pending_review';
      update.reviewed_at = action === 'reset' ? null : now.toISOString();
    }

    const { error } = await supabase.from(subTable(t) as any).update(update).eq('id', row.id);
    if (error) {
      toast({ title: 'Failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: action === 'approve' ? 'Approved' : action === 'deny' ? 'Denied' : 'Reset to pending' });
      await load();
    }
    setBusy(null);
  };

  const deleteSubmission = async (row: Row) => {
    setBusy(row.id);

    // For rewards: release the claimed coupon (trigger does this automatically too — belt & suspenders)
    if (t === 'reward' && row.coupon_code) {
      await supabase.from('reward_coupons')
        .update({ claimed_by: null, claimed_at: null })
        .eq('reward_ad_id', id!)
        .eq('code', row.coupon_code);
    }

    const { error } = await supabase.from(subTable(t) as any).delete().eq('id', row.id);
    if (error) {
      toast({ title: 'Failed to remove', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Submission removed', description: t === 'reward' && row.coupon_code ? 'Coupon released back to pool.' : undefined });
      setRows(prev => prev.filter(r => r.id !== row.id));
    }
    setBusy(null);
    setConfirmDelete(null);
  };

  const filtered = rows.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'pending') return r.status === 'pending_review' || r.status === 'pending';
    if (filter === 'approved') return r.status === 'approved' || r.status === 'accepted' || r.status === 'completed';
    if (filter === 'denied') return r.status === 'denied' || r.status === 'rejected';
    return true;
  });

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.status === 'pending_review' || r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved' || r.status === 'accepted' || r.status === 'completed').length,
    denied: rows.filter(r => r.status === 'denied' || r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate('/admin/all-ads')}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to All Ads
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-montserrat font-semibold text-lg">{ad?.title || 'Ad'}</h1>
          <p className="text-sm text-muted-foreground">
            {ad?.brand_name} · <Badge variant="outline" className="capitalize ml-1">{t}</Badge>
          </p>
        </div>
        <Badge variant="secondary">{rows.length} submissions</Badge>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="denied">Denied ({counts.denied})</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No submissions match this filter</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Likes</TableHead>
              {t === 'reward' && <TableHead>Coupon</TableHead>}
              <TableHead>Video</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(row => (
              <TableRow key={row.id}>
                <TableCell>
                  <button
                    className="flex items-center gap-2 hover:underline"
                    onClick={() => navigate(`/admin/creators/${row.creator_id}`)}
                  >
                    {row.creator_avatar ? (
                      <img src={row.creator_avatar} alt="" className="h-7 w-7 rounded-full object-cover bg-muted" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-muted" />
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium leading-tight">{row.creator_name}</p>
                      {row.creator_username && (
                        <p className="text-xs text-muted-foreground leading-tight">@{row.creator_username}</p>
                      )}
                    </div>
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(row.status)}>{STATUS_LABEL[row.status] || row.status}</Badge>
                </TableCell>
                <TableCell className="text-sm">{row.current_views.toLocaleString()}</TableCell>
                <TableCell className="text-sm">{row.current_likes.toLocaleString()}</TableCell>
                {t === 'reward' && (
                  <TableCell className="text-xs font-mono max-w-[140px] truncate">
                    {row.coupon_code || '—'}
                  </TableCell>
                )}
                <TableCell>
                  {row.tiktok_video_url ? (
                    <a
                      href={row.tiktok_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(row.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {(row.status === 'pending_review' || row.status === 'pending') ? (
                      <>
                        <Button size="sm" variant="ghost" disabled={busy === row.id}
                                onClick={() => setStatus(row, 'approve')}
                                className="text-emerald-600 hover:text-emerald-700">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" disabled={busy === row.id}
                                onClick={() => setStatus(row, 'deny')}
                                className="text-destructive hover:text-destructive">
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" disabled={busy === row.id}
                              onClick={() => setStatus(row, 'reset')}
                              title="Reset to pending">
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" disabled={busy === row.id}
                            onClick={() => setConfirmDelete(row)}
                            className="text-destructive hover:text-destructive"
                            title="Unsubmit (remove from this ad)">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsubmit this creator?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {confirmDelete?.creator_name}'s submission from this ad.
              {t === 'spread' && ' Any earnings tied to this submission will also be removed.'}
              {t === 'reward' && confirmDelete?.coupon_code && ' The claimed coupon will be released back to the available pool.'}
              {' '}This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteSubmission(confirmDelete)}
            >
              Unsubmit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAdSubmissions;

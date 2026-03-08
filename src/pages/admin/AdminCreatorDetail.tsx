import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ExternalLink, CheckCircle2, XCircle, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrency } from '@/contexts/CurrencyContext';

const AdminCreatorDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { label, convert } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tiktok, setTiktok] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [profRes, tikRes, statsRes, subRes, earnRes, payRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('tiktok_accounts_safe').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('creator_stats').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('content_submissions').select('*, campaigns(title, brand_name)').eq('creator_id', userId).order('created_at', { ascending: false }),
        supabase.from('earnings').select('*, content_submissions(tiktok_video_url, campaigns(title))').eq('creator_id', userId).order('created_at', { ascending: false }),
        supabase.from('payout_requests').select('*').eq('creator_id', userId).order('created_at', { ascending: false }),
      ]);
      setProfile(profRes.data);
      setTiktok(tikRes.data);
      setStats(statsRes.data);
      setSubmissions(subRes.data || []);
      setEarnings(earnRes.data || []);
      setPayouts(payRes.data || []);
      setLoading(false);
    };
    load();
  }, [userId]);

  const handlePayout = async (payoutId: string, action: 'approve' | 'reject') => {
    setProcessing(payoutId);
    try {
      const { data, error } = await supabase.functions.invoke('process-payout', {
        body: { payout_request_id: payoutId, action },
      });
      if (error) throw error;
      // Refresh payouts
      const { data: updated } = await supabase.from('payout_requests').select('*').eq('creator_id', userId!).order('created_at', { ascending: false });
      setPayouts(updated || []);
      // Refresh stats
      const { data: newStats } = await supabase.from('creator_stats').select('*').eq('user_id', userId!).maybeSingle();
      setStats(newStats);
    } catch (e) {
      console.error('Payout action failed:', e);
    } finally {
      setProcessing(null);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'approved': case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': case 'pending_review': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'rejected': case 'denied': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/creators')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back to creators
      </button>

      {/* Profile header */}
      <Card className="border-border">
        <CardContent className="p-6 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover bg-muted" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold font-montserrat">{profile?.full_name || 'Unknown'}</h1>
            <p className="text-sm text-muted-foreground">@{profile?.username || 'no-username'}</p>
            {tiktok && <p className="text-xs text-muted-foreground mt-1">TikTok: @{tiktok.tiktok_username} · {(tiktok.follower_count || 0).toLocaleString()} followers</p>}
          </div>
          <div className="text-right">
            <Badge variant="outline" className={profile?.stripe_connect_id ? 'border-emerald-500/30 text-emerald-500' : 'border-muted text-muted-foreground'}>
              {profile?.stripe_connect_id ? 'Bank connected' : 'No bank'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Videos', value: stats?.total_videos || 0 },
          { label: 'Views', value: (stats?.total_views || 0).toLocaleString() },
          { label: 'Earnings', value: `${Math.floor(convert(stats?.total_earnings || 0))} ${label}` },
          { label: 'Balance', value: `${Math.floor(convert(stats?.total_balance || 0))} ${label}` },
        ].map((s) => (
          <Card key={s.label} className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-lg font-semibold font-montserrat">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payout Requests */}
      <div>
        <h2 className="font-montserrat font-semibold text-lg mb-3">Payout Requests ({payouts.length})</h2>
        {payouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payout requests yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transfer ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{format(new Date(p.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="font-medium">{Math.floor(convert(p.amount))} {label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColor(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{p.stripe_transfer_id || '—'}</TableCell>
                  <TableCell className="text-right">
                    {p.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                          disabled={processing === p.id}
                          onClick={() => handlePayout(p.id, 'approve')}
                        >
                          {processing === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                          <span className="ml-1">Approve</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                          disabled={processing === p.id}
                          onClick={() => handlePayout(p.id, 'reject')}
                        >
                          <XCircle className="h-3 w-3" />
                          <span className="ml-1">Reject</span>
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Submissions */}
      <div>
        <h2 className="font-montserrat font-semibold text-lg mb-3">Submitted Videos ({submissions.length})</h2>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-sm">{(s.campaigns as any)?.title || '—'}</TableCell>
                  <TableCell><Badge variant="outline" className={statusColor(s.status)}>{s.status}</Badge></TableCell>
                  <TableCell>{(s.current_views || 0).toLocaleString()}</TableCell>
                  <TableCell>{(s.current_likes || 0).toLocaleString()}</TableCell>
                  <TableCell>{(s.current_shares || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{format(new Date(s.created_at), 'MMM d')}</TableCell>
                  <TableCell>
                    {s.tiktok_video_url && (
                      <a href={s.tiktok_video_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Earnings */}
      <div>
        <h2 className="font-montserrat font-semibold text-lg mb-3">Earnings ({earnings.length})</h2>
        {earnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No earnings yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-sm">{(e.content_submissions as any)?.campaigns?.title || '—'}</TableCell>
                  <TableCell>{(e.views_counted || 0).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{Math.floor(convert(e.amount))} {label}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={e.is_paid ? 'border-emerald-500/30 text-emerald-500' : 'border-amber-500/30 text-amber-400'}>
                      {e.is_paid ? 'Paid' : 'Unpaid'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{format(new Date(e.created_at), 'MMM d')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default AdminCreatorDetail;

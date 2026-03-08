import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, ChevronRight } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

const AdminCreators = () => {
  const navigate = useNavigate();
  const { label, convert } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      // Get all creator roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'creator');

      if (!roles || roles.length === 0) { setLoading(false); return; }

      const userIds = roles.map(r => r.user_id);

      const [profilesRes, statsRes, tiktokRes] = await Promise.all([
        supabase.from('profiles').select('*').in('user_id', userIds),
        supabase.from('creator_stats').select('*').in('user_id', userIds),
        supabase.from('tiktok_accounts_safe').select('user_id, tiktok_username, follower_count').in('user_id', userIds),
      ]);

      const profileMap = Object.fromEntries((profilesRes.data || []).map(p => [p.user_id, p]));
      const statsMap = Object.fromEntries((statsRes.data || []).map(s => [s.user_id, s]));
      const tiktokMap = Object.fromEntries((tiktokRes.data || []).map(t => [t.user_id, t]));

      const merged = userIds.map(uid => ({
        user_id: uid,
        profile: profileMap[uid] || null,
        stats: statsMap[uid] || null,
        tiktok: tiktokMap[uid] || null,
      }));

      setCreators(merged);
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

  return (
    <div className="space-y-6">
      <h2 className="font-montserrat font-semibold text-lg">Creators ({creators.length})</h2>

      {creators.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">No creators yet</p>
      ) : (
        <div className="space-y-2">
          {creators.map((c) => (
            <Card
              key={c.user_id}
              className="border-border cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(`/admin/creators/${c.user_id}`)}
            >
              <CardContent className="p-4 flex items-center gap-3">
                {c.profile?.avatar_url ? (
                  <img src={c.profile.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover bg-muted" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{c.profile?.full_name || c.profile?.username || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.tiktok ? `@${c.tiktok.tiktok_username}` : 'No TikTok'} · {c.stats?.total_videos || 0} videos · {(c.stats?.total_views || 0).toLocaleString()} views
                  </p>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <p className="text-sm font-semibold font-montserrat">{Math.floor(convert(c.stats?.total_balance || 0))} {label}</p>
                  <Badge variant="outline" className={c.profile?.stripe_connect_id ? 'text-emerald-500 border-emerald-500/30 text-[10px]' : 'text-muted-foreground text-[10px]'}>
                    {c.profile?.stripe_connect_id ? 'Bank ✓' : 'No bank'}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCreators;

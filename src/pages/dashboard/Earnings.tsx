import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DollarSign, TrendingUp, Clock, Wallet } from 'lucide-react';
import { format } from 'date-fns';

const Earnings: React.FC = () => {
  const { user } = useAuth();

  const { data: earnings, isLoading } = useQuery({
    queryKey: ['earnings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('earnings')
        .select(`
          *,
          content_submissions (
            tiktok_video_url,
            campaigns (title, brand_name)
          )
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const paidEarnings = earnings?.filter(e => e.is_paid).reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  const pendingEarnings = totalEarnings - paidEarnings;
  const totalViews = earnings?.reduce((sum, e) => sum + e.views_counted, 0) || 0;

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      iconColor: 'text-emerald-400',
    },
    {
      title: 'Available Balance',
      value: `$${pendingEarnings.toFixed(2)}`,
      icon: Wallet,
      gradient: 'from-blue-500/20 to-blue-500/5',
      iconColor: 'text-blue-400',
    },
    {
      title: 'Paid Out',
      value: `$${paidEarnings.toFixed(2)}`,
      icon: TrendingUp,
      gradient: 'from-violet-500/20 to-violet-500/5',
      iconColor: 'text-violet-400',
    },
    {
      title: 'Total Views Counted',
      value: totalViews.toLocaleString(),
      icon: Clock,
      gradient: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Earnings</h1>
        <p className="text-white/60 mt-1">
          Track your earnings and payment history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} pointer-events-none`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
              <CardTitle className="text-sm font-medium text-white/70">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings History */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Earnings History</CardTitle>
          <CardDescription className="text-white/60">
            Detailed breakdown of your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/10 rounded" />
              ))}
            </div>
          ) : earnings && earnings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/70">Campaign</TableHead>
                  <TableHead className="text-white/70">Views</TableHead>
                  <TableHead className="text-white/70">Amount</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <p className="font-medium text-white">
                        {earning.content_submissions?.campaigns?.title}
                      </p>
                      <p className="text-sm text-white/50">
                        {earning.content_submissions?.campaigns?.brand_name}
                      </p>
                    </TableCell>
                    <TableCell className="text-white/70">
                      {earning.views_counted.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-emerald-400 font-medium">
                      ${Number(earning.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {earning.is_paid ? (
                        <span className="text-emerald-400">Paid</span>
                      ) : (
                        <span className="text-amber-400">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-white/50">
                      {format(new Date(earning.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-white/20" />
              <p className="text-white/60">No earnings yet. Start submitting content to campaigns!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;

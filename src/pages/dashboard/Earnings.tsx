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
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Available Balance',
      value: `$${pendingEarnings.toFixed(2)}`,
      icon: Wallet,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Paid Out',
      value: `$${paidEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Total Views Counted',
      value: totalViews.toLocaleString(),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground mt-1">
          Track your earnings and payment history
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings History */}
      <Card className="bg-white border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Earnings History</CardTitle>
          <CardDescription>
            Detailed breakdown of your earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          ) : earnings && earnings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.map((earning) => (
                  <TableRow key={earning.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {earning.content_submissions?.campaigns?.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {earning.content_submissions?.campaigns?.brand_name}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {earning.views_counted.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-medium">
                      ${Number(earning.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {earning.is_paid ? (
                        <span className="text-emerald-600">Paid</span>
                      ) : (
                        <span className="text-amber-600">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(earning.created_at), 'MMM d, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No earnings yet. Start submitting content to campaigns!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Earnings;

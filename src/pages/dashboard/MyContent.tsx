import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ExternalLink, Video, Eye, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const statusColors: Record<string, string> = {
  pending_review: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
  denied: 'bg-red-500/20 text-red-400 border-red-500/20',
  paid: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
};

const MyContent: React.FC = () => {
  const { user } = useAuth();

  const { data: submissions, isLoading } = useQuery({
    queryKey: ['my-submissions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_submissions')
        .select(`
          *,
          campaigns (title, brand_name),
          tiktok_accounts (tiktok_username),
          earnings (amount, views_counted)
        `)
        .eq('creator_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getTotalEarnings = (earnings: any[]) => {
    if (!earnings) return 0;
    return earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Content</h1>
        <p className="text-white/60 mt-1">
          Track your submissions and earnings
        </p>
      </div>

      {isLoading ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-white/10 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : submissions && submissions.length > 0 ? (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Your Submissions</CardTitle>
            <CardDescription className="text-white/60">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/70">Campaign</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Views</TableHead>
                  <TableHead className="text-white/70">Earnings</TableHead>
                  <TableHead className="text-white/70">Submitted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <div>
                        <p className="font-medium text-white">{submission.campaigns?.title}</p>
                        <p className="text-sm text-white/50">
                          @{submission.tiktok_accounts?.tiktok_username}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={statusColors[submission.status] || ''}
                      >
                        {submission.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-white/70">
                        <Eye className="h-4 w-4 text-white/50" />
                        {submission.current_views?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-emerald-400">
                        <DollarSign className="h-4 w-4" />
                        {getTotalEarnings(submission.earnings).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-white/50">
                      {format(new Date(submission.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild className="text-white/70 hover:text-white hover:bg-white/10">
                        <a 
                          href={submission.tiktok_video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="py-12 bg-white/5 border-white/10">
          <CardContent className="text-center">
            <Video className="h-12 w-12 mx-auto text-white/30 mb-4" />
            <h3 className="text-lg font-semibold text-white">No submissions yet</h3>
            <p className="text-white/60 mt-1 mb-4">
              Start by browsing available campaigns and submitting content
            </p>
            <Button asChild className="bg-white text-black hover:bg-white/90 rounded-full">
              <Link to="/dashboard/campaigns">Browse Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyContent;

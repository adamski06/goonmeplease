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
  pending_review: 'bg-amber-100 text-amber-700 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  denied: 'bg-red-100 text-red-700 border-red-200',
  paid: 'bg-blue-100 text-blue-700 border-blue-200',
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
        <h1 className="text-2xl font-bold text-foreground">My Content</h1>
        <p className="text-muted-foreground mt-1">
          Track your submissions and earnings
        </p>
      </div>

      {isLoading ? (
        <Card className="bg-white border-border">
          <CardContent className="py-8">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : submissions && submissions.length > 0 ? (
        <Card className="bg-white border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Your Submissions</CardTitle>
            <CardDescription>
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{submission.campaigns?.title}</p>
                        <p className="text-sm text-muted-foreground">
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
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {submission.current_views?.toLocaleString() || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-emerald-600">
                        <DollarSign className="h-4 w-4" />
                        {getTotalEarnings(submission.earnings).toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(submission.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
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
        <Card className="py-12 bg-white border-border">
          <CardContent className="text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No submissions yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              Start by browsing available campaigns and submitting content
            </p>
            <Button asChild className="rounded-full">
              <Link to="/dashboard/campaigns">Browse Campaigns</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyContent;

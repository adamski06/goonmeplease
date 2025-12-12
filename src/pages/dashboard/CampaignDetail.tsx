import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Calendar, DollarSign, FileText, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_tiers (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: tiktokAccounts } = useQuery({
    queryKey: ['tiktok-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tiktok_accounts')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  const { data: existingSubmission } = useQuery({
    queryKey: ['submission', id, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_submissions')
        .select('*')
        .eq('campaign_id', id)
        .eq('creator_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('content_submissions')
        .insert({
          creator_id: user?.id,
          campaign_id: id,
          tiktok_account_id: selectedAccount,
          tiktok_video_url: videoUrl,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Content submitted!',
        description: 'Your submission is now pending review.',
      });
      setIsSubmitOpen(false);
      setVideoUrl('');
      queryClient.invalidateQueries({ queryKey: ['submission', id, user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedAccount) {
      toast({
        title: 'Select an account',
        description: 'Please select a TikTok account to submit from.',
        variant: 'destructive',
      });
      return;
    }
    if (!videoUrl) {
      toast({
        title: 'Enter video URL',
        description: 'Please enter your TikTok video URL.',
        variant: 'destructive',
      });
      return;
    }
    submitMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-4" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Campaign not found</h2>
        <Button variant="link" onClick={() => navigate('/dashboard/campaigns')} className="text-white/70">
          Back to campaigns
        </Button>
      </div>
    );
  }

  const sortedTiers = campaign.campaign_tiers?.sort((a: any, b: any) => a.min_views - b.min_views) || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/dashboard/campaigns')} 
        className="gap-2 text-white/70 hover:text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{campaign.title}</h1>
          <p className="text-white/60 mt-1">by {campaign.brand_name}</p>
        </div>
        {campaign.category && (
          <Badge variant="secondary" className="text-sm bg-white/10 text-white/80 border-0">
            {campaign.category}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2 text-white">Description</h4>
              <p className="text-white/60">
                {campaign.description || 'No description provided'}
              </p>
            </div>

            {campaign.guidelines && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-white">
                  <FileText className="h-4 w-4" />
                  Guidelines
                </h4>
                <p className="text-white/60 whitespace-pre-wrap">
                  {campaign.guidelines}
                </p>
              </div>
            )}

            {campaign.deadline && (
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Calendar className="h-4 w-4" />
                <span>Deadline: {format(new Date(campaign.deadline), 'MMMM d, yyyy')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Payment Tiers
            </CardTitle>
            <CardDescription className="text-white/60">
              Earn more as your views increase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedTiers.map((tier: any, index: number) => (
                <div key={tier.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-sm text-white/70">
                    {tier.min_views.toLocaleString()} - {tier.max_views ? tier.max_views.toLocaleString() : '∞'} views
                  </div>
                  <div className="font-semibold text-emerald-400">
                    ${Number(tier.rate_per_view).toFixed(4)}/view
                  </div>
                </div>
              ))}
              {sortedTiers.length === 0 && (
                <p className="text-sm text-white/50">
                  Payment rates not specified
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Section */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Submit Your Content</CardTitle>
          <CardDescription className="text-white/60">
            Create content following the guidelines above and submit your TikTok video
          </CardDescription>
        </CardHeader>
        <CardContent>
          {existingSubmission ? (
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="font-medium text-white">You've already submitted content for this campaign</p>
                <p className="text-sm text-white/60 mt-1">
                  Status: <Badge variant="secondary" className="bg-white/10 text-white/80 border-0">
                    {existingSubmission.status.replace('_', ' ')}
                  </Badge>
                </p>
              </div>
              <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 rounded-full">
                <a href={existingSubmission.tiktok_video_url} target="_blank" rel="noopener noreferrer">
                  View Video <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          ) : tiktokAccounts && tiktokAccounts.length > 0 ? (
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-white/90 rounded-full">Submit Content</Button>
              </DialogTrigger>
              <DialogContent className="bg-[hsl(220,20%,10%)] border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Submit Your TikTok Video</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Enter your TikTok video URL to submit for this campaign
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label className="text-white">TikTok Account</Label>
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select your TikTok account" />
                      </SelectTrigger>
                      <SelectContent className="bg-[hsl(220,20%,12%)] border-white/10">
                        {tiktokAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id} className="text-white hover:bg-white/10">
                            @{account.tiktok_username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">TikTok Video URL</Label>
                    <Input
                      placeholder="https://www.tiktok.com/@username/video/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSubmitOpen(false)} className="border-white/20 text-white hover:bg-white/10 rounded-full">
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="bg-white text-black hover:bg-white/90 rounded-full">
                    {submitMutation.isPending ? 'Submitting...' : 'Submit'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="text-center py-4">
              <p className="text-white/60 mb-4">
                Connect your TikTok account to submit content
              </p>
              <Button variant="outline" onClick={() => navigate('/dashboard/settings')} className="border-white/20 text-white hover:bg-white/10 rounded-full">
                Go to Settings
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetail;

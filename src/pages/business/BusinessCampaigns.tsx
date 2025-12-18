import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Users, MoreHorizontal, Pencil, Pause, Play, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  brand_logo_url: string | null;
  description: string | null;
  status: string;
  is_active: boolean;
  created_at: string;
  deadline: string | null;
  total_budget: number;
}

const BusinessCampaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('business_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus, is_active: newStatus === 'active' })
        .eq('id', campaignId);

      if (error) throw error;
      fetchCampaigns();
    } catch (err) {
      console.error('Error updating campaign:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const filteredCampaigns = campaigns.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Active</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">Paused</Badge>;
      case 'ended':
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">Ended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
              <p className="text-muted-foreground mt-1">Manage your advertising campaigns</p>
            </div>
            <Button 
              onClick={() => navigate('/business/campaigns/new')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            {(['all', 'active', 'paused', 'ended'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>

          {/* Campaigns List */}
          {loadingCampaigns ? (
            <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
          ) : filteredCampaigns.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-none">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {campaigns.length === 0 
                    ? "You haven't created any campaigns yet" 
                    : "No campaigns match the selected filter"}
                </p>
                {campaigns.length === 0 && (
                  <Button onClick={() => navigate('/business/campaigns/new')}>
                    Create your first campaign
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <Card 
                  key={campaign.id} 
                  className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-colors cursor-pointer rounded-none"
                  onClick={() => navigate(`/business/campaigns/${campaign.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      <div className="h-14 w-14 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                        {campaign.brand_logo_url ? (
                          <img src={campaign.brand_logo_url} alt={campaign.brand_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xl font-bold text-muted-foreground">
                            {campaign.brand_name.charAt(0)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{campaign.title}</h3>
                          {getStatusBadge(campaign.status || 'active')}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{campaign.brand_name}</p>
                        {campaign.deadline && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          <span>0 views</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>0 submissions</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/business/campaigns/${campaign.id}/edit`);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {campaign.status === 'active' ? (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toggleCampaignStatus(campaign.id, 'paused');
                            }}>
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </DropdownMenuItem>
                          ) : campaign.status === 'paused' ? (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              toggleCampaignStatus(campaign.id, 'active');
                            }}>
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-500 focus:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCampaignStatus(campaign.id, 'ended');
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            End Campaign
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaigns;

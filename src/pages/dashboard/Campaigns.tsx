import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const Campaigns: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_tiers (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredCampaigns = campaigns?.filter(campaign =>
    campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.brand_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMinMaxRate = (tiers: any[]) => {
    if (!tiers || tiers.length === 0) return { min: 0, max: 0 };
    const rates = tiers.map(t => Number(t.rate_per_view));
    return {
      min: Math.min(...rates),
      max: Math.max(...rates),
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Campaign Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Browse available campaigns and start creating content
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white border-border animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const rates = getMinMaxRate(campaign.campaign_tiers);
            return (
              <Card key={campaign.id} className="bg-white border-border hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{campaign.title}</CardTitle>
                      <CardDescription className="mt-1">
                        by {campaign.brand_name}
                      </CardDescription>
                    </div>
                    {campaign.category && (
                      <Badge variant="secondary">
                        {campaign.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.description || 'No description provided'}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        ${rates.min.toFixed(4)} - ${rates.max.toFixed(4)}/view
                      </span>
                    </div>
                  </div>

                  {campaign.deadline && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Ends {format(new Date(campaign.deadline), 'MMM d, yyyy')}</span>
                    </div>
                  )}

                  <Button asChild className="w-full rounded-full">
                    <Link to={`/dashboard/campaigns/${campaign.id}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="py-12 bg-white border-border">
          <CardContent className="text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No campaigns available</h3>
            <p className="text-muted-foreground mt-1">
              {searchQuery 
                ? 'No campaigns match your search. Try different keywords.'
                : 'Check back soon for new campaign opportunities!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Campaigns;

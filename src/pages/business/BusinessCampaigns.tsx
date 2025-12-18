import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const BusinessCampaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const formatExact = (num: number) => {
    return num.toLocaleString('sv-SE');
  };

  // Mock stats - will be replaced with real data
  const stats = {
    totalViews: 1284739,
  };

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
            <Button onClick={() => navigate('/business/campaigns/new')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>

          <div className="space-y-16">
            {/* Campaign 1 - Summer Vibes */}
            <Card className="bg-white/40 dark:bg-dark-surface border-0 rounded-[4px] pt-3 pb-6 px-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)] opacity-0 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <h2 className="text-2xl font-semibold mt-2 mb-3">Summer Vibes</h2>
              <div className="flex items-stretch gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-8 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-6xl font-bold font-montserrat">{formatExact(stats.totalViews)}</span>
                        <span className="text-6xl font-bold font-montserrat">views</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold font-montserrat">47 823 sek</span>
                        <span className="text-3xl font-bold font-montserrat">/</span>
                        <span className="text-3xl font-bold font-montserrat">100 000 sek</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="w-8 h-14 bg-muted rounded-[4px]" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                  <CardContent className="px-8 py-6 h-full">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Budget</span>
                        <span className="text-lg font-semibold">100k</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Left</span>
                        <span className="text-lg font-semibold">52k</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Pending</span>
                        <span className="text-lg font-semibold">12</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Approved</span>
                        <span className="text-lg font-semibold">38</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Creators</span>
                        <span className="text-lg font-semibold">24</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">CPV</span>
                        <span className="text-lg font-semibold">0.037</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* iPhone aspect ratio placeholder (9:19.5) */}
                <div className="bg-muted rounded-[4px] h-full" style={{ aspectRatio: '9/19.5' }} />
              </div>
            </Card>

            {/* Campaign 2 - Coffee Culture */}
            <Card className="bg-white/40 dark:bg-dark-surface border-0 rounded-[4px] pt-3 pb-6 px-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)] opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <h2 className="text-2xl font-semibold mt-2 mb-3">Coffee Culture</h2>
              <div className="flex items-stretch gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-8 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-6xl font-bold font-montserrat">618 234</span>
                        <span className="text-6xl font-bold font-montserrat">views</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold font-montserrat">23 412 sek</span>
                        <span className="text-3xl font-bold font-montserrat">/</span>
                        <span className="text-3xl font-bold font-montserrat">50 000 sek</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="w-8 h-14 bg-muted rounded-[4px]" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                  <CardContent className="px-8 py-6 h-full">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Budget</span>
                        <span className="text-lg font-semibold">50k</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Left</span>
                        <span className="text-lg font-semibold">27k</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Pending</span>
                        <span className="text-lg font-semibold">4</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Approved</span>
                        <span className="text-lg font-semibold">15</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Creators</span>
                        <span className="text-lg font-semibold">11</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">CPV</span>
                        <span className="text-lg font-semibold">0.037</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* iPhone aspect ratio placeholder (9:19.5) */}
                <div className="bg-muted rounded-[4px] h-full" style={{ aspectRatio: '9/19.5' }} />
              </div>
            </Card>

            {/* Campaign 3 - Street Style */}
            <Card className="bg-white/40 dark:bg-dark-surface border-0 rounded-[4px] pt-3 pb-6 px-6 shadow-[0_0_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_20px_rgba(0,0,0,0.4)] opacity-0 animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <h2 className="text-2xl font-semibold mt-2 mb-3">Street Style</h2>
              <div className="flex items-stretch gap-3">
                <div className="flex flex-col gap-2 flex-1">
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-8 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-6xl font-bold font-montserrat">241 567</span>
                        <span className="text-6xl font-bold font-montserrat">views</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold font-montserrat">9 234 sek</span>
                        <span className="text-3xl font-bold font-montserrat">/</span>
                        <span className="text-3xl font-bold font-montserrat">25 000 sek</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                    <CardContent className="px-6 py-2">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="w-8 h-14 bg-muted rounded-[4px]" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                  <CardContent className="px-8 py-6 h-full">
                    <div className="flex h-full flex-col justify-between">
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Budget</span>
                        <span className="text-lg font-semibold">25k</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Left</span>
                        <span className="text-lg font-semibold">16k</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Pending</span>
                        <span className="text-lg font-semibold">7</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Approved</span>
                        <span className="text-lg font-semibold">9</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">Creators</span>
                        <span className="text-lg font-semibold">8</span>
                      </div>
                      <div className="flex justify-between items-baseline gap-4">
                        <span className="text-base text-muted-foreground font-bold">CPV</span>
                        <span className="text-lg font-semibold">0.037</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* iPhone aspect ratio placeholder (9:19.5) */}
                <div className="bg-muted rounded-[4px] h-full" style={{ aspectRatio: '9/19.5' }} />
              </div>
            </Card>
          </div>

          {/* Bottom New Campaign Button */}
          <div className="mt-16 flex justify-center opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
            <Button onClick={() => navigate('/business/campaigns/new')} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessCampaigns;

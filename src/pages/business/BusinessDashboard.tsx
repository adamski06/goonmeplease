import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

import defaultAvatar from '@/assets/default-avatar.png';

interface BusinessProfile {
  id: string;
  company_name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
}

const BusinessDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [totalViews, setTotalViews] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/business/auth');
    }
  }, [user, loading, navigate]);

  // Fetch business profile
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching business profile:', error);
        } else {
          setBusinessProfile(data);
        }
      } catch (error) {
        console.error('Error fetching business profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user) {
      fetchBusinessProfile();
    }
  }, [user]);

  // Fetch total views across all campaigns
  useEffect(() => {
    const fetchTotalViews = async () => {
      if (!user) return;
      
      try {
        // Get all campaigns for this business
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id')
          .eq('business_id', user.id);
        
        if (!campaigns || campaigns.length === 0) {
          setTotalViews(0);
          setLoadingStats(false);
          return;
        }

        const campaignIds = campaigns.map(c => c.id);
        
        // Get all submissions for these campaigns and sum up views
        const { data: submissions } = await supabase
          .from('content_submissions')
          .select('current_views')
          .in('campaign_id', campaignIds);
        
        const total = submissions?.reduce((sum, sub) => sum + (sub.current_views || 0), 0) || 0;
        setTotalViews(total);
      } catch (error) {
        console.error('Error fetching total views:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user) {
      fetchTotalViews();
    }
  }, [user]);

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const formatExact = (num: number) => {
    return num.toLocaleString('sv-SE');
  };

  // Extract first paragraph of description for display
  const shortDescription = businessProfile?.description?.split('\n\n')[0] || 'Welcome to your business dashboard';

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-4">
              {businessProfile?.logo_url ? (
                <img 
                  src={businessProfile.logo_url} 
                  alt="Company logo" 
                  className="h-14 w-14 object-cover rounded-sm" 
                />
              ) : (
                <div className="h-14 w-14 rounded-sm bg-muted flex items-center justify-center">
                  <span className="text-2xl font-semibold text-muted-foreground">
                    {businessProfile?.company_name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-foreground">
                {businessProfile?.company_name || 'Your Business'}
              </h1>
            </div>
            <p className="mt-3 text-muted-foreground max-w-xl">
              {shortDescription}
            </p>
          </div>

          {/* Total Views Card */}
          <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] inline-block mt-8 opacity-0 animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
            <CardContent className="px-8 py-3">
              <div className="flex items-center gap-3">
                <span className="text-6xl font-normal font-montserrat">
                  {loadingStats ? '...' : formatExact(totalViews)}
                </span>
                <span className="text-6xl font-normal font-montserrat">views</span>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;

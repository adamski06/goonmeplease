import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { supabase } from '@/integrations/supabase/client';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (loadingProfile) {
    return (
      <BusinessLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </BusinessLayout>
    );
  }

  // Extract first paragraph of description for display
  const shortDescription = businessProfile?.description?.split('\n\n')[0] || 'Welcome to your business dashboard';

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <div className="bg-card border border-border rounded-[4px] p-6">
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
              <p className="mt-4 text-muted-foreground max-w-xl">
                {shortDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';

import defaultAvatar from '@/assets/default-avatar.png';

const BusinessDashboard: React.FC = () => {
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

  // Mock stats - will be replaced with real data
  const stats = {
    totalSpent: 47823,
    totalBudget: 100000,
    totalViews: 1284739,
  };

  const formatExact = (num: number) => {
    return num.toLocaleString('sv-SE');
  };

  return (
    <BusinessLayout>
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 opacity-0 animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-4">
              <img src={defaultAvatar} alt="Company logo" className="h-14 w-14 object-cover rounded-none" />
              <h1 className="text-3xl font-bold text-foreground">Acme Inc.</h1>
            </div>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Leading innovator in sustainable technology solutions, empowering businesses to build a greener future.
            </p>
          </div>

          {/* Total Views Card */}
          <Card className="bg-white/70 dark:bg-white/10 border-0 rounded-[4px] shadow-[0_0_15px_rgba(0,0,0,0.06)] dark:shadow-[0_0_15px_rgba(0,0,0,0.3)] inline-block mt-8 opacity-0 animate-fade-in" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
            <CardContent className="px-8 py-3">
              <div className="flex items-center gap-3">
                <span className="text-6xl font-normal font-montserrat">{formatExact(stats.totalViews)}</span>
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

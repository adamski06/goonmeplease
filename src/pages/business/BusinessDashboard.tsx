import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';

import ugc1 from '@/assets/ugc/ugc-placeholder-1.jpg';
import ugc2 from '@/assets/ugc/ugc-placeholder-2.jpg';
import ugc3 from '@/assets/ugc/ugc-placeholder-3.jpg';
import ugc4 from '@/assets/ugc/ugc-placeholder-4.jpg';
import ugc5 from '@/assets/ugc/ugc-placeholder-5.jpg';
import ugc6 from '@/assets/ugc/ugc-placeholder-6.jpg';

const ugcImages = [ugc1, ugc2, ugc3, ugc4, ugc5, ugc6];

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Home</h1>
            <p className="text-muted-foreground mt-1">Overview of your performance</p>
          </div>

          {/* Stats Cards */}
          <div className="flex items-stretch gap-3 ml-8">
            {/* Left column - stacked cards */}
            <div className="flex flex-col gap-2">
              <Card className="bg-black text-white rounded-2xl shadow-sm">
                <CardContent className="px-8 py-3">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-normal font-montserrat">{formatExact(stats.totalSpent)} sek =</span>
                    <span className="text-6xl font-bold font-montserrat">{formatExact(stats.totalViews)}</span>
                    <span className="text-6xl font-bold font-montserrat">views</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border-white/40 rounded-2xl shadow-sm">
                <CardContent className="px-6 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">User Generated Videos:</span>
                    <div className="flex items-center gap-1">
                      {ugcImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`UGC video ${index + 1}`}
                          className="w-5 h-8 object-cover rounded-sm"
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - stats */}
            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-md border-white/40 rounded-2xl shadow-sm">
              <CardContent className="px-4 py-1 h-full flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">Campaigns</span>
                    <span className="text-sm font-semibold">4</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">Budget</span>
                    <span className="text-sm font-semibold">100k</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">Pending</span>
                    <span className="text-sm font-semibold">12</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">Left</span>
                    <span className="text-sm font-semibold">52k</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">Approved</span>
                    <span className="text-sm font-semibold">38</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">CPV</span>
                    <span className="text-sm font-semibold">0.037</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">Creators</span>
                    <span className="text-sm font-semibold">24</span>
                  </div>
                  <div className="flex justify-between items-baseline gap-3">
                    <span className="text-xs text-muted-foreground">Eng.</span>
                    <span className="text-sm font-semibold">4.2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

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
    totalSpent: 45600,
    totalBudget: 100000,
    totalViews: 1250000,
    totalVideos: 48,
  };

  const formatExact = (num: number) => {
    return num.toLocaleString('sv-SE');
  };

  // Mock video placeholders
  const videoPlaceholders = Array(6).fill(null);

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
          <div className="flex items-stretch gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-none">
              <CardContent className="p-0 h-full relative">
                <div className="py-8 px-8 h-full flex items-center">
                  <p className="text-4xl font-bold leading-none">{formatExact(stats.totalSpent)} SEK</p>
                </div>
                <p className="text-xl font-bold absolute left-8 bottom-6">/ {formatExact(stats.totalBudget)} SEK</p>
              </CardContent>
            </Card>

            <p className="text-4xl font-bold self-center">=</p>

            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-none flex-1">
              <CardContent className="p-0 h-full">
                <div className="py-8 px-8 h-full flex flex-col justify-center">
                  <p className="text-7xl font-bold leading-none">{formatExact(stats.totalViews)} views</p>
                  <div className="flex items-center gap-1 mt-4">
                    <p className="text-xl font-bold mr-3">Amount of videos:</p>
                    {videoPlaceholders.map((_, index) => (
                      <div
                        key={index}
                        className="w-6 h-10 bg-muted/50 border border-border rounded-sm"
                      />
                    ))}
                    <button className="w-6 h-10 bg-muted/30 border border-dashed border-border rounded-sm flex items-center justify-center hover:bg-muted/50 transition-colors">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
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

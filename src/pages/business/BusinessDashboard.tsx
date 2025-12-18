import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

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
    totalCreators: 48,
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

          {/* Stats Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border max-w-4xl rounded-none">
            <CardContent className="py-8 px-8">
              {/* Top row - Money and Views aligned */}
              <div className="flex items-baseline gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Money Spent</p>
                  <p className="text-2xl font-bold">{formatExact(stats.totalSpent)} SEK =</p>
                </div>
                <p className="text-7xl font-bold">{formatExact(stats.totalViews)} views</p>
              </div>

              {/* Bottom row - Budget and Creators */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  / {formatExact(stats.totalBudget)} SEK
                </p>
                <p className="text-sm text-muted-foreground">{stats.totalCreators} creators</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;

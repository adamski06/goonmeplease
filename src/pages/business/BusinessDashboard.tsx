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

          {/* Stats Cards */}
          <div className="flex items-stretch gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-none flex">
              <CardContent className="py-8 px-8 flex flex-col justify-end">
                <p className="text-4xl font-bold leading-none">{formatExact(stats.totalSpent)} SEK</p>
                <p className="text-xl font-bold mt-2">/ {formatExact(stats.totalBudget)} SEK</p>
              </CardContent>
            </Card>

            <div className="flex flex-col justify-end py-8">
              <p className="text-4xl font-bold leading-none">=</p>
              <p aria-hidden className="text-xl font-bold mt-2 opacity-0 select-none">/</p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-border rounded-none flex">
              <CardContent className="py-8 px-8 flex flex-col justify-end">
                <p className="text-7xl font-bold leading-none">{formatExact(stats.totalViews)} views</p>
                <p
                  aria-hidden
                  className="text-xl font-bold mt-2 opacity-0 select-none"
                >
                  / {formatExact(stats.totalBudget)} SEK
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDashboard;

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import BusinessLayout from '@/components/BusinessLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

const BusinessDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const placeholderContainerRef = useRef<HTMLDivElement>(null);
  const [placeholderCount, setPlaceholderCount] = useState(6);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth?mode=login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const updatePlaceholderCount = () => {
      if (placeholderContainerRef.current) {
        const containerWidth = placeholderContainerRef.current.offsetWidth;
        const placeholderWidth = 24 + 4; // w-6 (24px) + gap (4px)
        const plusButtonWidth = 24 + 4;
        const availableWidth = containerWidth - plusButtonWidth;
        const count = Math.floor(availableWidth / placeholderWidth);
        setPlaceholderCount(Math.max(1, count));
      }
    };

    updatePlaceholderCount();
    window.addEventListener('resize', updatePlaceholderCount);
    return () => window.removeEventListener('resize', updatePlaceholderCount);
  }, []);

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
          <div className="flex flex-col gap-4">
            <Card className="bg-card border-foreground rounded-lg inline-block">
              <CardContent className="px-8 py-3">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-normal font-montserrat">{formatExact(stats.totalSpent)} =</span>
                  <span className="text-6xl font-normal font-montserrat">{formatExact(stats.totalViews)}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card border-foreground rounded-lg inline-block">
              <CardContent className="px-8 py-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-normal">UGC:</span>
                  <div className="flex items-center gap-1">
                    {Array(12).fill(null).map((_, index) => (
                      <div
                        key={index}
                        className="w-5 h-8 bg-muted/50 border border-foreground"
                      />
                    ))}
                    <button className="w-5 h-8 border border-dashed border-foreground flex items-center justify-center hover:bg-muted/30 transition-colors">
                      <Plus className="h-3 w-3 text-muted-foreground" />
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

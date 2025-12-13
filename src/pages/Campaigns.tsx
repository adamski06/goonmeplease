import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';

interface Campaign {
  id: string;
  title: string;
  brand_name: string;
  brand_logo_url: string | null;
  description: string | null;
  category: string | null;
  deadline: string | null;
  is_active: boolean | null;
}

const Campaigns: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCampaigns(data);
      }
      setIsLoading(false);
    };

    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="relative h-8 w-[120px]">
            <div 
              className="absolute inset-0 bg-foreground"
              style={{
                WebkitMaskImage: `url(${jarlaLogo})`,
                maskImage: `url(${jarlaLogo})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'left center',
                maskPosition: 'left center'
              }} 
            />
          </button>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-muted"
          >
            <User className="h-7 w-7 text-foreground" strokeWidth={2.5} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
      </main>
    </div>
  );
};

export default Campaigns;

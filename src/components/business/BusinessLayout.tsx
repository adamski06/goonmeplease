import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import jarlaLogo from '@/assets/jarla-logo.png';
import BusinessSidebar from './BusinessSidebar';

const BusinessLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/business/auth');
        setLoading(false);
        return;
      }

      // Check if user has business role
      const { data: hasRole } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'business',
      });

      if (!hasRole) {
        // Logged in but not a business user — sign them out and redirect
        await supabase.auth.signOut();
        navigate('/business/auth');
      } else {
        setAuthorized(true);
      }
      setLoading(false);
    };

    checkAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuthorized(false);
        navigate('/business/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <img
          src={jarlaLogo}
          alt="Jarla"
          className="h-5"
          style={{ filter: 'invert(1)' }}
        />
        <div className="h-4 w-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen flex bg-background">
      <BusinessSidebar />
      <main className="flex-1 overflow-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default BusinessLayout;

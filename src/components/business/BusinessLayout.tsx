import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import jarlaLogo from '@/assets/jarla-logo.png';
import BusinessSidebar from './BusinessSidebar';
import { useTheme } from 'next-themes';

const CREATION_ROUTES = ['/business/campaigns/new', '/business/deals/new', '/business/new'];

const BusinessLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const isCreationRoute = CREATION_ROUTES.includes(location.pathname);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/business/auth');
        setLoading(false);
        return;
      }

      const { data: hasRole } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'business',
      });

      if (!hasRole) {
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
    <div className="h-screen flex bg-background overflow-hidden relative">
      {/* Fixed logo overlay — always in same spot, never animates */}
      <div className="absolute top-0 left-0 z-50 px-5 py-5 pointer-events-none">
        <img
          src={jarlaLogo}
          alt="Jarla"
          className="h-6"
          style={{ filter: theme === 'dark' ? 'none' : 'invert(1)' }}
        />
      </div>

      {/* Sidebar — always full height, never affected by topbar */}
      <BusinessSidebar isCreationRoute={isCreationRoute} />

      {/* Content column — topbar + main stacked vertically */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — only on creation routes */}
        {isCreationRoute && (
          <div className="shrink-0 h-16 border-b border-border animate-in slide-in-from-top-2 duration-300 z-20" />
        )}

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;

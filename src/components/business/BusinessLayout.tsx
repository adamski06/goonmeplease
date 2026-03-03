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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar — always present, logo is its own entity */}
      <div className="flex items-center shrink-0 border-b border-border px-5 py-5">
        <img
          src={jarlaLogo}
          alt="Jarla"
          className="h-6"
          style={{ filter: theme === 'dark' ? 'none' : 'invert(1)' }}
        />
      </div>

      {/* Sidebar + content below the top bar */}
      <div className="flex flex-1 overflow-hidden">
        <BusinessSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;

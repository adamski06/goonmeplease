import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import jarlaLogo from '@/assets/jarla-logo.png';
import BusinessSidebar from './BusinessSidebar';
import { useTheme } from 'next-themes';

const CREATION_ROUTES = ['/business/campaigns/new', '/business/deals/new', '/business/new'];

const CREATION_TITLES: Record<string, string> = {
  '/business/new': 'New Ad',
  '/business/campaigns/new': 'Create a Spread',
  '/business/deals/new': 'Create a Deal',
};

const BusinessLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const isCreationRoute = CREATION_ROUTES.includes(location.pathname);
  const creationTitle = CREATION_TITLES[location.pathname] || 'New Ad';

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

  if (isCreationRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {/* Shared top bar: logo section (w-60) + page title */}
        <div className="flex border-b border-border shrink-0 animate-in slide-in-from-top-2 duration-300">
          <div className="w-60 px-5 py-5 border-r border-border shrink-0 flex items-center gap-2.5">
            <img
              src={jarlaLogo}
              alt="Jarla"
              className="h-6"
              style={{ filter: theme === 'dark' ? 'none' : 'invert(1)' }}
            />
          </div>
          <div className="flex-1 px-5 py-5 flex items-center">
            <span className="text-sm font-semibold text-foreground font-montserrat leading-6">{creationTitle}</span>
          </div>
        </div>

        {/* Sidebar (no header) + content */}
        <div className="flex flex-1 overflow-hidden">
          <BusinessSidebar noHeader />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

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

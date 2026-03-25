import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PanelLeft, Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';
import jarlaLogo from '@/assets/jarla-logo.png';
import BusinessSidebar from './BusinessSidebar';
import { useTheme } from 'next-themes';

const CREATION_ROUTES = ['/business/campaigns/new', '/business/deals/new', '/business/rewards/new', '/business/new', '/business/ad-types'];

const BusinessLayout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  const isCreationRoute = CREATION_ROUTES.includes(location.pathname);
  const isCollapsed = isCreationRoute && !sidebarExpanded;

  // Reset expanded state when leaving creation routes
  useEffect(() => {
    if (!isCreationRoute) setSidebarExpanded(false);
  }, [isCreationRoute]);

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
          className="h-5 dark:brightness-100 brightness-0"
        />
        <div className="h-4 w-4 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">
      {/* Fixed logo overlay — always in same spot, never animates */}
      <div className="absolute top-0 left-0 z-50 px-5 h-10 flex items-center gap-3 pointer-events-none">
        <img
          src={jarlaLogo}
          alt="Jarla"
          className="h-[18px] dark:brightness-100 brightness-0"
        />
        {/* Expand sidebar + AI buttons — fade in when topbar is visible */}
        <div
          className={cn(
            'flex items-center gap-1.5 pointer-events-auto transition-opacity duration-300',
            isCreationRoute ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          style={{ willChange: 'opacity' }}
        >
          <button
            onClick={() => setSidebarExpanded(e => !e)}
            className="h-6 w-6 rounded-md flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-chat'))}
            className="h-6 w-6 rounded-md flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-sidebar-accent/50 transition-colors"
            title="Jarla AI"
          >
            <Sparkle className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Top bar — spans full width OVER sidebar, only on creation routes */}
      {isCreationRoute && (
        <div className="absolute top-0 left-0 right-0 h-10 border-b border-border bg-background animate-in slide-in-from-top-2 duration-300 z-30 flex flex-col">
          <div className="flex-1 flex items-center">
            {/* Center the text in the content area (offset by sidebar width) */}
            <div className={cn('shrink-0 transition-[width] duration-300', isCollapsed ? 'w-[56px]' : 'w-60')} />
            <div className="flex-1 flex items-center justify-center" id="topbar-center">
              {(location.pathname === '/business/new' || location.pathname === '/business/ad-types') && (
                <p className="text-sm font-medium text-muted-foreground font-jakarta tracking-wide">
                  {location.pathname === '/business/new' ? 'Select one' : 'Ad types'}
                </p>
              )}
            </div>
          </div>
          {/* Progress bar slot — rendered by child pages via portal */}
          <div id="topbar-progress" className="w-full" />
        </div>
      )}

      {/* Sidebar — always full height, never affected by topbar */}
      <BusinessSidebar isCreationRoute={isCollapsed} />

      {/* Content column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Spacer to push content below topbar when it's visible */}
        {isCreationRoute && <div className="shrink-0 h-10" />}

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;

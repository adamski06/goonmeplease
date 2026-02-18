import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Megaphone, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import jarlaLogo from '@/assets/jarla-logo.png';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

const navItems = [
  { label: 'Profile', icon: User, path: '/business' },
  { label: 'Campaigns', icon: Megaphone, path: '/business/campaigns' },
];

const BusinessSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/business/auth');
  };

  return (
    <aside className="w-60 border-r border-border bg-sidebar-background flex flex-col h-screen shrink-0 sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-border">
        <img
          src={jarlaLogo}
          alt="Jarla"
          className="h-6"
          style={{ filter: theme === 'dark' ? 'none' : 'invert(1)' }}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/business' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Settings (above border) */}
      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={() => navigate('/business/settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/business/settings'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-sidebar-accent/50 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default BusinessSidebar;

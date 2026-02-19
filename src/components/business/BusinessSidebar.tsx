import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, Plus, Megaphone, Handshake, ChevronDown, Coins, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import jarlaLogo from '@/assets/jarla-logo.png';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface SidebarItem {
  id: string;
  title: string;
  type: 'spread' | 'deal';
}

interface BusinessProfileData {
  company_name: string;
  logo_url: string | null;
  website: string | null;
}

const BusinessSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profileData }, { data: campaigns }, { data: deals }] = await Promise.all([
        supabase
          .from('business_profiles')
          .select('company_name, logo_url, website')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('campaigns')
          .select('id, title')
          .eq('business_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('deals')
          .select('id, title')
          .eq('business_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (profileData) setProfile(profileData);

      const spreadItems: SidebarItem[] = (campaigns || []).map(c => ({ id: c.id, title: c.title, type: 'spread' }));
      const dealItems: SidebarItem[] = (deals || []).map(d => ({ id: d.id, title: d.title, type: 'deal' }));
      setItems([...spreadItems, ...dealItems]);
    };
    load();
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/business/auth');
  };

  const getItemPath = (item: SidebarItem) =>
    item.type === 'spread' ? `/business/campaigns/${item.id}` : `/business/deals/${item.id}`;

  const initial = profile?.company_name?.charAt(0)?.toUpperCase() || '?';
  const domain = (profile?.website || '').replace(/^https?:\/\//, '').replace(/\/.*$/, '');

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
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4 min-h-0">
        {/* Company profile node with dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(o => !o)}
            className={cn(
              'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors border',
              profileOpen
                ? 'bg-sidebar-accent text-sidebar-accent-foreground border-border'
                : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground border-border'
            )}
          >
            {/* Company avatar */}
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
              {profile?.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const fallback = domain ? `https://logo.clearbit.com/${domain}` : '';
                    if (fallback && img.src !== fallback) {
                      img.src = fallback;
                    } else {
                      img.style.display = 'none';
                    }
                  }}
                />
              ) : (
                <span className="text-[9px] font-bold text-muted-foreground font-montserrat">{initial}</span>
              )}
            </div>
            <span className="truncate flex-1 text-left text-sm">{profile?.company_name || 'Profile'}</span>
            <ChevronDown className={cn('h-3 w-3 shrink-0 transition-transform', profileOpen && 'rotate-180')} />
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div
              className="absolute left-0 right-0 mt-1 rounded-lg border border-border overflow-hidden z-50 shadow-md"
              style={{ background: 'hsl(var(--popover))', backdropFilter: 'none' }}
            >
              {/* Company / profile row */}
              <button
                onClick={() => { navigate('/business'); setProfileOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
              >
                <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                  <span className="text-[8px] font-bold text-muted-foreground font-montserrat">{initial}</span>
                </div>
                <span className="truncate">{profile?.company_name || 'Profile'}</span>
              </button>
              {/* Separator */}
              <div className="h-px bg-border" />
              {/* Credits — pill style */}
              <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">Credits</span>
                <span
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                  style={{
                    background: 'hsl(var(--muted))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  }}
                >
                  <Coins className="h-3 w-3" />
                  —
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Home */}
        <button
          onClick={() => navigate('/business')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/business'
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
          )}
        >
          <Home className="h-4 w-4 shrink-0" />
          Home
        </button>

        {/* New Ad — always blue */}
        <button
          onClick={() => navigate('/business/new')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-white"
          style={{
            background: 'linear-gradient(135deg, hsl(214, 84%, 56%) 0%, hsl(221, 83%, 53%) 100%)',
            boxShadow: '0 2px 8px hsl(214, 84%, 56% / 0.35)',
          }}
        >
          <Plus className="h-4 w-4 shrink-0" />
          New Ad
        </button>

        {/* All ads (spread + deals) under one "Ads" heading */}
        {items.length > 0 && (
          <div className="space-y-0.5">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Ads
            </p>
            {items.map(item => {
              const path = getItemPath(item);
              const isActive = location.pathname === path;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(path)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  {item.type === 'spread' ? (
                    <Megaphone className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Handshake className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Settings */}
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

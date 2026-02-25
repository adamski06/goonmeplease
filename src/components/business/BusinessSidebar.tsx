import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, Plus, Megaphone, Handshake, ChevronDown, Home } from 'lucide-react';
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1.5 min-h-0">
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
              {/* Balance card */}
              <div className="mx-2 my-2 rounded-lg border border-border p-3 space-y-2.5" style={{ background: 'hsl(var(--muted) / 0.5)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Balance</span>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span className="font-semibold text-foreground">—</span>
                    <span>left</span>
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                  </button>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: '0%' }} />
                </div>
              </div>
              {/* Ad Balance button */}
              <div className="px-2 pb-2">
                <button
                  onClick={() => { setProfileOpen(false); }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-foreground border border-border hover:bg-sidebar-accent/50 transition-colors"
                >
                  Ad Balance
                </button>
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

        {/* New Ad — black, same size as profile node */}
        <button
          onClick={() => navigate('/business/new')}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-white border border-transparent"
          style={{
            background: 'linear-gradient(135deg, hsl(0, 0%, 18%) 0%, hsl(0, 0%, 10%) 100%)',
            boxShadow: '0 2px 8px hsl(0 0% 0% / 0.35)',
          }}
        >
          <Plus className="h-4 w-4 shrink-0" />
          New Ad
        </button>

        {/* All ads (spread + deals) under one "Ads" heading */}
        {items.length > 0 && (
          <div className="space-y-0.5 mt-6">
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

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, ChevronDown, Home, Sun, Moon, Settings, Inbox } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getHighResLogoUrl } from '@/lib/logoUrl';
import { useTheme } from 'next-themes';

interface SidebarItem {
  id: string;
  title: string;
  type: 'spread' | 'deal';
  status: string | null;
}

interface BusinessProfileData {
  company_name: string;
  logo_url: string | null;
  website: string | null;
}

interface BusinessSidebarProps {
  isCreationRoute: boolean;
}

const BusinessSidebar: React.FC<BusinessSidebarProps> = ({ isCreationRoute }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [items, setItems] = useState<SidebarItem[]>([]);
  const [profile, setProfile] = useState<BusinessProfileData | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isCollapsed = isCreationRoute;

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
          .select('id, title, status')
          .eq('business_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('deals')
          .select('id, title, status')
          .eq('business_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (profileData) setProfile(profileData);

      const spreadItems: SidebarItem[] = (campaigns || []).map(c => ({ id: c.id, title: c.title, type: 'spread', status: c.status }));
      const dealItems: SidebarItem[] = (deals || []).map(d => ({ id: d.id, title: d.title, type: 'deal', status: d.status }));
      setItems([...spreadItems, ...dealItems]);
    };
    load();
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => {
      const refetch = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profileData } = await supabase
          .from('business_profiles')
          .select('company_name, logo_url, website')
          .eq('user_id', user.id)
          .maybeSingle();
        if (profileData) setProfile(profileData);
      };
      refetch();
    };
    window.addEventListener('business-profile-updated', handler);
    return () => window.removeEventListener('business-profile-updated', handler);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
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

  const logoUrl = profile?.logo_url
    ? (getHighResLogoUrl(profile.logo_url) || profile.logo_url)
    : (domain ? `https://logo.clearbit.com/${domain}` : null);

  return (
    <aside
      className={cn(
        'border-r border-border bg-sidebar-background flex flex-col shrink-0 transition-[width] duration-300 ease-in-out overflow-hidden z-10',
        isCollapsed ? 'w-[56px]' : 'w-60'
      )}
    >
      {/* Logo spacer — fixed height, border always rendered to prevent layout shift */}
      <div className="shrink-0 h-10 border-b border-border" style={{ borderColor: isCollapsed ? 'transparent' : undefined }} />

      {/* Nav — all buttons keep same height via min-h, text hidden by overflow-hidden on aside */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden space-y-1.5 min-h-0 min-w-0">
        {/* Company profile node */}
        <div ref={profileRef} className="relative px-1">
          <button
            onClick={() => !isCollapsed && setProfileOpen(o => !o)}
            className={cn(
              'w-full flex items-center gap-2 px-2.5 min-h-[40px] rounded-lg text-sm font-medium transition-colors border whitespace-nowrap overflow-hidden',
              profileOpen
                ? 'bg-sidebar-accent text-foreground border-border'
                : 'text-foreground hover:bg-sidebar-accent/50 border-transparent'
            )}
            title={profile?.company_name || 'Profile'}
          >
            <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
              {profile?.logo_url ? (
                <img
                  src={getHighResLogoUrl(profile.logo_url) || profile.logo_url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (domain && !img.src.includes('google.com/s2/favicons')) {
                      img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
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

          {profileOpen && !isCollapsed && (
            <div
              className="absolute left-0 right-0 mt-1 rounded-lg border border-border overflow-hidden z-50 shadow-md"
              style={{ background: 'hsl(var(--popover))', backdropFilter: 'none' }}
            >
              <div className="mx-2 my-2 rounded-lg border border-border p-3 space-y-2.5" style={{ background: 'hsl(var(--muted) / 0.5)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Balance</span>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <span className="font-semibold text-foreground">—</span>
                    <span>left</span>
                    <ChevronDown className="h-3 w-3 -rotate-90" />
                  </button>
                </div>
                <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: '0%' }} />
                </div>
              </div>
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
            'w-full flex items-center gap-3 px-3 min-h-[40px] rounded-lg text-sm font-medium transition-colors whitespace-nowrap overflow-hidden',
            location.pathname === '/business'
              ? 'bg-sidebar-accent text-foreground'
              : 'text-foreground hover:bg-sidebar-accent/50'
          )}
          title="Home"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span>Home</span>
        </button>

        {/* New Ad */}
        <button
          onClick={() => navigate('/business/new')}
          className={cn(
            'flex items-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap overflow-hidden',
            'transition-all duration-300 ease-in-out',
            isCollapsed ? 'w-[40px] h-[40px] justify-center px-0' : 'w-full px-3 min-h-[40px]',
            resolvedTheme === 'dark' ? 'text-foreground' : 'text-white'
          )}
          style={{
            background: resolvedTheme === 'dark'
              ? 'linear-gradient(135deg, hsla(0,0%,100%,0.15) 0%, hsla(0,0%,100%,0.08) 100%)'
              : 'linear-gradient(135deg, hsl(0,0%,18%) 0%, hsl(0,0%,10%) 100%)',
            border: resolvedTheme === 'dark'
              ? '1px solid hsla(0,0%,100%,0.2)'
              : '1px solid hsla(0,0%,0%,0.1)',
            boxShadow: resolvedTheme === 'dark'
              ? '0 2px 8px hsla(0,0%,0%,0.3), inset 0 1px 0 hsla(0,0%,100%,0.12)'
              : '0 2px 8px hsla(0,0%,0%,0.35)',
            backdropFilter: resolvedTheme === 'dark' ? 'blur(12px)' : undefined,
          }}
          title="New Ad"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>New Ad</span>}
        </button>

        {/* All ads */}
        {items.length > 0 && (
          <div className="space-y-0.5 mt-10">
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/40 whitespace-nowrap">
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
                    'w-full flex items-center gap-2 px-3 min-h-[36px] rounded-lg text-sm transition-colors text-left whitespace-nowrap',
                    isActive
                      ? 'bg-sidebar-accent text-foreground font-medium'
                      : 'text-foreground hover:bg-sidebar-accent/50'
                  )}
                  title={item.title}
                >
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full shrink-0',
                      item.status === 'active' && 'bg-emerald-500',
                      item.status === 'pending' && 'bg-amber-400',
                      (!item.status || item.status === 'ended') && 'bg-foreground/20'
                    )}
                  />
                  <span className="truncate">{item.title}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Bottom */}
      <div className={cn(
        'shrink-0 flex items-center justify-center',
        isCollapsed ? 'flex-col gap-3 py-3' : 'flex-row justify-between px-3 py-3'
      )}>
        {/* Profile / user menu */}
        <div ref={userMenuRef} className="relative flex justify-center">
          <button
            onClick={() => setUserMenuOpen(o => !o)}
            className="h-6 w-6 rounded-md overflow-hidden flex items-center justify-center bg-muted text-muted-foreground hover:opacity-80 transition-opacity border border-border"
            title="Profile"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (domain && !img.src.includes('google.com/s2/favicons')) {
                    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
                  } else {
                    img.style.display = 'none';
                  }
                }}
              />
            ) : (
              <span className="text-[9px] font-bold font-montserrat">{initial}</span>
            )}
          </button>

          {userMenuOpen && (
            <div
              className="absolute left-0 bottom-full mb-1 w-48 rounded-lg border border-border overflow-hidden z-50 shadow-md"
              style={{ background: 'hsl(var(--popover))' }}
            >
              <button
                onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <button
                onClick={() => { navigate('/business/settings'); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>
          )}
        </div>

        {/* Inbox */}
        <button
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          title="Inbox"
        >
          <Inbox className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

export default BusinessSidebar;

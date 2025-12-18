import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Settings, Moon, LogOut, LayoutDashboard, Megaphone, Inbox, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';

interface BusinessLayoutProps {
  children: React.ReactNode;
}

const BusinessLayout: React.FC<BusinessLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const firstName = profile?.full_name?.split(' ')[0] || 'Business';

  const navItems = [
    { path: '/business', label: 'Home', icon: LayoutDashboard },
    { path: '/business/campaigns', label: 'Campaigns', icon: Megaphone },
    { path: '/business/submissions', label: 'Submissions', icon: Inbox },
    { path: '/business/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/business') return location.pathname === '/business';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Static Grainy Background */}
      <div className="absolute inset-0 pointer-events-none grainy-background" />
      <div className="noise-layer absolute inset-0 pointer-events-none" />
      
      {/* Left Sidebar */}
      <aside className="w-56 lg:w-52 flex flex-col relative z-10 backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface font-jakarta">
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <button onClick={() => navigate('/business')} className="relative h-10 w-[120px]">
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
          <span className="text-base font-bold text-black dark:text-white mt-1 block w-[120px] text-center">Business</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-3 gap-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`text-base font-medium px-3 py-2 text-left transition-colors flex items-center gap-3 ${
                isActive(item.path) 
                  ? 'font-bold text-foreground' 
                  : 'text-foreground hover:font-semibold'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>


        {/* More Menu at bottom */}
        <div className="mt-auto px-3 py-4 border-t border-black/10 dark:border-white/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-3">
                <Menu className="h-5 w-5" />
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="top" 
              align="start" 
              className="w-48 bg-background border-border"
            >
              <DropdownMenuItem className="cursor-pointer">
                <Avatar className="mr-2 h-4 w-4">
                  <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
                  <AvatarFallback className="text-[8px]">{firstName.charAt(0)}</AvatarFallback>
                </Avatar>
                {firstName}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onSelect={(e) => {
                  e.preventDefault();
                  setTheme(theme === 'dark' ? 'light' : 'dark');
                }} 
                className="cursor-pointer"
              >
                <Moon className="mr-2 h-4 w-4" />
                <span className="flex-1">Theme</span>
                <span className="text-muted-foreground text-xs">{theme === 'dark' ? 'on' : 'off'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        {children}
      </main>
    </div>
  );
};

export default BusinessLayout;

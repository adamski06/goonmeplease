import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Settings, Moon, LogOut } from 'lucide-react';
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
    { path: '/business', label: 'Home' },
    { path: '/business/campaigns', label: 'Campaigns' },
    { path: '/business/submissions', label: 'Submissions' },
    { path: '/business/analytics', label: 'Analytics' },
  ];

  const getIcon = (label: string) => {
    switch (label) {
      case 'Home':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
              fill="currentColor"
            />
            <rect x="10.5" y="15" width="3" height="6" rx="0.5" fill="hsl(210, 30%, 88%)" />
          </svg>
        );
      case 'Campaigns':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 12L5 10V20C5 20.5523 5.44772 21 6 21H7C7.55228 21 8 20.5523 8 20V8L12 4L16 8V20C16 20.5523 16.4477 21 17 21H18C18.5523 21 19 20.5523 19 20V10L21 12L12 3L3 12Z" />
          </svg>
        );
      case 'Submissions':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4ZM10.5 8.5C10 8.2 9.5 8.5 9.5 9V15C9.5 15.5 10 15.8 10.5 15.5L15.5 12.5C16 12.2 16 11.8 15.5 11.5L10.5 8.5Z" />
          </svg>
        );
      case 'Analytics':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="14" width="4" height="7" rx="1" />
            <rect x="10" y="10" width="4" height="11" rx="1" />
            <rect x="17" y="6" width="4" height="15" rx="1" />
          </svg>
        );
      default:
        return null;
    }
  };

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
        <nav className="flex flex-col px-3 gap-4 mt-8">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`text-lg lg:text-base px-3 py-1.5 text-left transition-all flex items-center gap-3 ${
                isActive(item.path) 
                  ? 'font-bold text-foreground' 
                  : 'font-medium text-foreground hover:font-semibold'
              }`}
            >
              {getIcon(item.label)}
              {item.label}
            </button>
          ))}
        </nav>


        {/* More Menu at bottom */}
        <div className="mt-auto px-3 py-4 border-t border-black/10 dark:border-white/20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-3">
                <Menu className="h-6 w-6" />
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

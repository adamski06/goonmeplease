import React, { useEffect } from 'react';
import { backgroundDelay } from '@/lib/backgroundDelay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, Menu, User, Settings, Moon, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';

const ProfilePage: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Mobile-only white background */}
      <div className="md:hidden absolute inset-0 bg-white" />
      {/* Static Grainy Background - desktop only */}
      <div className="hidden md:block absolute inset-0 pointer-events-none grainy-background" />
      <div className="hidden md:block noise-layer absolute inset-0 pointer-events-none" />
      
      {/* Left Sidebar - Desktop only */}
      <aside className="hidden md:flex w-56 lg:w-52 flex-col relative z-10 backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface font-jakarta">
        {/* Logo and Creator/Business Toggle */}
        <div className="px-6 pt-6 pb-4">
          <button onClick={() => navigate('/')} className="relative h-10 w-[120px]">
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
          <div className="mt-3 inline-flex bg-black/10 rounded-full overflow-hidden">
            <span className="px-4 py-1 text-xs font-bold font-montserrat bg-background text-foreground rounded-full">
              Creator
            </span>
            <button 
              onClick={() => navigate('/business')}
              className="px-4 py-1 text-xs font-bold font-montserrat text-foreground/60 hover:text-foreground transition-colors"
            >
              Business
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-3 gap-4 mt-8">
          <button 
            onClick={() => navigate('/')}
            className="text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-colors flex items-center gap-3"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
                fill="currentColor"
              />
              <rect x="10.5" y="15" width="3" height="6" rx="0.5" fill="hsl(210, 30%, 88%)" />
            </svg>
            Home
          </button>
          <button 
            onClick={() => navigate('/activity')}
            className="text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-3"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4ZM10.5 8.5C10 8.2 9.5 8.5 9.5 9V15C9.5 15.5 10 15.8 10.5 15.5L15.5 12.5C16 12.2 16 11.8 15.5 11.5L10.5 8.5Z" />
            </svg>
            Action
          </button>
          <button className="text-lg lg:text-base font-bold text-foreground px-3 py-1.5 text-left transition-all flex items-center gap-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            Profile
          </button>
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
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                My Profile
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10 px-4 pt-2 pb-2 h-20 safe-area-bottom">
        <div className="flex items-start justify-between h-full">
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z" />
            </svg>
            <span className="text-[10px] text-black/40">Home</span>
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[10px] text-black/40">Discover</span>
          </button>
          <button 
            onClick={() => navigate('/activity')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM10 8C9.5 7.7 9 8 9 8.5V15.5C9 16 9.5 16.3 10 16L16 12.5C16.5 12.2 16.5 11.8 16 11.5L10 8Z" />
            </svg>
            <span className="text-[10px] text-black/40">Action</span>
          </button>
          <button className="flex flex-col items-center gap-1 pt-1 w-12">
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-[10px] text-black/40">Alerts</span>
          </button>
          <button className="flex flex-col items-center gap-1 pt-1 w-12">
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-black/10 text-black text-[10px] font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-semibold text-black">Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 pb-24 md:pb-8 relative z-10">
        <div className="max-w-2xl">
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-black/10 md:bg-muted text-black md:text-foreground text-2xl font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-black md:text-foreground">{profile?.full_name || 'User'}</h1>
              {profile?.username && (
                <p className="text-black/60 md:text-muted-foreground">@{profile.username}</p>
              )}
            </div>
          </div>
          {profile?.bio && (
            <p className="text-black md:text-foreground">{profile.bio}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;

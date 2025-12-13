import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';

const Campaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

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
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Radial Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 200% 150% at 50% 100%, hsl(220, 40%, 80%) 0%, hsl(210, 30%, 85%) 25%, hsl(200, 20%, 90%) 40%, white 65%)'
        }}
      />
      <div className="noise-layer absolute inset-0 pointer-events-none opacity-50" />
      
      {/* Left Sidebar */}
      <aside className="w-64 flex flex-col relative z-10">
        {/* Logo */}
        <div className="px-6 py-4">
          <button onClick={() => navigate('/')} className="relative h-8 w-[120px]">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col justify-center px-4 gap-1">
          <button className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-400 bg-clip-text text-transparent px-3 py-2 text-left transition-colors flex items-center gap-3">
            <svg className="h-6 w-6 text-blue-800" viewBox="0 0 24 24" fill="none">
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
            className="text-2xl font-bold text-foreground hover:bg-gradient-to-r hover:from-blue-900 hover:to-blue-400 hover:bg-clip-text hover:text-transparent px-3 py-2 text-left transition-all flex items-center gap-3 group"
          >
            <Activity className="h-6 w-6 group-hover:text-blue-800" />
            Activity
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="text-2xl font-bold text-foreground hover:bg-gradient-to-r hover:from-blue-900 hover:to-blue-400 hover:bg-clip-text hover:text-transparent px-3 py-2 text-left transition-all flex items-center gap-3 group"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            My Page
          </button>
        </nav>

        {/* Profile at bottom */}
        <div className="mt-auto px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-muted text-foreground font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">{firstName}</span>
          </div>
        </div>
      </aside>

      {/* Main Content - TikTok Style */}
      <main className="flex-1 relative z-10">
        {/* Video Feed - Centered on screen */}
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Video Placeholder - 9:16 aspect ratio */}
          <div className="aspect-[9/16] h-[calc(100vh-48px)] bg-black/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            <span className="text-muted-foreground text-lg">Video</span>
            
            {/* Video Info Overlay */}
            <div className="absolute bottom-4 left-4 right-16 text-foreground">
              <p className="font-semibold text-sm">@creator_username</p>
              <p className="text-xs text-muted-foreground mt-1">Campaign description here...</p>
            </div>
          </div>
        </div>

        {/* Action Bubbles - Right Side of Video */}
        <div className="fixed left-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-4" style={{ marginLeft: 'calc((100vh - 48px) * 9 / 16 / 2 + 32px)' }}>
          <button className="px-8 py-4 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <span className="text-base font-semibold">5000 sek</span>
          </button>
          
          <button className="px-8 py-4 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <span className="text-base font-semibold">Stats</span>
          </button>
          
          <button className="px-8 py-4 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <span className="text-base font-semibold">Alerts</span>
          </button>
          
          <button className="px-8 py-4 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors">
            <span className="text-base font-semibold">Settings</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Campaigns;

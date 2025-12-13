import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';

// Mock campaign data - ads from companies
const campaigns = [
  { id: 1, brand: 'Nike', description: 'Show off your workout routine with our new collection', ratePerThousand: 50, maxEarnings: 25000 },
  { id: 2, brand: 'Spotify', description: 'Share your favorite playlist moment', ratePerThousand: 35, maxEarnings: 15000 },
  { id: 3, brand: 'Samsung', description: 'Unbox and review the new Galaxy phone', ratePerThousand: 72, maxEarnings: 50000 },
  { id: 4, brand: 'Red Bull', description: 'Capture your most extreme moment', ratePerThousand: 45, maxEarnings: 30000 },
  { id: 5, brand: 'Adobe', description: 'Create something amazing with our tools', ratePerThousand: 60, maxEarnings: 20000 },
];

const Campaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedCampaign, setDisplayedCampaign] = useState(campaigns[0]);
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Update displayed campaign when scroll settles
  useEffect(() => {
    if (scrollOpacity > 0.9) {
      setDisplayedCampaign(campaigns[currentIndex]);
    }
  }, [currentIndex, scrollOpacity]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    
    // Calculate which video we're closest to
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < campaigns.length) {
      setCurrentIndex(newIndex);
    }
    
    // Calculate how far we are from the nearest snap point (0 = centered, 0.5 = halfway)
    const offset = Math.abs(scrollTop - (newIndex * itemHeight));
    const progress = offset / itemHeight;
    
    // Fade out as we scroll away, fade in as we approach next snap
    const opacity = 1 - Math.min(progress * 3, 1);
    setScrollOpacity(Math.max(0, opacity));
  };

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
        {/* Video Feed - Snap Scroll Container */}
        <div 
          className="fixed left-1/2 -translate-x-1/2 top-0 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapStop: 'always' }}
          onScroll={handleScroll}
        >
          {campaigns.map((campaign, idx) => (
            <div key={campaign.id} className="h-screen flex items-center justify-center snap-center snap-always py-6">
              {/* Video Placeholder - 9:16 aspect ratio */}
              <div className="aspect-[9/16] h-[calc(100vh-48px)] bg-black/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                <span className="text-muted-foreground text-lg">Video {idx + 1}</span>
                
                {/* Video Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white transition-opacity duration-300">
                  <p className="font-bold text-lg">{campaign.brand}</p>
                  <p className="text-sm text-white/80 mt-1">{campaign.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Icon + Action Bubbles - Right Side of Video */}
        <div
          className="fixed left-1/2 top-1/2 -translate-y-1/2"
          style={{ marginLeft: 'calc((100vh - 48px) * 9 / 16 / 2 + 32px)' }}
        >
          <div 
            className="relative flex flex-col items-center gap-4"
            style={{ opacity: scrollOpacity, transition: 'opacity 50ms ease-out' }}
          >
            {/* Company Icon centered above first pill */}
            <div className="absolute -top-32 w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center text-6xl font-bold text-black border-2 border-white/50">
              {displayedCampaign.brand.charAt(0)}
            </div>

            {/* Spacer so pills stay visually centered while icon overlaps */}
            <div className="h-8" />

            {/* First pill: sek / views */}
            <button className="px-8 py-4 rounded-full bg-black text-white flex items-baseline justify-center hover:bg-black/80 transition-colors gap-1">
              <span className="text-2xl font-bold">{displayedCampaign.ratePerThousand} sek</span>
              <span className="text-xs font-semibold text-white/60">/ 1000 views</span>
            </button>

            {/* Second pill: max earnings */}
            <button className="px-8 py-4 rounded-full bg-black text-white flex items-baseline justify-center hover:bg-black/80 transition-colors gap-1">
              <span className="text-xs font-semibold text-white/60">up to</span>
              <span className="text-2xl font-bold">{displayedCampaign.maxEarnings.toLocaleString()} sek</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Campaigns;

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';
import campaignVideoPlaceholder from '@/assets/campaign-video-placeholder.mp4';
import nikeLogo from '@/assets/logos/nike.png';
import spotifyLogo from '@/assets/logos/spotify.png';
import samsungLogo from '@/assets/logos/samsung.png';
import redbullLogo from '@/assets/logos/redbull.png';
import adobeLogo from '@/assets/logos/adobe.png';
import CampaignDetailModal from '@/components/CampaignDetailModal';

// Hook to extract dominant colors from video edges for ambient glow
const useVideoAmbientColor = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [ambientColors, setAmbientColors] = useState({ top: 'transparent', bottom: 'transparent', left: 'transparent', right: 'transparent' });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);

  const extractColors = useCallback(() => {
    const video = videoRef.current;
    const now = performance.now();
    
    // Throttle to ~15fps for smoother performance
    if (now - lastUpdateRef.current < 66) {
      animationRef.current = requestAnimationFrame(extractColors);
      return;
    }
    lastUpdateRef.current = now;

    if (!video || video.paused || video.ended || video.readyState < 2) {
      animationRef.current = requestAnimationFrame(extractColors);
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = 32;
      canvasRef.current.height = 32;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    try {
      ctx.drawImage(video, 0, 0, 32, 32);
      const imageData = ctx.getImageData(0, 0, 32, 32);
      const data = imageData.data;

      // Sample edges
      const sampleEdge = (pixels: number[][]) => {
        let r = 0, g = 0, b = 0;
        pixels.forEach(([x, y]) => {
          const i = (y * 32 + x) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
        });
        r = Math.round(r / pixels.length);
        g = Math.round(g / pixels.length);
        b = Math.round(b / pixels.length);
        // Boost saturation for more vivid colors
        const max = Math.max(r, g, b);
        const boost = max > 0 ? 255 / max * 0.8 : 1;
        r = Math.min(255, Math.round(r * boost));
        g = Math.min(255, Math.round(g * boost));
        b = Math.min(255, Math.round(b * boost));
        return `rgb(${r}, ${g}, ${b})`;
      };

      // Get edge pixels
      const topPixels = Array.from({ length: 32 }, (_, x) => [x, 0]);
      const bottomPixels = Array.from({ length: 32 }, (_, x) => [x, 31]);
      const leftPixels = Array.from({ length: 32 }, (_, y) => [0, y]);
      const rightPixels = Array.from({ length: 32 }, (_, y) => [31, y]);

      setAmbientColors({
        top: sampleEdge(topPixels),
        bottom: sampleEdge(bottomPixels),
        left: sampleEdge(leftPixels),
        right: sampleEdge(rightPixels),
      });
    } catch (e) {
      // Cross-origin or other error
    }

    animationRef.current = requestAnimationFrame(extractColors);
  }, [videoRef]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(extractColors);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [extractColors]);

  return ambientColors;
};

// Extended mock campaign data
const campaigns = [
  { 
    id: 1, 
    brand: 'Nike', 
    description: 'Show off your workout routine with our new collection', 
    ratePerThousand: 50, 
    maxEarnings: 25000, 
    logo: nikeLogo,
    contentType: 'Workout/Fitness video',
    productVisibility: 'Product must be clearly visible for at least 3 seconds',
    videoLength: '15-60 seconds',
    guidelines: [
      'Wear Nike apparel or shoes throughout the video',
      'Show yourself actively working out',
      'Include the hashtag #JustDoIt',
      'No competitor brands visible'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 50 },
      { minViews: 10000, maxViews: 100000, rate: 40 },
      { minViews: 100000, maxViews: null, rate: 30 }
    ]
  },
  { 
    id: 2, 
    brand: 'Spotify', 
    description: 'Share your favorite playlist moment', 
    ratePerThousand: 35, 
    maxEarnings: 15000, 
    logo: spotifyLogo,
    contentType: 'Music/Lifestyle video',
    productVisibility: 'Show Spotify app on screen for at least 2 seconds',
    videoLength: '10-30 seconds',
    guidelines: [
      'Play music through Spotify app visibly',
      'Show genuine reaction to the music',
      'Mention discovering new music',
      'Use trending sounds when possible'
    ],
    tiers: [
      { minViews: 0, maxViews: 5000, rate: 35 },
      { minViews: 5000, maxViews: 50000, rate: 28 },
      { minViews: 50000, maxViews: null, rate: 20 }
    ]
  },
  { 
    id: 3, 
    brand: 'Samsung', 
    description: 'Unbox and review the new Galaxy phone', 
    ratePerThousand: 72, 
    maxEarnings: 50000, 
    logo: samsungLogo,
    contentType: 'Unboxing/Tech Review',
    productVisibility: 'Product must be the main focus throughout',
    videoLength: '30-90 seconds',
    guidelines: [
      'Show complete unboxing experience',
      'Highlight at least 3 key features',
      'Share your genuine first impressions',
      'Include the phone in good lighting'
    ],
    tiers: [
      { minViews: 0, maxViews: 20000, rate: 72 },
      { minViews: 20000, maxViews: 200000, rate: 55 },
      { minViews: 200000, maxViews: null, rate: 40 }
    ]
  },
  { 
    id: 4, 
    brand: 'Red Bull', 
    description: 'Capture your most extreme moment', 
    ratePerThousand: 45, 
    maxEarnings: 30000, 
    logo: redbullLogo,
    contentType: 'Extreme Sports/Adventure',
    productVisibility: 'Red Bull can visible at start or end',
    videoLength: '15-45 seconds',
    guidelines: [
      'Feature an adrenaline-pumping activity',
      'Keep it safe but exciting',
      'Show the Red Bull can naturally',
      'High energy editing preferred'
    ],
    tiers: [
      { minViews: 0, maxViews: 15000, rate: 45 },
      { minViews: 15000, maxViews: 150000, rate: 35 },
      { minViews: 150000, maxViews: null, rate: 25 }
    ]
  },
  { 
    id: 5, 
    brand: 'Adobe', 
    description: 'Create something amazing with our tools', 
    ratePerThousand: 60, 
    maxEarnings: 20000, 
    logo: adobeLogo,
    contentType: 'Creative Process/Tutorial',
    productVisibility: 'Show Adobe software interface clearly',
    videoLength: '20-60 seconds',
    guidelines: [
      'Demonstrate a creative workflow',
      'Show before/after if applicable',
      'Mention which Adobe tool you\'re using',
      'Make it inspirational for other creators'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 60 },
      { minViews: 10000, maxViews: 100000, rate: 45 },
      { minViews: 100000, maxViews: null, rate: 35 }
    ]
  },
];

const Campaigns: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientColors = useVideoAmbientColor(videoRef);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Preload all campaign logos
  useEffect(() => {
    campaigns.forEach((campaign) => {
      const img = new Image();
      img.src = campaign.logo;
    });
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    
    // Calculate which video we're closest to
    const nearestIndex = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(nearestIndex, campaigns.length - 1));
    
    // Update index immediately so new campaign data is ready
    if (clampedIndex !== currentIndex) {
      setCurrentIndex(clampedIndex);
    }
    
    // Calculate how far we are from the nearest snap point
    const offset = Math.abs(scrollTop - (clampedIndex * itemHeight));
    const progress = offset / itemHeight;
    
    // Fade based on distance from snap point
    const opacity = 1 - Math.min(progress * 4, 1);
    setScrollOpacity(Math.max(0, opacity));
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const currentCampaign = campaigns[currentIndex];

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
          className="fixed left-1/2 -translate-x-1/2 top-0 h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide overscroll-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapStop: 'always', scrollBehavior: 'auto' }}
          onScroll={handleScroll}
        >
          {campaigns.map((campaign, idx) => (
            <div key={campaign.id} className="h-screen flex items-center justify-center snap-center snap-always py-6">
              {/* Video Placeholder - 9:16 aspect ratio */}
              <div 
                onClick={() => setSelectedCampaign(campaign)}
                className="aspect-[9/16] h-[calc(100vh-48px)] rounded-2xl border border-white/20 flex items-center justify-center relative overflow-visible cursor-pointer"
              >
                {/* Ambient glow layer behind video */}
                {idx === 0 && (
                  <div 
                    className="absolute inset-0 rounded-2xl blur-3xl scale-110 -z-10 transition-all duration-200"
                    style={{
                      background: `
                        linear-gradient(to bottom, ${ambientColors.top}, transparent 30%),
                        linear-gradient(to top, ${ambientColors.bottom}, transparent 30%),
                        linear-gradient(to right, ${ambientColors.left}, transparent 30%),
                        linear-gradient(to left, ${ambientColors.right}, transparent 30%)
                      `,
                      opacity: 0.8,
                    }}
                  />
                )}
                {idx === 0 ? (
                  <video 
                    ref={videoRef}
                    src={campaignVideoPlaceholder} 
                    className="absolute inset-0 w-full h-full object-cover rounded-2xl"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-2xl" />
                    <span className="text-muted-foreground text-lg relative z-10">Video {idx + 1}</span>
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 rounded-2xl" />
                
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
            {/* Company Logo centered above first pill */}
            <div 
              onClick={() => setSelectedCampaign(currentCampaign)}
              className="absolute -top-32 w-40 h-40 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white/50 overflow-hidden p-4 cursor-pointer hover:scale-105 transition-transform"
            >
              <img src={currentCampaign.logo} alt={currentCampaign.brand} className="w-full h-full object-contain" />
            </div>

            {/* Spacer so pills stay visually centered while icon overlaps */}
            <div className="h-8" />

            {/* First pill: sek / views */}
            <button className="px-8 py-4 rounded-full bg-black text-white flex items-baseline justify-center hover:bg-black/80 transition-colors gap-1">
              <span className="text-2xl font-bold">{currentCampaign.ratePerThousand} sek</span>
              <span className="text-xs font-semibold text-white/60">/ 1000 views</span>
            </button>

            {/* Second pill: max earnings */}
            <button className="px-8 py-4 rounded-full bg-black text-white flex items-baseline justify-center hover:bg-black/80 transition-colors gap-1">
              <span className="text-xs font-semibold text-white/60">up to</span>
              <span className="text-2xl font-bold">{currentCampaign.maxEarnings.toLocaleString()} sek</span>
            </button>
          </div>
        </div>
      </main>

      {/* Campaign Detail Modal */}
      <CampaignDetailModal 
        campaign={selectedCampaign}
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
      />
    </div>
  );
};

export default Campaigns;

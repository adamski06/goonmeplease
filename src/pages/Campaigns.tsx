import React, { useEffect, useState, useMemo } from 'react';
import { backgroundDelay } from '@/lib/backgroundDelay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, LayoutGrid, Play, Menu, Settings, LogOut, User, Moon, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';
import campaignVideoPlaceholder from '@/assets/campaign-video-placeholder.mp4';
import nikeLogo from '@/assets/logos/nike.png';
import spotifyLogo from '@/assets/logos/spotify.png';
import samsungLogo from '@/assets/logos/samsung.png';
import redbullLogo from '@/assets/logos/redbull.png';
import adobeLogo from '@/assets/logos/adobe.png';
import CampaignDetailModal from '@/components/CampaignDetailModal';

// Campaign images
import fitnessWorkout from '@/assets/campaigns/fitness-workout.jpg';
import musicLifestyle from '@/assets/campaigns/music-lifestyle.jpg';
import techUnboxing from '@/assets/campaigns/tech-unboxing.jpg';
import extremeSports from '@/assets/campaigns/extreme-sports.jpg';
import creativeDesign from '@/assets/campaigns/creative-design.jpg';
import mobileCreative from '@/assets/campaigns/mobile-creative.jpg';
import summerDrink from '@/assets/campaigns/summer-drink.jpg';
import entertainment from '@/assets/campaigns/entertainment.jpg';
import streetStyle from '@/assets/campaigns/street-style.jpg';
import adventurePov from '@/assets/campaigns/adventure-pov.jpg';
import coffeeMoment from '@/assets/campaigns/coffee-moment.jpg';
import gaming from '@/assets/campaigns/gaming.jpg';
import fashionStyle from '@/assets/campaigns/fashion-style.jpg';
import unboxingHaul from '@/assets/campaigns/unboxing-haul.jpg';
import homeInterior from '@/assets/campaigns/home-interior.jpg';
import fastFood from '@/assets/campaigns/fast-food.jpg';
import foodDelivery from '@/assets/campaigns/food-delivery.jpg';
import electricCar from '@/assets/campaigns/electric-car.jpg';

// Extended mock campaign data
const campaigns = [
  { 
    id: 1, 
    brand: 'Nike', 
    description: 'Show off your workout routine with our new collection', 
    ratePerThousand: 50, 
    maxEarnings: 750, 
    logo: nikeLogo,
    image: fitnessWorkout,
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
    maxEarnings: 600, 
    logo: spotifyLogo,
    image: musicLifestyle,
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
    maxEarnings: 2500,
    logo: samsungLogo,
    image: techUnboxing,
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
    maxEarnings: 850, 
    logo: redbullLogo,
    image: extremeSports,
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
    maxEarnings: 950, 
    logo: adobeLogo,
    image: creativeDesign,
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
  { 
    id: 6, 
    brand: 'Apple', 
    description: 'Show how you use your iPhone creatively', 
    ratePerThousand: 55, 
    maxEarnings: 1800, 
    logo: nikeLogo,
    image: mobileCreative,
    contentType: 'Creative/Lifestyle',
    productVisibility: 'iPhone must be visible throughout',
    videoLength: '15-45 seconds',
    guidelines: [
      'Showcase a unique way you use your iPhone',
      'Keep it authentic and relatable',
      'Good lighting is essential',
      'No competitor devices visible'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 55 },
      { minViews: 10000, maxViews: 100000, rate: 42 },
      { minViews: 100000, maxViews: null, rate: 30 }
    ]
  },
  { 
    id: 7, 
    brand: 'Coca-Cola', 
    description: 'Share your refreshing summer moment', 
    ratePerThousand: 40, 
    maxEarnings: 550, 
    logo: spotifyLogo,
    image: summerDrink,
    contentType: 'Lifestyle/Summer vibes',
    productVisibility: 'Coca-Cola product visible for 3+ seconds',
    videoLength: '10-30 seconds',
    guidelines: [
      'Capture a fun summer moment',
      'Show the product naturally',
      'Include friends or family if possible',
      'Upbeat music encouraged'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 40 },
      { minViews: 8000, maxViews: 80000, rate: 30 },
      { minViews: 80000, maxViews: null, rate: 22 }
    ]
  },
  { 
    id: 8, 
    brand: 'Netflix', 
    description: 'React to your favorite new show', 
    ratePerThousand: 48, 
    maxEarnings: 700, 
    logo: samsungLogo,
    image: entertainment,
    contentType: 'Entertainment/Reaction',
    productVisibility: 'Show Netflix interface or content',
    videoLength: '15-60 seconds',
    guidelines: [
      'Share genuine reactions to a show',
      'No major spoilers',
      'Mention the show name clearly',
      'Encourage others to watch'
    ],
    tiers: [
      { minViews: 0, maxViews: 12000, rate: 48 },
      { minViews: 12000, maxViews: 120000, rate: 36 },
      { minViews: 120000, maxViews: null, rate: 26 }
    ]
  },
  { 
    id: 9, 
    brand: 'Adidas', 
    description: 'Show your street style', 
    ratePerThousand: 52, 
    maxEarnings: 800, 
    logo: redbullLogo,
    image: streetStyle,
    contentType: 'Fashion/Street Style',
    productVisibility: 'Adidas products must be the focus',
    videoLength: '15-45 seconds',
    guidelines: [
      'Showcase your unique style',
      'Urban setting preferred',
      'Include outfit details',
      'No competitor brands visible'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 52 },
      { minViews: 10000, maxViews: 100000, rate: 40 },
      { minViews: 100000, maxViews: null, rate: 28 }
    ]
  },
  { 
    id: 10, 
    brand: 'GoPro', 
    description: 'Capture your adventure', 
    ratePerThousand: 65, 
    maxEarnings: 1500, 
    logo: adobeLogo,
    image: adventurePov,
    contentType: 'Adventure/Action',
    productVisibility: 'Filmed with GoPro',
    videoLength: '15-60 seconds',
    guidelines: [
      'Must be filmed with a GoPro',
      'Show exciting activities',
      'Use unique angles',
      'High quality footage required'
    ],
    tiers: [
      { minViews: 0, maxViews: 15000, rate: 65 },
      { minViews: 15000, maxViews: 150000, rate: 50 },
      { minViews: 150000, maxViews: null, rate: 38 }
    ]
  },
  { 
    id: 11, 
    brand: 'Starbucks', 
    description: 'Share your coffee ritual', 
    ratePerThousand: 35, 
    maxEarnings: 500, 
    logo: nikeLogo,
    image: coffeeMoment,
    contentType: 'Lifestyle/Food & Drink',
    productVisibility: 'Starbucks cup clearly visible',
    videoLength: '10-30 seconds',
    guidelines: [
      'Show your morning coffee routine',
      'Cup must be recognizable',
      'Cozy vibes encouraged',
      'Mention your favorite drink'
    ],
    tiers: [
      { minViews: 0, maxViews: 5000, rate: 35 },
      { minViews: 5000, maxViews: 50000, rate: 26 },
      { minViews: 50000, maxViews: null, rate: 18 }
    ]
  },
  { 
    id: 12, 
    brand: 'PlayStation', 
    description: 'Share your gaming highlights', 
    ratePerThousand: 58, 
    maxEarnings: 2000, 
    logo: spotifyLogo,
    image: gaming,
    contentType: 'Gaming/Entertainment',
    productVisibility: 'PlayStation gameplay or console visible',
    videoLength: '20-60 seconds',
    guidelines: [
      'Show exciting gameplay moments',
      'Include your reactions',
      'Mention the game title',
      'High quality capture required'
    ],
    tiers: [
      { minViews: 0, maxViews: 18000, rate: 58 },
      { minViews: 18000, maxViews: 180000, rate: 44 },
      { minViews: 180000, maxViews: null, rate: 32 }
    ]
  },
  { 
    id: 13, 
    brand: 'H&M', 
    description: 'Style your favorite outfit', 
    ratePerThousand: 38, 
    maxEarnings: 650, 
    logo: samsungLogo,
    image: fashionStyle,
    contentType: 'Fashion/Styling',
    productVisibility: 'H&M clothing featured',
    videoLength: '15-45 seconds',
    guidelines: [
      'Create a stylish outfit',
      'Show how to style the pieces',
      'Tag the collection if applicable',
      'Good lighting essential'
    ],
    tiers: [
      { minViews: 0, maxViews: 7000, rate: 38 },
      { minViews: 7000, maxViews: 70000, rate: 28 },
      { minViews: 70000, maxViews: null, rate: 20 }
    ]
  },
  { 
    id: 14, 
    brand: 'Amazon', 
    description: 'Unbox your latest finds', 
    ratePerThousand: 42, 
    maxEarnings: 900, 
    logo: redbullLogo,
    image: unboxingHaul,
    contentType: 'Unboxing/Haul',
    productVisibility: 'Amazon packaging visible',
    videoLength: '20-60 seconds',
    guidelines: [
      'Show the unboxing experience',
      'Share genuine reactions',
      'Mention product names',
      'Good production quality'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 42 },
      { minViews: 10000, maxViews: 100000, rate: 32 },
      { minViews: 100000, maxViews: null, rate: 24 }
    ]
  },
  { 
    id: 15, 
    brand: 'IKEA', 
    description: 'Show your room transformation', 
    ratePerThousand: 55, 
    maxEarnings: 1200, 
    logo: adobeLogo,
    image: homeInterior,
    contentType: 'Home/DIY',
    productVisibility: 'IKEA products featured',
    videoLength: '30-90 seconds',
    guidelines: [
      'Show before and after',
      'Include assembly if possible',
      'Mention product names',
      'Inspire others to decorate'
    ],
    tiers: [
      { minViews: 0, maxViews: 12000, rate: 55 },
      { minViews: 12000, maxViews: 120000, rate: 42 },
      { minViews: 120000, maxViews: null, rate: 30 }
    ]
  },
  { 
    id: 16, 
    brand: 'McDonalds', 
    description: 'Share your go-to order', 
    ratePerThousand: 32, 
    maxEarnings: 450,
    logo: nikeLogo,
    image: fastFood,
    contentType: 'Food/Lifestyle',
    productVisibility: 'McDonalds food clearly visible',
    videoLength: '10-30 seconds',
    guidelines: [
      'Show your favorite meal',
      'Make it look delicious',
      'Include taste reaction',
      'Fun and casual vibe'
    ],
    tiers: [
      { minViews: 0, maxViews: 5000, rate: 32 },
      { minViews: 5000, maxViews: 50000, rate: 24 },
      { minViews: 50000, maxViews: null, rate: 16 }
    ]
  },
  { 
    id: 17, 
    brand: 'Uber Eats', 
    description: 'Film your food delivery moment', 
    ratePerThousand: 44, 
    maxEarnings: 700, 
    logo: spotifyLogo,
    image: foodDelivery,
    contentType: 'Food/Delivery',
    productVisibility: 'Show Uber Eats app or delivery',
    videoLength: '15-45 seconds',
    guidelines: [
      'Show the ordering process or delivery',
      'Capture the excitement',
      'Show the food reveal',
      'Mention convenience factor'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 44 },
      { minViews: 8000, maxViews: 80000, rate: 34 },
      { minViews: 80000, maxViews: null, rate: 24 }
    ]
  },
  { 
    id: 18, 
    brand: 'Tesla', 
    description: 'Show off your Tesla experience', 
    ratePerThousand: 70, 
    maxEarnings: 3000,
    logo: samsungLogo,
    image: electricCar,
    contentType: 'Automotive/Tech',
    productVisibility: 'Tesla vehicle clearly featured',
    videoLength: '20-60 seconds',
    guidelines: [
      'Showcase unique Tesla features',
      'Include driving footage if safe',
      'Show the interior tech',
      'High production quality required'
    ],
    tiers: [
      { minViews: 0, maxViews: 20000, rate: 70 },
      { minViews: 20000, maxViews: 200000, rate: 55 },
      { minViews: 200000, maxViews: null, rate: 40 }
    ]
  },
];

const Campaigns: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);
  const [viewMode, setViewMode] = useState<'scroll' | 'browse'>('browse');
  const [favorites, setFavorites] = useState<number[]>([]);

  // Fetch user favorites
  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const { data } = await supabase
          .from('favorites')
          .select('campaign_id')
          .eq('user_id', user.id);
        if (data) {
          // Extract campaign IDs (we're using mock data with number IDs, so we need to handle this)
          setFavorites(data.map(f => parseInt(f.campaign_id.split('-')[0]) || 0));
        }
      };
      fetchFavorites();
    }
  }, [user]);

  const toggleFavorite = async (campaignId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    const campaignUuid = `${campaignId}-0000-0000-0000-000000000000`;
    
    if (favorites.includes(campaignId)) {
      // Remove favorite
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('campaign_id', campaignUuid);
      setFavorites(favorites.filter(id => id !== campaignId));
    } else {
      // Add favorite
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, campaign_id: campaignUuid });
      setFavorites([...favorites, campaignId]);
    }
  };

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
    <div className="h-screen flex relative overflow-hidden">
      {/* Static Grainy Background */}
      <div className="absolute inset-0 pointer-events-none grainy-background" />
      <div className="noise-layer absolute inset-0 pointer-events-none" />
      
      {/* Left Sidebar */}
      <aside className="w-56 lg:w-52 flex flex-col relative z-10 backdrop-blur-md border-r border-white/40 dark:border-white/20 bg-gradient-to-b from-white/95 to-white/40 dark:from-white/10 dark:to-white/10">
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
        <nav className="flex flex-col px-3 gap-4 mt-8">
          <button className="text-lg lg:text-base font-bold text-foreground px-3 py-1.5 text-left transition-colors flex items-center gap-2">
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
            className="text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-2"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4ZM10.5 8.5C10 8.2 9.5 8.5 9.5 9V15C9.5 15.5 10 15.8 10.5 15.5L15.5 12.5C16 12.2 16 11.8 15.5 11.5L10.5 8.5Z" />
            </svg>
            Action
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-2"
          >
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
              <button className="w-full text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-2">
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

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col">
        {/* Top Filter Bar */}
        <div className="h-14 backdrop-blur-md border-b border-white/40 dark:border-white/20 flex items-center px-6 gap-3 shrink-0 bg-gradient-to-b from-white/95 to-white/40 dark:from-white/10 dark:to-white/10">
          <button className="px-4 py-1.5 rounded-full bg-black text-white text-sm font-medium">
            Featured
          </button>
          <button className="px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            Beauty
          </button>
          <button className="px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            Fashion
          </button>
          <button className="px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            Tech
          </button>
          <button className="px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            Food
          </button>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors flex items-center gap-1">
                  Sort by
                  <svg className="w-3 h-3 ml-1" viewBox="0 0 10 6" fill="none">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m1 1 4 4 4-4"/>
                  </svg>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                <DropdownMenuItem className="cursor-pointer">
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Deadline Soon
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {viewMode === 'scroll' ? (
          <>
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
                    className="aspect-[9/16] h-[calc(100vh-48px)] rounded-2xl border border-white/25 flex items-center justify-center relative overflow-hidden cursor-pointer transition-colors"
                    style={{ backgroundColor: 'hsla(220, 70%, 55%, 0.18)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', backdropFilter: 'blur(24px) saturate(180%)' }}
                  >
                    {idx === 0 ? (
                      <video 
                        src={campaignVideoPlaceholder} 
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                      />
                    ) : (
                      <span className="text-muted-foreground text-lg">Video {idx + 1}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
                    
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
          </>
        ) : (
          /* Browse Mode - Horizontal List Layout */
          <div className="relative flex-1 overflow-hidden">
            <div className="pt-8 pb-8 pl-8 pr-32 overflow-y-auto h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-2 gap-y-20 justify-items-start">
              {campaigns.map((campaign, index) => {
                const gradientColors = [
                  'rgba(34, 139, 34, 0.9)',    // Forest green (dark)
                  'rgba(97, 188, 70, 0.85)',   // Apple green (light)
                  'rgba(255, 140, 0, 0.9)',    // Dark orange
                  'rgba(251, 186, 0, 0.85)',   // Apple yellow
                  'rgba(220, 20, 60, 0.9)',    // Crimson red (dark)
                  'rgba(247, 148, 30, 0.85)',  // Apple orange (light)
                  'rgba(75, 0, 130, 0.9)',     // Indigo (dark purple)
                  'rgba(148, 103, 189, 0.85)', // Apple purple (light)
                  'rgba(0, 100, 180, 0.9)',    // Dark blue
                  'rgba(0, 168, 225, 0.85)',   // Apple blue (light)
                  'rgba(139, 69, 19, 0.9)',    // Saddle brown
                  'rgba(199, 21, 133, 0.9)',   // Medium violet red
                  'rgba(46, 139, 87, 0.9)',    // Sea green
                  'rgba(255, 69, 0, 0.9)',     // Red-orange
                  'rgba(106, 90, 205, 0.9)',   // Slate blue
                  'rgba(0, 139, 139, 0.9)',    // Dark cyan
                  'rgba(178, 34, 34, 0.9)',    // Firebrick
                  'rgba(72, 61, 139, 0.9)',    // Dark slate blue
                ];
                const gradientColor = gradientColors[index % gradientColors.length];
                
                return (
                  <div
                    key={campaign.id}
                    onClick={() => setSelectedCampaign(campaign)}
                    className="rounded overflow-hidden cursor-pointer hover:scale-[1.01] transition-all group flex flex-row relative border border-white/40 dark:border-white/20 max-w-[280px]"
                  >
                    {/* Left side - Image */}
                    <div className="relative w-20 md:w-24 flex-shrink-0 overflow-hidden">
                      <img src={campaign.image} alt={campaign.brand} className="w-full h-full object-cover" />
                      <div 
                        className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />
                      {/* Bottom fade */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                    
                    {/* Right side - Campaign info */}
                    <div className="flex-1 p-4 pt-3 pl-3 pb-2 flex flex-col justify-between relative bg-white/60 dark:bg-white/10 backdrop-blur-md">
                      <div className="relative z-10">
                        <div className="mb-1">
                          <span className="text-xs font-medium text-muted-foreground">{campaign.brand}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground">{campaign.description}</p>
                      </div>
                      <div className="relative z-10 mt-auto flex flex-row items-center justify-between">
                        <div className="inline-flex items-baseline gap-0.5">
                          <span className="text-2xl font-bold text-foreground">{campaign.maxEarnings.toLocaleString()}</span>
                          <span className="text-xs font-semibold text-foreground">sek</span>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(campaign.id, e)}
                          className="flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Heart 
                            className={`h-5 w-5 ${favorites.includes(campaign.id) ? 'fill-red-500 text-red-500' : 'text-black/25'}`}
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        )}
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

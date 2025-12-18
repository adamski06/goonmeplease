import React, { useEffect, useState } from 'react';
import { backgroundDelay } from '@/lib/backgroundDelay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, User, Settings, Moon, LogOut, Bookmark } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';

// Import campaign images for displaying favorites
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

import nikeLogo from '@/assets/logos/nike.png';
import spotifyLogo from '@/assets/logos/spotify.png';
import samsungLogo from '@/assets/logos/samsung.png';
import redbullLogo from '@/assets/logos/redbull.png';
import adobeLogo from '@/assets/logos/adobe.png';

// Mock campaigns data (should match Campaigns.tsx)
const allCampaigns = [
  { id: '00000000-0000-0000-0000-000000000001', brand: 'Nike', description: 'Show your workout routine', maxEarnings: 1000, logo: nikeLogo, image: fitnessWorkout },
  { id: '00000000-0000-0000-0000-000000000002', brand: 'Spotify', description: 'Share your music moments', maxEarnings: 1000, logo: spotifyLogo, image: musicLifestyle },
  { id: '00000000-0000-0000-0000-000000000003', brand: 'Samsung', description: 'Unbox the new Galaxy', maxEarnings: 1000, logo: samsungLogo, image: techUnboxing },
  { id: '00000000-0000-0000-0000-000000000004', brand: 'Red Bull', description: 'Capture extreme moments', maxEarnings: 1000, logo: redbullLogo, image: extremeSports },
  { id: '00000000-0000-0000-0000-000000000005', brand: 'Adobe', description: 'Show your creative process', maxEarnings: 1000, logo: adobeLogo, image: creativeDesign },
  { id: '00000000-0000-0000-0000-000000000006', brand: 'Samsung', description: 'Mobile photography tips', maxEarnings: 1000, logo: samsungLogo, image: mobileCreative },
  { id: '00000000-0000-0000-0000-000000000007', brand: 'Red Bull', description: 'Summer energy vibes', maxEarnings: 1000, logo: redbullLogo, image: summerDrink },
  { id: '00000000-0000-0000-0000-000000000008', brand: 'Spotify', description: 'Concert experience', maxEarnings: 1000, logo: spotifyLogo, image: entertainment },
  { id: '00000000-0000-0000-0000-000000000009', brand: 'Nike', description: 'Street style showcase', maxEarnings: 1000, logo: nikeLogo, image: streetStyle },
  { id: '00000000-0000-0000-0000-000000000010', brand: 'Red Bull', description: 'Adventure POV shots', maxEarnings: 1000, logo: redbullLogo, image: adventurePov },
  { id: '00000000-0000-0000-0000-000000000011', brand: 'Spotify', description: 'Morning coffee playlist', maxEarnings: 1000, logo: spotifyLogo, image: coffeeMoment },
  { id: '00000000-0000-0000-0000-000000000012', brand: 'Samsung', description: 'Gaming setup tour', maxEarnings: 1000, logo: samsungLogo, image: gaming },
  { id: '00000000-0000-0000-0000-000000000013', brand: 'Nike', description: 'Fashion forward looks', maxEarnings: 1000, logo: nikeLogo, image: fashionStyle },
  { id: '00000000-0000-0000-0000-000000000014', brand: 'Samsung', description: 'Tech unboxing haul', maxEarnings: 1000, logo: samsungLogo, image: unboxingHaul },
  { id: '00000000-0000-0000-0000-000000000015', brand: 'Adobe', description: 'Home office setup', maxEarnings: 1000, logo: adobeLogo, image: homeInterior },
  { id: '00000000-0000-0000-0000-000000000016', brand: 'Red Bull', description: 'Quick meal energy', maxEarnings: 1000, logo: redbullLogo, image: fastFood },
  { id: '00000000-0000-0000-0000-000000000017', brand: 'Spotify', description: 'Food delivery unboxing', maxEarnings: 1000, logo: spotifyLogo, image: foodDelivery },
  { id: '00000000-0000-0000-0000-000000000018', brand: 'Samsung', description: 'Electric car review', maxEarnings: 1000, logo: samsungLogo, image: electricCar },
];

const Activity: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Fetch user favorites
  useEffect(() => {
    if (user) {
      const fetchFavorites = async () => {
        const { data } = await supabase
          .from('favorites')
          .select('campaign_id')
          .eq('user_id', user.id);
        if (data) {
          setFavorites(data.map(f => f.campaign_id));
        }
      };
      fetchFavorites();
    }
  }, [user]);

  const removeFavorite = async (campaignId: string) => {
    if (!user) return;
    await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('campaign_id', campaignId);
    setFavorites(favorites.filter(id => id !== campaignId));
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const favoriteCampaigns = allCampaigns.filter(c => favorites.includes(c.id));

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
          <button className="text-lg lg:text-base font-bold text-foreground px-3 py-1.5 text-left transition-all flex items-center gap-3">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4ZM10.5 8.5C10 8.2 9.5 8.5 9.5 9V15C9.5 15.5 10 15.8 10.5 15.5L15.5 12.5C16 12.2 16 11.8 15.5 11.5L10.5 8.5Z" />
            </svg>
            Action
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-3"
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
          <button className="flex flex-col items-center gap-1 pt-1 w-12">
            <svg className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM10 8C9.5 7.7 9 8 9 8.5V15.5C9 16 9.5 16.3 10 16L16 12.5C16.5 12.2 16.5 11.8 16 11.5L10 8Z" />
            </svg>
            <span className="text-[10px] font-semibold text-black">Action</span>
          </button>
          <button className="flex flex-col items-center gap-1 pt-1 w-12">
            <svg className="h-6 w-6 text-black/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="text-[10px] text-black/40">Alerts</span>
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
              <AvatarFallback className="bg-black/10 text-black text-[10px] font-medium">
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] text-black/40">Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 pb-24 md:pb-8 relative z-10 overflow-y-auto">
        <h1 className="text-3xl font-bold text-black md:text-foreground mb-6">Saved</h1>
        
        {favoriteCampaigns.length === 0 ? (
          <p className="text-black/60 md:text-muted-foreground">No saved campaigns yet. Save some campaigns to see them here!</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {favoriteCampaigns.map((campaign) => (
              <div 
                key={campaign.id}
                className="flex-shrink-0 w-24 cursor-pointer group"
                onClick={() => navigate('/')}
              >
                {/* Image */}
                <div className="relative aspect-[9/16] rounded overflow-hidden mb-1">
                  <img src={campaign.image} alt={campaign.brand} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(campaign.id);
                    }}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Bookmark className="h-3 w-3 fill-foreground text-foreground" />
                  </button>
                </div>
                {/* Brand name */}
                <p className="text-xs font-semibold text-foreground truncate">{campaign.brand}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Activity;
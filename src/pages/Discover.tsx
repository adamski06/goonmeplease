import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Plus, User } from 'lucide-react';
import tiktokIcon from '@/assets/tiktok-icon.png';
import tiktokPlatformLogo from '@/assets/platforms/tiktok.png';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import defaultAvatar from '@/assets/default-avatar.png';
import { Button } from '@/components/ui/button';

// Campaign images
import fitnessWorkout from '@/assets/campaigns/fitness-workout.jpg';
import musicLifestyle from '@/assets/campaigns/music-lifestyle.jpg';
import techUnboxing from '@/assets/campaigns/tech-unboxing.jpg';
import extremeSports from '@/assets/campaigns/extreme-sports.jpg';
import creativeDesign from '@/assets/campaigns/creative-design.jpg';
import mobileCreative from '@/assets/campaigns/mobile-creative.jpg';
import summerDrink from '@/assets/campaigns/summer-drink.jpg';
import entertainment from '@/assets/campaigns/entertainment.jpg';
import coffeeMoment from '@/assets/campaigns/coffee-moment.jpg';
import fashionStyle from '@/assets/campaigns/fashion-style.jpg';
import fastFood from '@/assets/campaigns/fast-food.jpg';
import foodDelivery from '@/assets/campaigns/food-delivery.jpg';
import homeInterior from '@/assets/campaigns/home-interior.jpg';

// Logos
import nikeLogo from '@/assets/logos/nike.png';
import spotifyLogo from '@/assets/logos/spotify.png';
import samsungLogo from '@/assets/logos/samsung.png';
import redbullLogo from '@/assets/logos/redbull.png';
import adobeLogo from '@/assets/logos/adobe.png';

// Example images
import spotifyExample1 from '@/assets/examples/spotify-example-1.jpg';
import starbucksExample1 from '@/assets/examples/starbucks-example-1.jpg';
import cocacolaExample1 from '@/assets/examples/cocacola-example-1.jpg';
import redbullExample1 from '@/assets/examples/redbull-example-1.jpg';
import netflixExample1 from '@/assets/examples/netflix-example-1.jpg';
import goproExample1 from '@/assets/examples/gopro-example-1.jpg';
import playstationExample1 from '@/assets/examples/playstation-example-1.jpg';

// Mock campaign data (same as Campaigns.tsx)
const campaigns = [
  { 
    id: '00000000-0000-0000-0000-000000000001', 
    brand: 'Spotify', 
    title: 'Share your music discovery moment',
    description: 'We want to see how you discover new music on Spotify.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: musicLifestyle,
    contentType: 'Music Discovery/Reaction',
    productVisibility: 'Spotify app interface must be visible for at least 3 seconds',
    videoLength: '15-45 seconds',
    guidelines: ['Show the Spotify app clearly on your phone screen', 'React genuinely to discovering a new song'],
    tiers: [{ minViews: 0, maxViews: 5000, rate: 35 }, { minViews: 5000, maxViews: 50000, rate: 28 }],
    exampleImages: [spotifyExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000002', 
    brand: 'Starbucks', 
    title: 'Film your morning coffee run',
    description: 'Show us your morning Starbucks run.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: nikeLogo,
    image: coffeeMoment,
    contentType: 'Lifestyle/Morning Routine',
    productVisibility: 'Starbucks cup with logo clearly visible',
    videoLength: '15-30 seconds',
    guidelines: ['Cup must be recognizable as Starbucks', 'Show your drink order'],
    tiers: [{ minViews: 0, maxViews: 5000, rate: 32 }],
    exampleImages: [starbucksExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000003', 
    brand: 'McDonald\'s', 
    title: 'Try our new menu items',
    description: 'We\'re promoting our new menu items.', 
    ratePerThousand: 40, 
    maxEarnings: 1000,
    logo: nikeLogo,
    image: fastFood,
    contentType: 'Food Review/Reaction',
    productVisibility: 'McDonald\'s packaging visible',
    videoLength: '15-45 seconds',
    guidelines: ['Show the McDonald\'s bag or packaging', 'Give your honest first-bite reaction'],
    tiers: [{ minViews: 0, maxViews: 8000, rate: 38 }],
    exampleImages: [cocacolaExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000004', 
    brand: 'Red Bull', 
    title: 'Show us what gives you wings',
    description: 'Film yourself cracking open a Red Bull.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: redbullLogo,
    image: extremeSports,
    contentType: 'Energy/Lifestyle',
    productVisibility: 'Red Bull can visible',
    videoLength: '15-30 seconds',
    guidelines: ['Capture the can crack sound if possible', 'Show yourself drinking before an activity'],
    tiers: [{ minViews: 0, maxViews: 10000, rate: 42 }],
    exampleImages: [redbullExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000005', 
    brand: 'Adobe', 
    title: 'Show your creative editing process',
    description: 'Show your creative process using any Adobe app.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: adobeLogo,
    image: creativeDesign,
    contentType: 'Creative Process/Tutorial',
    productVisibility: 'Adobe software interface visible',
    videoLength: '15-45 seconds',
    guidelines: ['Show the Adobe app interface clearly', 'Include a before/after transformation'],
    tiers: [{ minViews: 0, maxViews: 10000, rate: 55 }],
    exampleImages: [adobeLogo]
  },
  { 
    id: '00000000-0000-0000-0000-000000000006', 
    brand: 'Uber Eats', 
    title: 'Film your food delivery experience',
    description: 'Film your next Uber Eats order.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: foodDelivery,
    contentType: 'Food Delivery/Lifestyle',
    productVisibility: 'Show Uber Eats app',
    videoLength: '20-45 seconds',
    guidelines: ['Show the ordering process in the app', 'Capture the delivery arrival moment'],
    tiers: [{ minViews: 0, maxViews: 8000, rate: 40 }],
    exampleImages: [cocacolaExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000007', 
    brand: 'Coca-Cola', 
    title: 'Capture a refreshing moment',
    description: 'Grab a Coke and film a chill moment.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: summerDrink,
    contentType: 'Lifestyle/Refreshment',
    productVisibility: 'Coca-Cola bottle or can clearly visible',
    videoLength: '10-25 seconds',
    guidelines: ['Show the Coca-Cola product clearly', 'Capture the fizz or first sip'],
    tiers: [{ minViews: 0, maxViews: 8000, rate: 36 }],
    exampleImages: [cocacolaExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000008', 
    brand: 'Netflix', 
    title: 'React to your favorite show',
    description: 'We want genuine show reactions.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: samsungLogo,
    image: entertainment,
    contentType: 'Entertainment/Reaction',
    productVisibility: 'Netflix interface visible',
    videoLength: '15-45 seconds',
    guidelines: ['Show Netflix interface briefly', 'React genuinely to a moment'],
    tiers: [{ minViews: 0, maxViews: 10000, rate: 44 }],
    exampleImages: [netflixExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000009', 
    brand: 'Duolingo', 
    title: 'Show your language learning streak',
    description: 'Show your Duolingo streak or study session.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: redbullLogo,
    image: mobileCreative,
    contentType: 'Education/Lifestyle',
    productVisibility: 'Duolingo app visible',
    videoLength: '15-30 seconds',
    guidelines: ['Show the Duolingo app interface', 'Lean into the Duolingo owl humor'],
    tiers: [{ minViews: 0, maxViews: 8000, rate: 38 }],
    exampleImages: [adobeLogo]
  },
  { 
    id: '00000000-0000-0000-0000-000000000010', 
    brand: 'IKEA', 
    title: 'Take us on your IKEA trip',
    description: 'Film your IKEA trip or show off a haul.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: adobeLogo,
    image: homeInterior,
    contentType: 'Home/Shopping',
    productVisibility: 'IKEA store, products visible',
    videoLength: '20-60 seconds',
    guidelines: ['Show IKEA store visit or products at home', 'Assembly content is a plus'],
    tiers: [{ minViews: 0, maxViews: 10000, rate: 45 }],
    exampleImages: [goproExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000012', 
    brand: 'Notion', 
    title: 'Show how you organize your life',
    description: 'Show us how you organize with Notion.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: mobileCreative,
    contentType: 'Productivity/Tech',
    productVisibility: 'Notion interface visible',
    videoLength: '20-45 seconds',
    guidelines: ['Show your actual Notion setup', 'Walk through your workflow'],
    tiers: [{ minViews: 0, maxViews: 10000, rate: 48 }],
    exampleImages: [playstationExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000013', 
    brand: 'H&M', 
    title: 'Style an affordable outfit',
    description: 'Film a haul video from your recent H&M shopping trip.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: samsungLogo,
    image: fashionStyle,
    contentType: 'Fashion/Haul',
    productVisibility: 'H&M clothing with tags',
    videoLength: '20-45 seconds',
    guidelines: ['Show the clothing items clearly', 'Mention prices when possible'],
    tiers: [{ minViews: 0, maxViews: 10000, rate: 42 }],
    exampleImages: []
  },
];

const Discover: React.FC = () => {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [selectedCampaign, setSelectedCampaign] = useState<typeof campaigns[0] | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);

  const handleSelectCampaign = (campaign: typeof campaigns[0]) => {
    if (featuredScrollRef.current) {
      savedScrollPosition.current = featuredScrollRef.current.scrollTop;
    }
    setSelectedCampaign(campaign);
  };

  const handleBackFromDetail = () => {
    setSelectedCampaign(null);
    requestAnimationFrame(() => {
      if (featuredScrollRef.current) {
        featuredScrollRef.current.scrollTop = savedScrollPosition.current;
      }
    });
  };

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

  const toggleFavorite = async (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    if (favorites.includes(campaignId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('campaign_id', campaignId);
      setFavorites(favorites.filter(id => id !== campaignId));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, campaign_id: campaignId });
      setFavorites([...favorites, campaignId]);
    }
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
    <div className="h-screen flex relative overflow-hidden">
      {/* White background for mobile */}
      <div className="md:hidden absolute inset-0 bg-white" />
      {/* Static Grainy Background - desktop only */}
      <div className="hidden md:block absolute inset-0 pointer-events-none grainy-background" />
      <div className="hidden md:block noise-layer absolute inset-0 pointer-events-none" />

      {/* Mobile Bottom Navigation Bar - hidden when in ad detail */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-2 h-20 safe-area-bottom bg-white border-t border-black/10 ${selectedCampaign ? 'hidden' : ''}`}>
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
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className="h-6 w-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
            </svg>
            <span className="text-[10px] font-semibold text-black">Discover</span>
          </button>
          <button 
            onClick={() => user ? navigate('/activity') : setShowAuthPrompt(true)}
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
          <button 
            onClick={() => user ? navigate('/profile') : setShowAuthPrompt(true)}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            {user ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
                <AvatarFallback className="text-[10px] font-medium bg-black/10 text-black">
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className="h-6 w-6 text-black/40" />
            )}
            <span className="text-[10px] text-black/40">Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Mobile: Campaign detail as expanding pill overlay */}
        {selectedCampaign && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/60" onClick={handleBackFromDetail}>
            {/* Full image background */}
            <div className="absolute inset-0">
              <img src={selectedCampaign.image} alt={selectedCampaign.brand} className="w-full h-full object-cover" />
              <div 
                className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
              />
            </div>
            
            {/* Expanded white pill */}
            <div 
              className="absolute left-3 right-3 bottom-3 rounded-[48px] overflow-hidden z-20 animate-fade-in"
              style={{
                maxHeight: 'calc(100dvh - 136px)',
                background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                border: '1.5px solid rgba(255,255,255,0.8)',
                boxShadow: '0 -8px 40px rgba(0,0,0,0.25), 0 12px 40px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.05)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100dvh - 136px)' }}>
                {/* Drag handle indicator */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-black/20 rounded-full" />
                </div>
                
                {/* Header with brand */}
                <div className="flex items-center gap-3 px-5 pt-2 pb-3 border-b border-black/10">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={selectedCampaign.logo}
                      alt={selectedCampaign.brand}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-base font-bold text-black font-montserrat flex-1">
                    {selectedCampaign.brand}
                  </h2>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {/* Description */}
                  <p className="text-sm text-black font-medium font-jakarta leading-relaxed mb-5">
                    {selectedCampaign.description}
                  </p>

                  {/* Requirements - glass effect */}
                  <div 
                    className="rounded-xl p-4 mb-4"
                    style={{
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 100%)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <h3 className="text-sm font-semibold text-black mb-2 font-montserrat">Requirements</h3>
                    <ul className="space-y-1.5">
                      {selectedCampaign.guidelines.map((guideline, idx) => (
                        <li key={idx} className="text-sm text-black/80 font-jakarta flex items-start gap-2">
                          <span className="text-black/40">•</span>
                          {guideline}
                        </li>
                      ))}
                    </ul>

                    {/* Example images */}
                    {selectedCampaign.exampleImages && selectedCampaign.exampleImages.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {selectedCampaign.exampleImages.slice(0, 2).map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={img} alt={`Example ${i + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment Details - green glass effect */}
                  <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-2xl p-4 mb-4 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                    <h3 className="text-sm font-semibold text-white mb-2 font-montserrat">Payment Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80 font-jakarta">Max earnings</span>
                        <span className="text-sm font-bold text-white font-montserrat">{selectedCampaign.maxEarnings.toLocaleString()} sek</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80 font-jakarta">Rate per 1K views</span>
                        <span className="text-sm font-bold text-white font-montserrat">{selectedCampaign.ratePerThousand} sek</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/80 font-jakarta">Platform</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium text-white font-montserrat">TikTok</span>
                          <div className="w-4 h-4 rounded-full overflow-hidden">
                            <img src={tiktokPlatformLogo} alt="TikTok" className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed CTA at bottom */}
                <div className="px-5 pb-8 pt-3 flex items-center justify-center gap-3 flex-shrink-0">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-sm font-bold rounded-full bg-black hover:bg-black/90 text-white flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Submit Content
                  </Button>
                  <button
                    onClick={(e) => toggleFavorite(selectedCampaign.id, e)}
                    className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center flex-shrink-0"
                  >
                    <Bookmark
                      className={`h-5 w-5 ${favorites.includes(selectedCampaign.id) ? 'fill-black text-black' : 'text-black/50'}`}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Header Bar with safe area */}
        <div className="md:hidden flex flex-col border-b border-black/10 bg-white safe-area-top">
          <div className="flex items-center justify-center px-4 py-3">
            <span className="text-base font-semibold text-black">Discover</span>
          </div>
        </div>

        {/* Browse Mode - Grid Layout with Home-style cards */}
        <div ref={featuredScrollRef} className="relative flex-1 overflow-y-auto pt-4 pb-24 md:pt-6 md:pb-8 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          <div className="px-3 md:pl-8 md:pr-8">
            <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2.5 md:gap-x-6 md:gap-y-8">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  onClick={() => handleSelectCampaign(campaign)}
                  className="relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all w-full md:w-[200px] rounded-[32px] aspect-[3/4]"
                >
                  {/* Full image background */}
                  <img src={campaign.image} alt={campaign.brand} className="absolute inset-0 w-full h-full object-cover rounded-[32px]" />
                  
                  {/* Noise overlay */}
                  <div 
                    className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none rounded-[32px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  
                  {/* Brand name top left */}
                  <span className="absolute top-3 left-3 text-[10px] font-medium text-white font-montserrat drop-shadow-md">{campaign.brand}</span>
                  
                  {/* Bottom pill - with margin from edges */}
                  <div 
                    className="absolute bottom-2 left-2 right-2 h-[52px] rounded-[26px] px-3 flex items-center justify-between"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(240,240,240,0.95) 100%)',
                      border: '1.5px solid rgba(255,255,255,0.8)',
                      boxShadow: '0 -4px 20px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1)',
                    }}
                  >
                    {/* Green earnings pill */}
                    <div className="bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-[16px] px-3 py-1.5 flex items-baseline gap-0.5 border border-emerald-400/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <span className="text-sm font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                      <span className="text-[9px] font-semibold text-white/80 font-montserrat">sek</span>
                    </div>
                    
                    {/* TikTok logo */}
                    <div className="bg-gradient-to-b from-gray-700 to-gray-900 rounded-full h-8 w-8 flex items-center justify-center border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                      <img
                        src={tiktokIcon}
                        alt="TikTok"
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Auth Prompt Dialog */}
      <Dialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Join Jarla</DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground mb-6">
            Create an account to save campaigns, track your submissions, and start earning.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                setShowAuthPrompt(false);
                navigate('/auth?mode=signup');
              }}
              className="w-full py-3 bg-foreground text-background rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Create account
            </button>
            <button 
              onClick={() => {
                setShowAuthPrompt(false);
                navigate('/auth?mode=login');
              }}
              className="w-full py-3 border border-foreground/20 rounded-full text-sm font-medium hover:bg-foreground/5 transition-colors"
            >
              Log in
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Discover;

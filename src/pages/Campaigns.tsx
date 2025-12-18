import React, { useEffect, useState, useMemo, useRef } from 'react';
import { backgroundDelay } from '@/lib/backgroundDelay';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity, LayoutGrid, Play, Menu, Settings, LogOut, User, Moon, Bookmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import jarlaLogo from '@/assets/jarla-logo.png';
import defaultAvatar from '@/assets/default-avatar.png';
import campaignVideoPlaceholder from '@/assets/campaign-video-placeholder.mp4';
import nikeLogo from '@/assets/logos/nike.png';
import spotifyLogo from '@/assets/logos/spotify.png';
import samsungLogo from '@/assets/logos/samsung.png';
import redbullLogo from '@/assets/logos/redbull.png';
import adobeLogo from '@/assets/logos/adobe.png';
import CampaignDetailView from '@/components/CampaignDetailView';

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

// Example images for product placement
import nikeExample1 from '@/assets/examples/nike-example-1.jpg';
import nikeExample2 from '@/assets/examples/nike-example-2.jpg';
import nikeExample3 from '@/assets/examples/nike-example-3.jpg';
import spotifyExample1 from '@/assets/examples/spotify-example-1.jpg';
import samsungExample1 from '@/assets/examples/samsung-example-1.jpg';
import redbullExample1 from '@/assets/examples/redbull-example-1.jpg';
import adobeExample1 from '@/assets/examples/adobe-example-1.jpg';
import cocacolaExample1 from '@/assets/examples/cocacola-example-1.jpg';
import appleExample1 from '@/assets/examples/apple-example-1.jpg';
import netflixExample1 from '@/assets/examples/netflix-example-1.jpg';
import adidasExample1 from '@/assets/examples/adidas-example-1.jpg';
import goproExample1 from '@/assets/examples/gopro-example-1.jpg';
import starbucksExample1 from '@/assets/examples/starbucks-example-1.jpg';
import playstationExample1 from '@/assets/examples/playstation-example-1.jpg';
import hmExample1 from '@/assets/examples/hm-example-1.jpg';

type FilterType = 'foryou' | 'featured';

// Extended mock campaign data
const campaigns = [
  { 
    id: '00000000-0000-0000-0000-000000000001', 
    brand: 'Spotify', 
    title: 'Share your music discovery moment',
    description: 'We want to see how you discover new music on Spotify. Film yourself scrolling through your Discover Weekly or Release Radar, find a song you genuinely like, and show your authentic reaction when you hear it for the first time. This works best when you\'re doing something casual - cooking, getting ready, or just chilling at home.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: musicLifestyle,
    contentType: 'Music Discovery/Reaction',
    productVisibility: 'Spotify app interface must be visible for at least 3 seconds',
    videoLength: '15-45 seconds',
    guidelines: [
      'Show the Spotify app clearly on your phone screen',
      'React genuinely to discovering a new song',
      'Mention "Discover Weekly" or "Release Radar" in your caption',
      'No skip - let the song play for at least 10 seconds'
    ],
    tiers: [
      { minViews: 0, maxViews: 5000, rate: 35 },
      { minViews: 5000, maxViews: 50000, rate: 28 },
      { minViews: 50000, maxViews: null, rate: 20 }
    ],
    exampleImages: [spotifyExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000002', 
    brand: 'Starbucks', 
    title: 'Film your morning coffee run',
    description: 'Show us your morning Starbucks run. We\'re looking for authentic "day in my life" style content where you pick up your usual order, customize it if you do, and enjoy your first sip. Works great if you film the walk to the store, ordering process, or the moment you get your drink. No scripts needed - just your real morning routine.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: nikeLogo,
    image: coffeeMoment,
    contentType: 'Lifestyle/Morning Routine',
    productVisibility: 'Starbucks cup with logo clearly visible',
    videoLength: '15-30 seconds',
    guidelines: [
      'Cup must be recognizable as Starbucks',
      'Show your drink order or mention what you got',
      'Authentic morning vibes - no heavy makeup or staging',
      'First sip reaction is a plus'
    ],
    tiers: [
      { minViews: 0, maxViews: 5000, rate: 32 },
      { minViews: 5000, maxViews: 50000, rate: 24 },
      { minViews: 50000, maxViews: null, rate: 18 }
    ],
    exampleImages: [starbucksExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000003', 
    brand: 'McDonald\'s', 
    title: 'Try our new menu items',
    description: 'We\'re promoting our new menu items and want real customers showing their genuine reactions. Visit any McDonald\'s, order something from the menu (we\'ll reimburse up to 150 SEK), and film yourself trying it. Focus on the unwrapping, the first bite, and your honest reaction. This isn\'t about perfection - we want authentic "I just got McDonald\'s" energy.', 
    ratePerThousand: 40, 
    maxEarnings: 1000,
    logo: nikeLogo,
    image: fastFood,
    contentType: 'Food Review/Reaction',
    productVisibility: 'McDonald\'s packaging and food clearly visible',
    videoLength: '15-45 seconds',
    guidelines: [
      'Show the McDonald\'s bag or packaging',
      'Include unwrapping/unboxing the food',
      'Give your honest first-bite reaction',
      'Mention what you ordered in caption or voiceover'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 38 },
      { minViews: 8000, maxViews: 80000, rate: 28 },
      { minViews: 80000, maxViews: null, rate: 20 }
    ],
    exampleImages: [cocacolaExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000004', 
    brand: 'Red Bull', 
    title: 'Show us what gives you wings',
    description: 'Film yourself cracking open a Red Bull before doing something that requires energy - gym session, late night study grind, gaming marathon, early morning, whatever fits your life. We want the can crack sound, the first sip, and then you getting into your activity. Keep it natural and show us what gives you wings.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: redbullLogo,
    image: extremeSports,
    contentType: 'Energy/Lifestyle',
    productVisibility: 'Red Bull can visible for at least 3 seconds',
    videoLength: '15-30 seconds',
    guidelines: [
      'Capture the can crack sound if possible',
      'Show yourself drinking before an activity',
      'Keep it natural - gym, gaming, studying all work',
      'High energy edit style preferred'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 42 },
      { minViews: 10000, maxViews: 100000, rate: 32 },
      { minViews: 100000, maxViews: null, rate: 24 }
    ],
    exampleImages: [redbullExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000005', 
    brand: 'Adobe', 
    title: 'Show your creative editing process',
    description: 'Show your creative process using any Adobe app - Lightroom, Photoshop, Premiere, whatever you actually use. We want to see a quick before/after transformation or a sped-up edit session. This is perfect for creators who already edit their content. Show us a 10-second edit that took you 30 minutes and let people see the magic.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: adobeLogo,
    image: creativeDesign,
    contentType: 'Creative Process/Tutorial',
    productVisibility: 'Adobe software interface visible during edit',
    videoLength: '15-45 seconds',
    guidelines: [
      'Show the Adobe app interface clearly',
      'Include a before/after or transformation',
      'Mention which Adobe tool you\'re using',
      'Sped-up editing works great'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 55 },
      { minViews: 10000, maxViews: 100000, rate: 42 },
      { minViews: 100000, maxViews: null, rate: 32 }
    ],
    exampleImages: [adobeLogo]
  },
  { 
    id: '00000000-0000-0000-0000-000000000006', 
    brand: 'Uber Eats', 
    title: 'Film your food delivery experience',
    description: 'Film your next Uber Eats order from start to finish. We want to see you scrolling through the app, deciding what to get, placing the order, and then the satisfying moment when the food arrives. The food reveal and first bite are key - that\'s what makes people want to order. Works especially well for late night cravings or lazy Sunday content.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: foodDelivery,
    contentType: 'Food Delivery/Lifestyle',
    productVisibility: 'Show Uber Eats app and delivered food',
    videoLength: '20-45 seconds',
    guidelines: [
      'Show the ordering process in the app',
      'Capture the delivery arrival moment',
      'Include the food reveal and first bite',
      'Mention what you ordered'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 40 },
      { minViews: 8000, maxViews: 80000, rate: 30 },
      { minViews: 80000, maxViews: null, rate: 22 }
    ],
    exampleImages: [cocacolaExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000007', 
    brand: 'Coca-Cola', 
    title: 'Capture a refreshing moment',
    description: 'Grab a Coke and film a chill moment - could be at a restaurant, at home watching something, hanging with friends, or just taking a break from your day. We\'re not looking for anything over-produced, just that satisfying first sip and the sound of the fizz. Summer vibes, hangout vibes, any vibe works as long as it feels real.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: summerDrink,
    contentType: 'Lifestyle/Refreshment',
    productVisibility: 'Coca-Cola bottle or can clearly visible',
    videoLength: '10-25 seconds',
    guidelines: [
      'Show the Coca-Cola product clearly',
      'Capture the fizz or first sip',
      'Keep it casual and authentic',
      'Friends, food, or chill moments work great'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 36 },
      { minViews: 8000, maxViews: 80000, rate: 28 },
      { minViews: 80000, maxViews: null, rate: 20 }
    ],
    exampleImages: [cocacolaExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000008', 
    brand: 'Netflix', 
    title: 'React to your favorite show',
    description: 'We want genuine show reactions - find a new series on Netflix, film yourself watching a key moment (no spoilers!), and show your real reaction. This works best with trending shows or new releases. The setup is simple: show yourself settling in to watch, then cut to your reaction. "Can\'t believe that just happened" energy is what we\'re after.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: samsungLogo,
    image: entertainment,
    contentType: 'Entertainment/Reaction',
    productVisibility: 'Netflix interface or TV showing Netflix content',
    videoLength: '15-45 seconds',
    guidelines: [
      'Show Netflix interface briefly',
      'React genuinely to a moment (no fake reactions)',
      'No major spoilers - keep it vague',
      'Mention the show name in caption'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 44 },
      { minViews: 10000, maxViews: 100000, rate: 34 },
      { minViews: 100000, maxViews: null, rate: 24 }
    ],
    exampleImages: [netflixExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000009', 
    brand: 'Duolingo', 
    title: 'Show your language learning streak',
    description: 'Show your Duolingo streak or a study session. We love content about maintaining streaks, learning new words, or the panic of almost losing your streak. Film yourself doing a quick lesson, reacting to getting something wrong, or celebrating a milestone. The owl memes are encouraged - lean into the Duolingo humor.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: redbullLogo,
    image: mobileCreative,
    contentType: 'Education/Lifestyle',
    productVisibility: 'Duolingo app visible on screen',
    videoLength: '15-30 seconds',
    guidelines: [
      'Show the Duolingo app interface',
      'Streak content or lesson reactions work great',
      'Lean into the Duolingo owl humor',
      'Mention what language you\'re learning'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 38 },
      { minViews: 8000, maxViews: 80000, rate: 28 },
      { minViews: 80000, maxViews: null, rate: 20 }
    ],
    exampleImages: [adobeExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000010', 
    brand: 'IKEA', 
    title: 'Take us on your IKEA trip',
    description: 'Film your IKEA trip or show off a recent IKEA haul. We want the full experience - navigating the store, finding your items, the checkout line, loading the car, and ideally a quick assembly montage. Or just film a room tour featuring IKEA furniture you already own. Swedish meatball content is also welcome.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: adobeLogo,
    image: homeInterior,
    contentType: 'Home/Shopping',
    productVisibility: 'IKEA store, products, or furniture visible',
    videoLength: '20-60 seconds',
    guidelines: [
      'Show IKEA store visit or products at home',
      'Assembly content is a plus',
      'Room tours featuring IKEA items work',
      'Tag specific product names if known'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 45 },
      { minViews: 10000, maxViews: 100000, rate: 35 },
      { minViews: 100000, maxViews: null, rate: 26 }
    ],
    exampleImages: [goproExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000011', 
    brand: 'Chipotle', 
    title: 'Show us your order',
    description: 'Show us your Chipotle order - whether you\'re eating in, getting takeout, or ordering ahead on the app. We want to see your customization process (the bowl assembly is satisfying content), and your first bite reaction. Bonus points for showing portion sizes, secret menu items, or your go-to order combination.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: nikeLogo,
    image: fastFood,
    contentType: 'Food/Restaurant',
    productVisibility: 'Chipotle food and branding visible',
    videoLength: '15-40 seconds',
    guidelines: [
      'Show your order being made or the final bowl',
      'Include what you customized',
      'First bite reaction is key',
      'Mobile order content works too'
    ],
    tiers: [
      { minViews: 0, maxViews: 6000, rate: 34 },
      { minViews: 6000, maxViews: 60000, rate: 26 },
      { minViews: 60000, maxViews: null, rate: 18 }
    ],
    exampleImages: [starbucksExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000012', 
    brand: 'Notion', 
    title: 'Show how you organize your life',
    description: 'Show us how you organize your life with Notion. Whether it\'s a productivity setup, habit tracker, content calendar, or just your daily to-do list - we want to see your system. Quick screenshare walkthroughs or "how I plan my week" content performs great. The aesthetic template tours are especially popular.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: mobileCreative,
    contentType: 'Productivity/Tech',
    productVisibility: 'Notion interface visible throughout',
    videoLength: '20-45 seconds',
    guidelines: [
      'Show your actual Notion setup (or a demo)',
      'Walk through your workflow or system',
      'Mention what you use Notion for',
      'Aesthetic templates get extra engagement'
    ],
    tiers: [
      { minViews: 0, maxViews: 10000, rate: 48 },
      { minViews: 10000, maxViews: 100000, rate: 36 },
      { minViews: 100000, maxViews: null, rate: 28 }
    ],
    exampleImages: [playstationExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000013', 
    brand: 'H&M', 
    title: 'Style an affordable outfit',
    description: 'Film a haul video from your recent H&M shopping trip or show us how you style H&M pieces you already own. We\'re looking for affordable fashion content - the kind where you share prices and help people recreate looks without breaking the bank. Try-on content, outfit checks, or "building an outfit for under 500 SEK" style videos work great.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: samsungLogo,
    image: fashionStyle,
    contentType: 'Fashion/Haul',
    productVisibility: 'H&M tags or store branding visible',
    videoLength: '20-45 seconds',
    guidelines: [
      'Show H&M items with tags or receipts',
      'Include prices if possible',
      'Try-on content performs best',
      'Share your honest opinions on quality'
    ],
    tiers: [
      { minViews: 0, maxViews: 7000, rate: 36 },
      { minViews: 7000, maxViews: 70000, rate: 28 },
      { minViews: 70000, maxViews: null, rate: 20 }
    ],
    exampleImages: [hmExample1]
  },
  { 
    id: '00000000-0000-0000-0000-000000000014', 
    brand: 'Amazon Prime', 
    title: 'React to your fast delivery',
    description: 'Show us the Prime delivery experience or react to something you ordered arriving faster than expected. Same-day and next-day delivery reactions perform really well. Film the notification, the doorbell moment, and the unboxing. "I literally just ordered this yesterday" content is what we\'re looking for.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: redbullLogo,
    image: unboxingHaul,
    contentType: 'Delivery/Unboxing',
    productVisibility: 'Amazon Prime packaging visible',
    videoLength: '15-40 seconds',
    guidelines: [
      'Show Amazon Prime packaging or app',
      'React to fast delivery times',
      'Include the unboxing moment',
      'Genuine surprise reactions work best'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 40 },
      { minViews: 8000, maxViews: 80000, rate: 30 },
      { minViews: 80000, maxViews: null, rate: 22 }
    ]
  },
  { 
    id: '00000000-0000-0000-0000-000000000015', 
    brand: 'Subway', 
    title: 'Build your perfect sandwich',
    description: 'Film your Subway order - the sandwich building process is oddly satisfying content. We want to see your customization choices, the assembly line, and your first bite. "My $100 Subway order" content that shows multiple sandwiches also performs well. Show us your go-to combination or try something new.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: adobeLogo,
    image: fastFood,
    contentType: 'Food/Restaurant',
    productVisibility: 'Subway branding and food visible',
    videoLength: '15-35 seconds',
    guidelines: [
      'Film the sandwich assembly process',
      'Show your customization choices',
      'Include the first bite reaction',
      'Mention your order in the caption'
    ],
    tiers: [
      { minViews: 0, maxViews: 5000, rate: 30 },
      { minViews: 5000, maxViews: 50000, rate: 22 },
      { minViews: 50000, maxViews: null, rate: 16 }
    ]
  },
  { 
    id: '00000000-0000-0000-0000-000000000016', 
    brand: 'Canva', 
    title: 'Create something in 60 seconds',
    description: 'Show how you use Canva to create something - Instagram posts, thumbnails, presentations, whatever you actually use it for. Quick design tutorials or "watch me make this in 60 seconds" content performs great. The before/after transformations and template customizations are especially popular.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: nikeLogo,
    image: creativeDesign,
    contentType: 'Design/Tutorial',
    productVisibility: 'Canva interface visible during design',
    videoLength: '15-45 seconds',
    guidelines: [
      'Show the Canva interface',
      'Create something useful or aesthetic',
      'Speed up the process if needed',
      'Share tips or tricks you use'
    ],
    tiers: [
      { minViews: 0, maxViews: 8000, rate: 42 },
      { minViews: 8000, maxViews: 80000, rate: 32 },
      { minViews: 80000, maxViews: null, rate: 24 }
    ]
  },
  { 
    id: '00000000-0000-0000-0000-000000000017', 
    brand: 'Taco Bell', 
    title: 'Film your late night run',
    description: 'Late night Taco Bell runs are iconic - film yours. Whether it\'s the drive-through at 2am, a Crunchwrap review, or trying every item on the menu, we want authentic fast food content. The messier and more real, the better. Mukbang style or quick taste tests both work.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: spotifyLogo,
    image: fastFood,
    contentType: 'Food/Late Night',
    productVisibility: 'Taco Bell food and packaging visible',
    videoLength: '15-40 seconds',
    guidelines: [
      'Show Taco Bell food and branding',
      'Include taste reactions',
      'Late night vibes are encouraged',
      'Honest reviews perform best'
    ],
    tiers: [
      { minViews: 0, maxViews: 6000, rate: 32 },
      { minViews: 6000, maxViews: 60000, rate: 24 },
      { minViews: 60000, maxViews: null, rate: 18 }
    ]
  },
  { 
    id: '00000000-0000-0000-0000-000000000018', 
    brand: 'ChatGPT', 
    title: 'Show a surprising AI conversation',
    description: 'Show us how you use ChatGPT in your daily life or work. This could be anything from asking weird questions, using it for studying, getting it to help with writing, or testing its limits with creative prompts. Screen recordings of conversations that are funny, useful, or surprising perform best.', 
    ratePerThousand: 40, 
    maxEarnings: 1000, 
    logo: samsungLogo,
    image: techUnboxing,
    contentType: 'AI/Tech',
    productVisibility: 'ChatGPT interface visible',
    videoLength: '15-45 seconds',
    guidelines: [
      'Show the ChatGPT interface clearly',
      'Use an interesting or funny prompt',
      'React to the AI\'s response',
      'Useful tips content works well too'
    ],
    tiers: [
      { minViews: 0, maxViews: 12000, rate: 50 },
      { minViews: 12000, maxViews: 120000, rate: 38 },
      { minViews: 120000, maxViews: null, rate: 28 }
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
  const [activeFilter, setActiveFilter] = useState<'foryou' | 'featured'>('featured');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const featuredScrollRef = useRef<HTMLDivElement>(null);
  const savedScrollPosition = useRef<number>(0);

  // Save scroll position before showing detail, restore when going back
  const handleSelectCampaign = (campaign: typeof campaigns[0]) => {
    if (featuredScrollRef.current) {
      savedScrollPosition.current = featuredScrollRef.current.scrollTop;
    }
    setSelectedCampaign(campaign);
  };

  const handleBackFromDetail = () => {
    setSelectedCampaign(null);
    // Restore scroll position after render
    requestAnimationFrame(() => {
      if (featuredScrollRef.current) {
        featuredScrollRef.current.scrollTop = savedScrollPosition.current;
      }
    });
  };

  // Reset scroll position when switching to Featured mode
  useEffect(() => {
    if (activeFilter === 'featured' && featuredScrollRef.current && !selectedCampaign) {
      featuredScrollRef.current.scrollTop = 0;
      savedScrollPosition.current = 0;
    }
  }, [activeFilter]);

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
      // Remove favorite
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('campaign_id', campaignId);
      setFavorites(favorites.filter(id => id !== campaignId));
    } else {
      // Add favorite
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, campaign_id: campaignId });
      setFavorites([...favorites, campaignId]);
    }
  };

  // No longer redirect - allow browsing without login

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

  // Helper to check if a filter is active (avoids TypeScript narrowing issues)
  const isFilterActive = (filter: FilterType) => activeFilter === filter;

  const renderFilterButtons = (includeSort = false) => (
    <div className="flex items-center gap-4 font-jakarta">
      <button 
        onClick={() => setActiveFilter('foryou')}
        className={`px-5 py-2 rounded-full text-base font-medium transition-colors backdrop-blur-md ${isFilterActive('foryou') ? 'bg-black text-white' : 'bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 text-foreground hover:bg-white/50 dark:hover:bg-white/20'}`}
      >
        For you
      </button>
      <button 
        onClick={() => setActiveFilter('featured')}
        className={`px-5 py-2 rounded-full text-base font-medium transition-colors backdrop-blur-md ${isFilterActive('featured') ? 'bg-black text-white' : 'bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 text-foreground hover:bg-white/50 dark:hover:bg-white/20'}`}
      >
        Featured
      </button>
      {includeSort && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-5 py-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 text-foreground text-base font-medium hover:bg-white/50 dark:hover:bg-white/20 transition-colors flex items-center gap-1">
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
      )}
    </div>
  );

  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const currentCampaign = campaigns[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const isMobileHomeMode = activeFilter === 'foryou' && !selectedCampaign;

  return (
    <div className="h-screen flex relative overflow-hidden">
      {/* Mobile-only black background - only for Home/For you mode */}
      {isMobileHomeMode && <div className="md:hidden absolute inset-0 bg-black" />}
      {/* White background for mobile when not in Home mode */}
      {!isMobileHomeMode && <div className="md:hidden absolute inset-0 bg-white" />}
      {/* Static Grainy Background - desktop only */}
      <div className="hidden md:block absolute inset-0 pointer-events-none grainy-background" />
      <div className="hidden md:block noise-layer absolute inset-0 pointer-events-none" />
      
      {/* Left Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex w-56 lg:w-52 flex-col relative z-10 backdrop-blur-md bg-gradient-to-b from-white/95 to-white/40 dark:from-dark-surface dark:to-dark-surface font-jakarta">
        {/* Logo */}
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
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-3 gap-4 mt-8">
          <button className="text-lg lg:text-base font-bold text-foreground px-3 py-1.5 text-left transition-colors flex items-center gap-3">
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
            onClick={() => user ? navigate('/activity') : setShowAuthPrompt(true)}
            className="text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-3"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4ZM10.5 8.5C10 8.2 9.5 8.5 9.5 9V15C9.5 15.5 10 15.8 10.5 15.5L15.5 12.5C16 12.2 16 11.8 15.5 11.5L10.5 8.5Z" />
            </svg>
            Action
          </button>
          {user ? (
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
          ) : (
            <button 
              onClick={() => setShowAuthPrompt(true)}
              className="text-lg lg:text-base font-medium text-foreground hover:font-semibold px-3 py-1.5 text-left transition-all flex items-center gap-3"
            >
              <User className="h-6 w-6" />
              Profile
            </button>
          )}
        </nav>

        {/* What is Jarla link */}
        <div className="mt-auto px-3 pb-2">
          <button 
            onClick={() => navigate('/landing')}
            className="text-base lg:text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-1 text-left transition-all"
          >
            What is Jarla?
          </button>
        </div>

        {/* Bottom section */}
        <div className="px-3 py-4 border-t border-black/10 dark:border-white/20">
          {user ? (
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
          ) : (
            <div className="flex flex-col gap-2 px-3">
              <button 
                onClick={() => navigate('/auth?mode=signup')}
                className="w-full py-2 bg-foreground text-background rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Create account
              </button>
              <button 
                onClick={() => navigate('/auth?mode=login')}
                className="w-full py-2 border border-foreground/20 rounded-full text-sm font-medium hover:bg-foreground/5 transition-colors"
              >
                Log in
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar - hidden when in ad detail */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pt-2 pb-2 h-20 safe-area-bottom ${selectedCampaign ? 'hidden' : ''} ${isMobileHomeMode ? 'bg-black border-t border-white/10' : 'bg-white border-t border-black/10'}`}>
        <div className="flex items-start justify-between h-full">
          <button 
            onClick={() => setActiveFilter('foryou')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className={`h-6 w-6 ${activeFilter === 'foryou' ? (isMobileHomeMode ? 'text-white' : 'text-black') : (isMobileHomeMode ? 'text-white/50' : 'text-black/40')}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z" />
            </svg>
            <span className={`text-[10px] ${activeFilter === 'foryou' ? (isMobileHomeMode ? 'font-semibold text-white' : 'font-semibold text-black') : (isMobileHomeMode ? 'text-white/50' : 'text-black/40')}`}>Home</span>
          </button>
          <button 
            onClick={() => setActiveFilter('featured')}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className={`h-6 w-6 ${activeFilter === 'featured' ? (isMobileHomeMode ? 'text-white' : 'text-black') : (isMobileHomeMode ? 'text-white/50' : 'text-black/40')}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
            </svg>
            <span className={`text-[10px] ${activeFilter === 'featured' ? (isMobileHomeMode ? 'font-semibold text-white' : 'font-semibold text-black') : (isMobileHomeMode ? 'text-white/50' : 'text-black/40')}`}>Discover</span>
          </button>
          <button 
            onClick={() => user ? navigate('/activity') : setShowAuthPrompt(true)}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className={`h-6 w-6 ${isMobileHomeMode ? 'text-white/50' : 'text-black/40'}`} viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM10 8C9.5 7.7 9 8 9 8.5V15.5C9 16 9.5 16.3 10 16L16 12.5C16.5 12.2 16.5 11.8 16 11.5L10 8Z" />
            </svg>
            <span className={`text-[10px] ${isMobileHomeMode ? 'text-white/50' : 'text-black/40'}`}>Action</span>
          </button>
          <button 
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            <svg className={`h-6 w-6 ${isMobileHomeMode ? 'text-white/50' : 'text-black/40'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className={`text-[10px] ${isMobileHomeMode ? 'text-white/50' : 'text-black/40'}`}>Alerts</span>
          </button>
          <button 
            onClick={() => user ? navigate('/profile') : setShowAuthPrompt(true)}
            className="flex flex-col items-center gap-1 pt-1 w-12"
          >
            {user ? (
              <Avatar className="h-6 w-6">
                <AvatarImage src={profile?.avatar_url || defaultAvatar} alt={firstName} />
                <AvatarFallback className={`text-[10px] font-medium ${isMobileHomeMode ? 'bg-white/20 text-white' : 'bg-black/10 text-black'}`}>
                  {firstName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <User className={`h-6 w-6 ${isMobileHomeMode ? 'text-white/50' : 'text-black/40'}`} />
            )}
            <span className={`text-[10px] ${isMobileHomeMode ? 'text-white/50' : 'text-black/40'}`}>Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col overflow-hidden">
        {/* Desktop: conditional render */}
        {selectedCampaign && (
          <div className="hidden md:block flex-1 overflow-y-auto px-8 py-8 pb-8">
            <CampaignDetailView
              campaign={selectedCampaign}
              onBack={handleBackFromDetail}
              isSaved={favorites.includes(selectedCampaign.id)}
              onToggleSave={(e) => toggleFavorite(selectedCampaign.id, e)}
            />
          </div>
        )}
        
        {/* Mobile: Campaign detail slides over as overlay */}
        {selectedCampaign && (
          <div className="md:hidden fixed inset-0 z-50">
            <CampaignDetailView
              campaign={selectedCampaign}
              onBack={handleBackFromDetail}
              isSaved={favorites.includes(selectedCampaign.id)}
              onToggleSave={(e) => toggleFavorite(selectedCampaign.id, e)}
            />
          </div>
        )}
        
        {/* Feed content - stays visible on mobile (overlay covers it), hidden on desktop when detail selected */}
        <div className={`flex-1 flex flex-col overflow-hidden ${selectedCampaign ? 'md:hidden' : ''}`}>
        {/* Fixed overlay filter buttons */}
        <div className="hidden md:flex absolute top-6 left-4 right-4 md:left-8 md:right-8 z-20 justify-between items-center">
          <div className="flex items-center gap-4">
            {renderFilterButtons(false)}
          </div>
          {activeFilter !== 'foryou' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-5 py-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 text-foreground text-base font-medium hover:bg-white/50 dark:hover:bg-white/20 transition-colors flex items-center gap-1 font-jakarta">
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
          )}
        </div>

        {activeFilter === 'foryou' ? (
          /* For You - Full screen on mobile, photo left + info right on desktop */
          <div 
            className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-hide md:pt-40 h-[calc(100dvh-80px)] md:h-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={handleScroll}
          >
            {campaigns.map((campaign, idx) => {
              let touchStartX = 0;
              let touchEndX = 0;
              
              const handleTouchStart = (e: React.TouchEvent) => {
                touchStartX = e.touches[0].clientX;
              };
              
              const handleTouchEnd = (e: React.TouchEvent) => {
                touchEndX = e.changedTouches[0].clientX;
                const swipeDistance = touchStartX - touchEndX;
                // Swipe left (finger moves right to left) to open details
                if (swipeDistance > 80) {
                  handleSelectCampaign(campaign);
                }
              };
              
              return (
              <div 
                key={campaign.id} 
                className="h-[calc(100dvh-80px)] md:h-screen flex items-stretch justify-stretch md:items-center md:justify-start snap-start snap-always md:py-6 md:pl-16 md:gap-8"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Full screen photo on mobile, left side on desktop */}
                <div 
                  onClick={() => handleSelectCampaign(campaign)}
                  className="relative w-full h-full md:w-auto md:h-[calc(100vh-48px)] md:aspect-[9/16] overflow-hidden cursor-pointer md:hover:scale-[1.01] transition-all md:flex-shrink-0"
                >
                  <img src={campaign.image} alt={campaign.brand} className="w-full h-full object-cover" />
                  <div 
                    className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  {/* Swipe hint */}
                  <div className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-white/50">
                    <svg className="h-5 w-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                  {/* Mobile overlay info */}
                  <div className="md:hidden absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="text-lg font-bold text-white font-jakarta line-clamp-1">{campaign.description}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="inline-flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                        <span className="text-base font-semibold text-white/80 font-montserrat">sek</span>
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(campaign.id, e)}
                        className="flex items-center justify-center hover:scale-110 transition-transform p-2"
                      >
                        <Bookmark 
                          className={`h-7 w-7 ${favorites.includes(campaign.id) ? 'fill-white text-white' : 'text-white/70'}`}
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Right side - Campaign info (desktop only) */}
                <div className="hidden md:flex h-[calc(100vh-48px)] flex-col justify-between min-w-[280px] py-4">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground font-montserrat">{campaign.brand}</span>
                    <p className="text-2xl font-bold text-foreground mt-2 font-jakarta">{campaign.description}</p>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div className="inline-flex items-baseline gap-1">
                      <span className="text-5xl font-bold text-foreground font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                      <span className="text-xl font-semibold text-foreground font-montserrat">sek</span>
                    </div>
                    <button
                      onClick={(e) => toggleFavorite(campaign.id, e)}
                      className="flex items-center justify-center hover:scale-110 transition-transform p-2"
                    >
                      <Bookmark 
                        className={`h-8 w-8 ${favorites.includes(campaign.id) ? 'fill-foreground text-foreground' : 'text-muted-foreground'}`}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        ) : viewMode === 'scroll' ? (
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
                    onClick={() => handleSelectCampaign(campaign)}
                    className="aspect-[9/16] h-[calc(100vh-48px)] border border-white/25 flex items-center justify-center relative overflow-hidden cursor-pointer transition-colors"
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
                  className="absolute -top-32 w-40 h-40 bg-white shadow-lg flex items-center justify-center border-2 border-white/50 overflow-hidden p-4 cursor-pointer hover:scale-105 transition-transform"
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
          <div ref={featuredScrollRef} className="relative flex-1 overflow-y-auto pt-24 pb-24 md:pb-8">
            <div className="px-4 md:pl-8 md:pr-8">
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-3 md:gap-x-6 md:gap-y-8">
              {campaigns.map((campaign, index) => {
                return (
                  <div
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className="overflow-hidden cursor-pointer hover:scale-[1.02] transition-all group flex flex-col w-full md:w-[200px] border border-black/20"
                  >
                    {/* Top - Vertical Image */}
                    <div className="relative w-full aspect-[3/4] overflow-hidden">
                      <img src={campaign.image} alt={campaign.brand} className="w-full h-full object-cover" />
                      <div 
                        className="absolute inset-0 opacity-50 mix-blend-overlay pointer-events-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                        }}
                      />
                      {/* Brand name overlay */}
                      <span className="absolute top-3 left-3 text-xs font-medium text-white font-montserrat drop-shadow-md">{campaign.brand}</span>
                    </div>
                    
                    {/* Bottom - White info section */}
                    <div className="w-full bg-white md:dark:bg-dark-surface p-4 flex flex-col justify-between h-[100px]">
                      <p className="text-sm font-bold text-black md:text-foreground font-jakarta leading-tight line-clamp-2">{campaign.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="inline-flex items-baseline gap-0.5">
                          <span className="text-xl font-bold text-black md:text-foreground font-montserrat">{campaign.maxEarnings.toLocaleString()}</span>
                          <span className="text-xs font-semibold text-black md:text-foreground font-montserrat">sek</span>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(campaign.id, e)}
                          className="flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <Bookmark 
                            className={`h-5 w-5 ${favorites.includes(campaign.id) ? 'fill-black md:fill-foreground text-black md:text-foreground' : 'text-black/25'}`}
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

export default Campaigns;

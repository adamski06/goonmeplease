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

export interface Campaign {
  id: string;
  brand: string;
  title: string;
  description: string;
  ratePerThousand: number;
  maxEarnings: number;
  logo: string;
  image: string;
  contentType: string;
  productVisibility: string;
  videoLength: string;
  guidelines: string[];
  tiers: { minViews: number; maxViews: number | null; rate: number }[];
  exampleImages?: string[];
}

export const campaigns: Campaign[] = [
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

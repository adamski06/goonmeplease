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
import streetStyle from '@/assets/campaigns/street-style.jpg';
import adventurePov from '@/assets/campaigns/adventure-pov.jpg';
import gaming from '@/assets/campaigns/gaming.jpg';
import unboxingHaul from '@/assets/campaigns/unboxing-haul.jpg';
import electricCar from '@/assets/campaigns/electric-car.jpg';

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
import adobeExample1 from '@/assets/examples/adobe-example-1.jpg';
import hmExample1 from '@/assets/examples/hm-example-1.jpg';

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

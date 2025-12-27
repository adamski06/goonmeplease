import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // Step 1: Scrape the website using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error('Firecrawl error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to scrape website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const websiteContent = scrapeData.data?.markdown || '';
    console.log('Scraped content length:', websiteContent.length);

    if (!websiteContent) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content found on website' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Analyze with AI using tool calling for structured output
    const validAudienceTypes = [
      // Demographics & Life Stages
      'Students', 'College Students', 'High School Students', 'Graduate Students', 'PhD Students',
      'Young Professionals', 'Mid-Career Professionals', 'Senior Professionals', 'Executives', 'C-Suite',
      'Parents', 'New Parents', 'Single Parents', 'Empty Nesters', 'Grandparents',
      'Millennials', 'Gen Z', 'Gen X', 'Baby Boomers', 'Gen Alpha Parents',
      'Singles', 'Couples', 'Newlyweds', 'Engaged Couples', 'Families',
      'Retirees', 'Pre-Retirees', 'Working Mothers', 'Stay-at-Home Parents', 'Working Fathers',
      'First-Time Moms', 'Teen Parents', 'Adoptive Parents', 'Foster Parents', 'Expecting Parents',
      // Technology & Gaming
      'Tech Enthusiasts', 'Gamers', 'PC Gamers', 'Console Gamers', 'Mobile Gamers',
      'Esports Fans', 'Streamers', 'Content Creators', 'Podcasters', 'YouTubers',
      'Early Adopters', 'Gadget Lovers', 'Smart Home Enthusiasts', 'VR/AR Users', 'AI Enthusiasts',
      'Programmers', 'Developers', 'Data Scientists', 'IT Professionals', 'Cybersecurity Experts',
      'Crypto Enthusiasts', 'NFT Collectors', 'Web3 Users', 'Fintech Users', 'App Developers',
      'TikTokers', 'Instagram Creators', 'Twitch Streamers', 'Discord Users', 'Reddit Users',
      'Tech Reviewers', 'Beta Testers', 'Open Source Contributors', 'Hackathon Participants', 'Code Bootcamp Students',
      // Health & Fitness
      'Fitness Enthusiasts', 'Gym Goers', 'Runners', 'Cyclists', 'Swimmers',
      'Yoga Practitioners', 'Pilates Enthusiasts', 'CrossFit Athletes', 'Bodybuilders', 'Weightlifters',
      'Marathon Runners', 'Triathletes', 'Home Workout Fans', 'Personal Training Clients', 'Athletes',
      'Health-Conscious', 'Wellness Seekers', 'Mental Health Advocates', 'Meditation Practitioners', 'Mindfulness Enthusiasts',
      'Nutritionists', 'Diet-Conscious', 'Keto Followers', 'Vegan Athletes', 'Clean Eaters',
      'Biohackers', 'Sleep Optimizers', 'Supplement Users', 'Functional Fitness', 'HIIT Enthusiasts',
      'Martial Arts Practitioners', 'Boxing Enthusiasts', 'Dance Fitness Fans', 'Spin Class Devotees', 'Barre Enthusiasts',
      // Fashion & Beauty
      'Fashion Lovers', 'Streetwear Fans', 'Luxury Fashion Buyers', 'Vintage Collectors', 'Sustainable Fashion Advocates',
      'Beauty Enthusiasts', 'Makeup Artists', 'Skincare Obsessed', 'Haircare Enthusiasts', 'Sneakerheads',
      'Influencer Followers', 'Trend Setters', 'Minimalist Dressers', 'Plus Size Fashion', 'Petite Fashion',
      'Menswear Enthusiasts', 'Watch Collectors', 'Jewelry Lovers', 'Accessory Collectors', 'Athleisure Wearers',
      'Thrift Shoppers', 'Designer Resale Buyers', 'Capsule Wardrobe Fans', 'K-Beauty Fans', 'Clean Beauty Advocates',
      // Food & Beverage
      'Foodies', 'Home Cooks', 'Professional Chefs', 'Bakers', 'Grill Masters',
      'Wine Enthusiasts', 'Beer Lovers', 'Cocktail Enthusiasts', 'Coffee Lovers', 'Tea Enthusiasts',
      'Vegans', 'Vegetarians', 'Plant-Based Eaters', 'Flexitarians', 'Pescatarians',
      'Organic Food Buyers', 'Farm-to-Table Advocates', 'Local Food Supporters', 'Food Allergy Aware', 'Gluten-Free',
      'Restaurant Goers', 'Food Delivery Users', 'Meal Kit Subscribers', 'Snack Lovers', 'Dessert Lovers',
      'Specialty Coffee Drinkers', 'Craft Beer Enthusiasts', 'Natural Wine Lovers', 'Meal Preppers', 'Recipe Creators',
      // Travel & Leisure
      'Travelers', 'Adventure Travelers', 'Luxury Travelers', 'Budget Travelers', 'Backpackers',
      'Digital Nomads', 'Business Travelers', 'Solo Travelers', 'Beach Lovers', 'Mountain Enthusiasts',
      'Cruise Enthusiasts', 'Road Trippers', 'Camping Enthusiasts', 'Glamping Fans', 'RV Travelers',
      'Frequent Flyers', 'Points Collectors', 'Travel Hackers', 'Staycationers', 'Weekend Warriors',
      'Hostel Travelers', 'Airbnb Enthusiasts', 'Scuba Divers', 'Safari Goers', 'National Park Visitors',
      // Business & Professional
      'Entrepreneurs', 'Startup Founders', 'Small Business Owners', 'Freelancers', 'Solopreneurs',
      'Side Hustlers', 'Consultants', 'Coaches', 'Mentors', 'Investors',
      'Real Estate Investors', 'Stock Traders', 'Angel Investors', 'Financial Advisors', 'HR Professionals',
      'Marketers', 'Sales Professionals', 'Account Managers', 'Project Managers', 'Remote Workers',
      'E-commerce Sellers', 'Dropshippers', 'Amazon Sellers', 'Etsy Sellers', 'Shopify Merchants',
      'Agency Owners', 'SaaS Founders', 'Career Advancers', 'Job Seekers', 'Career Switchers',
      // Creative & Arts
      'Artists/Creatives', 'Graphic Designers', 'UI/UX Designers', 'Photographers', 'Videographers',
      'Illustrators', 'Animators', '3D Artists', 'Motion Designers', 'Product Designers',
      'Writers', 'Authors', 'Bloggers', 'Journalists', 'Copywriters',
      'Musicians', 'Music Producers', 'DJs', 'Singers', 'Instrumentalists',
      'Filmmakers', 'Directors', 'Actors', 'Voice Actors', 'Theater Enthusiasts',
      'Calligraphers', 'Sculptors', 'Painters', 'Digital Artists', 'Fashion Designers',
      // Music & Entertainment
      'Music Lovers', 'Concert Goers', 'Festival Attendees', 'Podcast Listeners', 'Movie Buffs',
      'TV Series Binge Watchers', 'Anime Fans', 'K-Pop Fans', 'True Crime Fans', 'Comedy Fans',
      'Theater Goers', 'Broadway Fans', 'Opera Enthusiasts', 'Reality TV Watchers', 'Board Game Enthusiasts',
      // Sports & Outdoors
      'Sports Fans', 'Soccer Fans', 'Basketball Fans', 'Football Fans', 'Golf Enthusiasts',
      'Outdoor Enthusiasts', 'Hikers', 'Rock Climbers', 'Skiers', 'Snowboarders',
      'Surfers', 'Kayakers', 'Fishing Enthusiasts', 'Hunters', 'Bird Watchers',
      'Trail Runners', 'Mountain Bikers', 'BMX Riders', 'Skateboarding Enthusiasts', 'Sailing Enthusiasts',
      // Home & Lifestyle
      'Homeowners', 'Renters', 'First-Time Home Buyers', 'Interior Design Fans', 'DIY Enthusiasts',
      'Gardeners', 'Plant Parents', 'Urban Gardeners', 'Sustainable Living', 'Pet Owners',
      'Dog Owners', 'Cat Owners', 'Pet Parents', 'Minimalists', 'Smart Home Owners',
      'Tiny Home Enthusiasts', 'Van Lifers', 'Crafters', 'Knitters', 'Woodworkers',
      // Sustainability & Values
      'Eco-Conscious', 'Environmental Activists', 'Climate Advocates', 'Zero Waste', 'Sustainable Shoppers',
      'Ethical Consumers', 'Fair Trade Supporters', 'Animal Rights Advocates', 'Vegan Lifestyle', 'Cruelty-Free Shoppers',
      'Social Impact Investors', 'Philanthropists', 'Volunteers', 'Non-Profit Supporters', 'Community Activists',
      'LGBTQ+ Community', 'Allies', 'Diversity Advocates', 'Women Empowerment', 'Social Justice Advocates',
      // Luxury & Premium
      'Luxury Seekers', 'High Net Worth', 'Affluent Shoppers', 'Premium Brand Loyalists', 'Exclusive Experience Seekers',
      'Fine Dining Enthusiasts', 'Art Collectors', 'Antique Collectors', 'Rare Item Collectors', 'Luxury Watch Collectors',
      // Education & Learning
      'Lifelong Learners', 'Online Course Takers', 'Skill Seekers', 'Career Changers', 'Certification Seekers',
      'Book Lovers', 'Avid Readers', 'Non-Fiction Readers', 'Fiction Readers', 'Self-Help Readers',
      'Language Learners', 'STEM Enthusiasts', 'History Buffs', 'Science Enthusiasts', 'Philosophy Readers',
      'Homeschool Parents', 'Test Prep Students', 'Professional Development', 'Leadership Learners', 'Mastermind Members',
      // Finance & Investing
      'Budget Conscious', 'Savers', 'Frugal Shoppers', 'Coupon Users', 'Deal Hunters',
      'Investors', 'Day Traders', 'Long-Term Investors', 'Retirement Planners', 'Wealth Builders',
      'Debt-Free Journey', 'Financial Independence', 'FIRE Movement', 'Side Income Seekers', 'Passive Income Builders',
      'Credit Score Builders', 'First-Time Investors', 'Real Estate Flippers', 'Dividend Investors', 'Personal Finance Enthusiasts'
    ];

    const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a business analyst writing FROM THE COMPANY'S PERSPECTIVE. All descriptions must be written as if you work for the company, using "we", "our", and "us".

CRITICAL - ALL TEXT MUST BE FIRST-PERSON "WE" PERSPECTIVE:
- description: Write as the company speaking about themselves. Example: "We are a sustainable fashion brand creating timeless pieces for the modern professional."
- productsServices: Write in detail about what the company offers. Example: "We offer a curated collection of premium workwear including tailored blazers, versatile dresses, and accessories. Our signature line features sustainable fabrics sourced from ethical suppliers, and we provide personalized styling consultations to help customers build their perfect wardrobe."
- audienceDescription: Write from company perspective. Example: "We primarily serve style-conscious professionals aged 25-45 who value quality over quantity and care about sustainable fashion choices."

IMPORTANT for productsServices: Be detailed and specific (3-4 sentences). Include:
- Main product/service categories
- Key features or differentiators
- Any unique selling points

IMPORTANT for audienceTypes: Select 5-10 relevant audience types from the provided options. Be thorough - most businesses appeal to multiple audience segments.

IMPORTANT for ageRanges: Select 2-4 most relevant age ranges from: ${ageRanges.join(', ')}

Examples:
- Fashion retailer → "We offer a curated selection of contemporary and classic pieces for men and women. Our collection includes designer clothing, premium footwear, and carefully selected accessories. We pride ourselves on discovering emerging designers while maintaining relationships with established luxury brands."
- Tech startup → "We build AI-powered productivity tools that help teams collaborate more effectively. Our platform includes smart document editing, automated meeting summaries, and intelligent task management. We integrate with over 50 popular workplace tools."

Always write as if you ARE the company. Never use "they" or "the company".`
          },
          {
            role: 'user',
            content: `Analyze this website content and write business information FROM THE COMPANY'S PERSPECTIVE (using "we", "our", "us"):\n\n${websiteContent.slice(0, 15000)}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_business_info',
              description: 'Extract structured business information from website content, written from the company perspective',
              parameters: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description: 'A 1-2 sentence description written as the company (using "we/our"). Example: "We are a leading provider of..."'
                  },
                  productsServices: {
                    type: 'string',
                    description: 'Detailed 3-4 sentence description of products/services written as the company (using "we/our"). Be specific about what they offer, key features, and differentiators.'
                  },
                  country: {
                    type: 'string',
                    description: 'The country where the company is based (full country name)'
                  },
                  audienceTypes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Target audience types - select 5-10 from the valid options provided. Be thorough.'
                  },
                  audienceDescription: {
                    type: 'string',
                    description: 'A natural language description of the target audience written as the company (using "we serve/our customers are"). 2-3 sentences.'
                  },
                  ageRanges: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Target age ranges - select 2-4 from: 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+'
                  }
                },
                required: ['description', 'productsServices', 'country', 'audienceTypes', 'audienceDescription', 'ageRanges'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_business_info' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData));

    // Extract the tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_business_info') {
      console.error('No valid tool call in response');
      return new Response(
        JSON.stringify({ success: false, error: 'AI did not return structured data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const businessInfo = JSON.parse(toolCall.function.arguments);
    console.log('Extracted business info:', businessInfo);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: businessInfo 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing website:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

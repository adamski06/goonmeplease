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
      // Technology & Gaming
      'Tech Enthusiasts', 'Gamers', 'PC Gamers', 'Console Gamers', 'Mobile Gamers',
      'Esports Fans', 'Streamers', 'Content Creators', 'Podcasters', 'YouTubers',
      'Early Adopters', 'Gadget Lovers', 'Smart Home Enthusiasts', 'VR/AR Users', 'AI Enthusiasts',
      'Programmers', 'Developers', 'Data Scientists', 'IT Professionals', 'Cybersecurity Experts',
      'Crypto Enthusiasts', 'NFT Collectors', 'Web3 Users', 'Fintech Users', 'App Developers',
      // Health & Fitness
      'Fitness Enthusiasts', 'Gym Goers', 'Runners', 'Cyclists', 'Swimmers',
      'Yoga Practitioners', 'Pilates Enthusiasts', 'CrossFit Athletes', 'Bodybuilders', 'Weightlifters',
      'Marathon Runners', 'Triathletes', 'Home Workout Fans', 'Personal Training Clients', 'Athletes',
      'Health-Conscious', 'Wellness Seekers', 'Mental Health Advocates', 'Meditation Practitioners', 'Mindfulness Enthusiasts',
      // Fashion & Beauty
      'Fashion Lovers', 'Streetwear Fans', 'Luxury Fashion Buyers', 'Vintage Collectors', 'Sustainable Fashion Advocates',
      'Beauty Enthusiasts', 'Makeup Artists', 'Skincare Obsessed', 'Haircare Enthusiasts', 'Sneakerheads',
      // Food & Beverage
      'Foodies', 'Home Cooks', 'Professional Chefs', 'Bakers', 'Wine Enthusiasts',
      'Coffee Lovers', 'Tea Enthusiasts', 'Vegans', 'Vegetarians', 'Plant-Based Eaters',
      // Travel & Leisure
      'Travelers', 'Adventure Travelers', 'Luxury Travelers', 'Budget Travelers', 'Backpackers',
      'Digital Nomads', 'Business Travelers', 'Solo Travelers', 'Beach Lovers', 'Mountain Enthusiasts',
      // Business & Professional
      'Entrepreneurs', 'Startup Founders', 'Small Business Owners', 'Freelancers', 'Solopreneurs',
      'Consultants', 'Coaches', 'Investors', 'Remote Workers', 'Marketers',
      // Creative & Arts
      'Artists/Creatives', 'Graphic Designers', 'Photographers', 'Videographers', 'Writers',
      'Musicians', 'Music Producers', 'DJs', 'Filmmakers', 'Illustrators',
      // Music & Entertainment
      'Music Lovers', 'Concert Goers', 'Festival Attendees', 'Podcast Listeners', 'Movie Buffs',
      'TV Series Binge Watchers', 'Anime Fans', 'K-Pop Fans', 'True Crime Fans', 'Comedy Fans',
      // Sports & Outdoors
      'Sports Fans', 'Soccer Fans', 'Basketball Fans', 'Football Fans', 'Golf Enthusiasts',
      'Outdoor Enthusiasts', 'Hikers', 'Skiers', 'Snowboarders', 'Surfers',
      // Home & Lifestyle
      'Homeowners', 'Interior Design Fans', 'DIY Enthusiasts', 'Gardeners', 'Plant Parents',
      'Pet Owners', 'Dog Owners', 'Cat Owners', 'Minimalists', 'Smart Home Owners',
      // Sustainability & Values
      'Eco-Conscious', 'Environmental Activists', 'Sustainable Shoppers', 'Ethical Consumers', 'Vegan Lifestyle',
      // Luxury & Premium
      'Luxury Seekers', 'High Net Worth', 'Affluent Shoppers', 'Premium Brand Loyalists', 'Art Collectors',
      // Education & Learning
      'Lifelong Learners', 'Online Course Takers', 'Book Lovers', 'Language Learners', 'STEM Enthusiasts',
      // Finance & Investing
      'Budget Conscious', 'Savers', 'Deal Hunters', 'Day Traders', 'Long-Term Investors'
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
            content: `You are a business analyst. Analyze website content and extract business information. 

IMPORTANT for audienceTypes: You MUST select 2-5 relevant audience types from the provided options (use exact spelling).

IMPORTANT for ageRanges: Select 1-3 most relevant age ranges from: ${ageRanges.join(', ')}

IMPORTANT for audienceDescription: Write a 1-2 sentence description of the target audience in natural language.

Think about who would use the product/service. For example:
- A digital bank → Young Professionals, Tech Enthusiasts, Entrepreneurs, ages 18-34
- A fitness app → Fitness Enthusiasts, Young Professionals, Health-Conscious, ages 18-44
- A gaming company → Gamers, Tech Enthusiasts, Content Creators, ages 13-34

Always include at least 2 audience types and 1 age range that make sense for the business.`
          },
          {
            role: 'user',
            content: `Analyze this website content and extract business information:\n\n${websiteContent.slice(0, 15000)}`
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_business_info',
              description: 'Extract structured business information from website content',
              parameters: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description: 'A brief 1-2 sentence description of what the company does'
                  },
                  productsServices: {
                    type: 'string',
                    description: 'Description of the main products or services offered'
                  },
                  country: {
                    type: 'string',
                    description: 'The country where the company is based (full country name)'
                  },
                  audienceTypes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Target audience types - select 2-5 from the valid options provided'
                  },
                  audienceDescription: {
                    type: 'string',
                    description: 'A natural language description of the target audience (1-2 sentences)'
                  },
                  ageRanges: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Target age ranges - select 1-3 from: 13-17, 18-24, 25-34, 35-44, 45-54, 55-64, 65+'
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

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
      'Students', 'Young Professionals', 'Parents', 'Gamers', 'Fitness Enthusiasts',
      'Tech Enthusiasts', 'Fashion Lovers', 'Foodies', 'Travelers', 'Entrepreneurs',
      'Artists/Creatives', 'Music Lovers', 'Sports Fans', 'Eco-Conscious', 'Luxury Seekers'
    ];

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

IMPORTANT for audienceTypes: You MUST select 2-5 relevant audience types from EXACTLY these options (use exact spelling):
${validAudienceTypes.join(', ')}

Think about who would use the product/service. For example:
- A digital bank → Young Professionals, Tech Enthusiasts, Entrepreneurs
- A fitness app → Fitness Enthusiasts, Young Professionals
- A gaming company → Gamers, Tech Enthusiasts

Always include at least 2 audience types that make sense for the business.`
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
                    description: 'Target audience types from this list: Students, Young Professionals, Parents, Gamers, Fitness Enthusiasts, Tech Enthusiasts, Fashion Lovers, Foodies, Travelers, Entrepreneurs, Artists/Creatives, Music Lovers, Sports Fans, Eco-Conscious, Luxury Seekers'
                  }
                },
                required: ['description', 'productsServices', 'country', 'audienceTypes'],
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

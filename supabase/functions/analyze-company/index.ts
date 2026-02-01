import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  website?: string;
  socialMedia?: Record<string, string>;
  companyName: string;
  language?: string;
  autoSearch?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website, socialMedia, companyName, language = 'en', autoSearch = false }: AnalyzeRequest = await req.json();

    const isSwedish = language === 'sv';
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

    // If autoSearch mode, search for company using web search
    if (autoSearch) {
      console.log('Auto-searching for company:', companyName);
      
      // Use AI to search for company info
      const searchPrompt = `Find the official website and social media accounts for the company "${companyName}". 
      
Return ONLY a JSON object with no markdown formatting, like this:
{
  "website": "https://example.com",
  "socialMedia": {
    "instagram": "https://instagram.com/example",
    "linkedin": "https://linkedin.com/company/example",
    "twitter": "https://twitter.com/example",
    "facebook": "https://facebook.com/example",
    "tiktok": "https://tiktok.com/@example"
  },
  "confidence": "high/medium/low"
}

Only include social media accounts you're confident about. Use null for website if unsure.`;

      try {
        const searchResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: 'You are a research assistant. Return only valid JSON with no markdown or extra text.' },
              { role: 'user', content: searchPrompt }
            ],
          }),
        });

        if (!searchResponse.ok) {
          throw new Error('Search failed');
        }

        const searchData = await searchResponse.json();
        const searchResult = searchData.choices?.[0]?.message?.content || '';
        
        console.log('Search result:', searchResult);
        
        // Parse the JSON response
        let parsed;
        try {
          // Clean up potential markdown formatting
          const cleaned = searchResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {
          console.error('Failed to parse search result');
          return new Response(
            JSON.stringify({ success: false, error: 'Could not find company information' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Filter out null/empty values from socialMedia
        const foundSocialMedia: Record<string, string> = {};
        if (parsed.socialMedia) {
          for (const [platform, url] of Object.entries(parsed.socialMedia)) {
            if (url && typeof url === 'string' && url.trim()) {
              foundSocialMedia[platform] = url;
            }
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              website: parsed.website || null,
              socialMedia: foundSocialMedia,
              confidence: parsed.confidence || 'medium'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Auto-search error:', error);
        return new Response(
          JSON.stringify({ success: false, error: 'Search failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Regular analysis mode - requires website or social media
    if (!website && Object.keys(socialMedia || {}).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Website or social media URLs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL helper
    const formatUrl = (url: string): string => {
      let formatted = url.trim();
      if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
        formatted = `https://${formatted}`;
      }
      return formatted;
    };

    // Scrape a URL with Firecrawl (returns markdown content)
    const scrapeUrl = async (url: string): Promise<string> => {
      try {
        console.log('Scraping:', url);
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: formatUrl(url),
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          return data.data?.markdown || '';
        }
        console.error('Scrape failed for', url, data);
        return '';
      } catch (error) {
        console.error('Error scraping', url, error);
        return '';
      }
    };

    // Scrape a URL to get logo and brand color from multiple sources
    const scrapeUrlForBranding = async (url: string): Promise<{ logo: string | null; brandColor: string | null }> => {
      try {
        console.log('Scraping for branding:', url);
        
        // Try branding format first
        const brandingResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: formatUrl(url),
            formats: ['branding', 'html'],
          }),
        });

        const data = await brandingResponse.json();
        console.log('Branding scrape response success:', data.success);
        
        let logo: string | null = null;
        let brandColor: string | null = null;
        
        if (brandingResponse.ok && data.success) {
          // Try branding data first
          const branding = data.data?.branding;
          if (branding) {
            // Get logo
            logo = branding.logo || branding.images?.logo || null;
            if (logo) {
              console.log('Found logo from branding:', logo);
            }
            
            // Get primary brand color
            if (branding.colors?.primary) {
              brandColor = branding.colors.primary;
              console.log('Found brand color from branding:', brandColor);
            } else if (branding.colors?.accent) {
              brandColor = branding.colors.accent;
              console.log('Found accent color from branding:', brandColor);
            }
          }
          
          // Fallback for logo: Extract from HTML meta tags
          if (!logo) {
            const html = data.data?.html || '';
            
            // Look for Open Graph image
            const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                                html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
            if (ogImageMatch?.[1]) {
              console.log('Found logo from og:image:', ogImageMatch[1]);
              logo = ogImageMatch[1];
            }
            
            // Look for apple-touch-icon (often a good logo)
            if (!logo) {
              const appleIconMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
              if (appleIconMatch?.[1]) {
                let iconUrl = appleIconMatch[1];
                if (iconUrl.startsWith('/')) {
                  const baseUrl = new URL(formatUrl(url));
                  iconUrl = `${baseUrl.origin}${iconUrl}`;
                }
                console.log('Found logo from apple-touch-icon:', iconUrl);
                logo = iconUrl;
              }
            }
            
            // Look for favicon as last resort
            if (!logo) {
              const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
              if (faviconMatch?.[1]) {
                let iconUrl = faviconMatch[1];
                if (iconUrl.startsWith('/')) {
                  const baseUrl = new URL(formatUrl(url));
                  iconUrl = `${baseUrl.origin}${iconUrl}`;
                }
                if (!iconUrl.endsWith('.ico')) {
                  console.log('Found logo from favicon:', iconUrl);
                  logo = iconUrl;
                }
              }
            }
            
            // Try common logo image patterns in the HTML
            if (!logo) {
              const logoImgMatch = html.match(/<img[^>]*(?:class|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
                                  html.match(/<img[^>]*src=["']([^"']+logo[^"']+)["']/i);
              if (logoImgMatch?.[1]) {
                let logoUrl = logoImgMatch[1];
                if (logoUrl.startsWith('/')) {
                  const baseUrl = new URL(formatUrl(url));
                  logoUrl = `${baseUrl.origin}${logoUrl}`;
                }
                console.log('Found logo from img tag:', logoUrl);
                logo = logoUrl;
              }
            }
            
            // Fallback for brand color: extract from CSS or theme-color meta
            if (!brandColor) {
              const themeColorMatch = html.match(/<meta[^>]*name=["']theme-color["'][^>]*content=["']([^"']+)["']/i);
              if (themeColorMatch?.[1]) {
                brandColor = themeColorMatch[1];
                console.log('Found brand color from theme-color:', brandColor);
              }
            }
          }
        }
        
        return { logo, brandColor };
      } catch (error) {
        console.error('Error scraping for branding:', url, error);
        return { logo: null, brandColor: null };
      }
    };

    // Collect all content from website and social media
    const contentParts: { source: string; content: string }[] = [];
    let companyLogo: string | null = null;
    let companyBrandColor: string | null = null;

    // Scrape main website and try to get logo and brand color
    if (website) {
      console.log('Scraping main website:', website);
      const [websiteContent, brandingData] = await Promise.all([
        scrapeUrl(website),
        scrapeUrlForBranding(website)
      ]);
      if (websiteContent) {
        contentParts.push({ source: 'Website', content: websiteContent });
      }
      if (brandingData.logo) {
        companyLogo = brandingData.logo;
      }
      if (brandingData.brandColor) {
        companyBrandColor = brandingData.brandColor;
      }
    }

    // Scrape social media pages
    const socialEntries = Object.entries(socialMedia || {}).filter(([_, url]) => url);
    console.log('Social media to scrape:', socialEntries.length);
    
    for (const [platform, url] of socialEntries) {
      if (url) {
        const socialContent = await scrapeUrl(url);
        if (socialContent) {
          contentParts.push({ source: platform, content: socialContent });
        }
      }
    }

    if (contentParts.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not retrieve content from any source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine all content
    const combinedContent = contentParts.map(p => 
      `=== ${p.source.toUpperCase()} ===\n${p.content.slice(0, 8000)}`
    ).join('\n\n');

    console.log('Total content parts:', contentParts.length);
    console.log('Combined content length:', combinedContent.length);

    // Step 2: Analyze with heavy AI model (gpt-5 for comprehensive analysis)
    const systemPromptEnglish = `You are a senior business analyst. Your task is to write a comprehensive company profile for ${companyName} based on information gathered from their website and social media.

FIRST, provide a short one-sentence tagline/description (max 15 words) that captures the essence of the company. Format it as:
**One-Liner**
[Your short tagline here]

Then format your response with clear sections using **Bold Headings** followed by 2-3 sentences each:

**Company Overview**
[What the company does, their mission, and core identity]

**Products & Services**
[Detailed breakdown of what they offer]

**Target Audience**
[Who their customers are, demographics, psychographics]

**Brand Voice & Personality**
[How they communicate, their tone and style]

**Unique Value Proposition**
[What sets them apart from competitors]

**Key Insights**
[Notable observations about their business]

Write in a professional but engaging tone. Be specific and detailed. Each section should be 2-3 sentences.

IMPORTANT: Write FROM THE COMPANY'S PERSPECTIVE using "we", "our", "us" throughout.`;

    const systemPromptSwedish = `Du är en senior affärsanalytiker. Din uppgift är att skriva en omfattande företagsprofil för ${companyName} baserat på information från deras webbplats och sociala medier.

FÖRST, ge en kort en-menings tagline/beskrivning (max 15 ord) som fångar företagets essens. Formatera det som:
**Kortbeskrivning**
[Din korta tagline här]

Formatera sedan ditt svar med tydliga sektioner med **Feta Rubriker** följt av 2-3 meningar vardera:

**Företagsöversikt**
[Vad företaget gör, deras uppdrag och kärnidentitet]

**Produkter & Tjänster**
[Detaljerad genomgång av vad de erbjuder]

**Målgrupp**
[Vilka deras kunder är, demografi, psykografi]

**Varumärkesröst & Personlighet**
[Hur de kommunicerar, deras ton och stil]

**Unik Värdeproposition**
[Vad som skiljer dem från konkurrenter]

**Nyckelinsikter**
[Anmärkningsvärda observationer om deras verksamhet]

Skriv i en professionell men engagerande ton. Var specifik och detaljerad. Varje sektion ska vara 2-3 meningar.

VIKTIGT: Skriv FRÅN FÖRETAGETS PERSPEKTIV med "vi", "vår", "oss" genomgående.`;

    const systemPrompt = isSwedish ? systemPromptSwedish : systemPromptEnglish;
    
    const userPrompt = isSwedish 
      ? `Analysera följande innehåll från ${companyName}s webbplats och sociala medier. Skriv en omfattande företagsprofil på svenska:\n\n${combinedContent.slice(0, 30000)}`
      : `Analyze the following content from ${companyName}'s website and social media. Write a comprehensive company profile:\n\n${combinedContent.slice(0, 30000)}`;

    console.log('Calling AI for analysis...');
    
    // Helper function to call AI with retry
    const callAI = async (model: string, retries = 2): Promise<Response> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        console.log(`AI attempt ${attempt + 1} with model ${model}...`);
        
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
          }),
        });

        if (response.ok) {
          return response;
        }

        const errorText = await response.text();
        console.error(`AI error (attempt ${attempt + 1}):`, response.status, errorText);

        if (response.status === 429) {
          // Rate limited - wait and retry
          if (attempt < retries) {
            console.log('Rate limited, waiting 2 seconds...');
            await new Promise(r => setTimeout(r, 2000));
            continue;
          }
        }
        
        if (response.status === 402) {
          throw new Error('Payment required');
        }

        // For other errors, try next attempt
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      
      throw new Error('All AI attempts failed');
    };

    let aiResponse: Response;
    try {
      // Try GPT-5 first, fall back to Gemini if it fails
      try {
        aiResponse = await callAI('openai/gpt-5', 1);
      } catch (e) {
        console.log('GPT-5 failed, trying Gemini...');
        aiResponse = await callAI('google/gemini-2.5-pro', 1);
      }
    } catch (error) {
      console.error('All AI models failed:', error);
      
      if (error instanceof Error && error.message === 'Payment required') {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed after retries' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const summary = aiData.choices?.[0]?.message?.content || '';

    if (!summary) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI did not return a summary' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract the one-liner from the summary
    let oneLiner = '';
    const oneLineMatch = summary.match(/\*\*(?:One-Liner|Kortbeskrivning)\*\*\s*\n([^\n*]+)/);
    if (oneLineMatch?.[1]) {
      oneLiner = oneLineMatch[1].trim();
    }

    console.log('Summary length:', summary.length);
    console.log('One-liner:', oneLiner);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          summary,
          oneLiner,
          sourcesAnalyzed: contentParts.map(p => p.source),
          logo: companyLogo,
          brandColor: companyBrandColor
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing company:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

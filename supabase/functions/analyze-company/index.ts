import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyzeRequest {
  website: string;
  socialMedia: Record<string, string>;
  companyName: string;
  language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website, socialMedia, companyName, language = 'en' }: AnalyzeRequest = await req.json();

    if (!website && Object.keys(socialMedia || {}).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Website or social media URLs are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Scrape a URL to get logo from multiple sources
    const scrapeUrlForLogo = async (url: string): Promise<string | null> => {
      try {
        console.log('Scraping for logo:', url);
        
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
        console.log('Logo scrape response success:', data.success);
        
        if (brandingResponse.ok && data.success) {
          // Try branding data first
          const branding = data.data?.branding;
          if (branding) {
            const brandingLogo = branding.logo || branding.images?.logo;
            if (brandingLogo) {
              console.log('Found logo from branding:', brandingLogo);
              return brandingLogo;
            }
          }
          
          // Fallback: Extract from HTML meta tags
          const html = data.data?.html || '';
          
          // Look for Open Graph image
          const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
          if (ogImageMatch?.[1]) {
            console.log('Found logo from og:image:', ogImageMatch[1]);
            return ogImageMatch[1];
          }
          
          // Look for apple-touch-icon (often a good logo)
          const appleIconMatch = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']+)["']/i);
          if (appleIconMatch?.[1]) {
            let iconUrl = appleIconMatch[1];
            // Make absolute URL if relative
            if (iconUrl.startsWith('/')) {
              const baseUrl = new URL(formatUrl(url));
              iconUrl = `${baseUrl.origin}${iconUrl}`;
            }
            console.log('Found logo from apple-touch-icon:', iconUrl);
            return iconUrl;
          }
          
          // Look for favicon as last resort
          const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i);
          if (faviconMatch?.[1]) {
            let iconUrl = faviconMatch[1];
            if (iconUrl.startsWith('/')) {
              const baseUrl = new URL(formatUrl(url));
              iconUrl = `${baseUrl.origin}${iconUrl}`;
            }
            // Only use favicon if it's not a generic .ico file
            if (!iconUrl.endsWith('.ico')) {
              console.log('Found logo from favicon:', iconUrl);
              return iconUrl;
            }
          }
          
          // Try common logo image patterns in the HTML
          const logoImgMatch = html.match(/<img[^>]*(?:class|id)=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
                              html.match(/<img[^>]*src=["']([^"']+logo[^"']+)["']/i);
          if (logoImgMatch?.[1]) {
            let logoUrl = logoImgMatch[1];
            if (logoUrl.startsWith('/')) {
              const baseUrl = new URL(formatUrl(url));
              logoUrl = `${baseUrl.origin}${logoUrl}`;
            }
            console.log('Found logo from img tag:', logoUrl);
            return logoUrl;
          }
        }
        
        console.log('No logo found for:', url);
        return null;
      } catch (error) {
        console.error('Error scraping for logo:', url, error);
        return null;
      }
    };

    // Collect all content from website and social media
    const contentParts: { source: string; content: string }[] = [];
    let companyLogo: string | null = null;

    // Scrape main website and try to get logo
    if (website) {
      console.log('Scraping main website:', website);
      const [websiteContent, logoUrl] = await Promise.all([
        scrapeUrl(website),
        scrapeUrlForLogo(website)
      ]);
      if (websiteContent) {
        contentParts.push({ source: 'Website', content: websiteContent });
      }
      if (logoUrl) {
        companyLogo = logoUrl;
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

Format your response with clear sections using **Bold Headings** followed by 2-3 sentences each:

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

Formatera ditt svar med tydliga sektioner med **Feta Rubriker** följt av 2-3 meningar vardera:

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

    console.log('Summary length:', summary.length);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          summary,
          sourcesAnalyzed: contentParts.map(p => p.source),
          logo: companyLogo
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

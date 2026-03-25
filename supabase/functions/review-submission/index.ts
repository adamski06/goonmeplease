import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { submissionId, type } = await req.json();

    if (!submissionId || !type) {
      return new Response(JSON.stringify({ error: 'Missing submissionId or type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch submission and its associated ad/brief
    let submission: any = null;
    let brief: any = null;
    let table = '';
    let videoUrl = '';

    if (type === 'spread') {
      table = 'content_submissions';
      const { data } = await supabase
        .from('content_submissions')
        .select('*, campaigns(title, description, guidelines, category, video_length, product_visibility)')
        .eq('id', submissionId)
        .single();
      if (data) {
        submission = data;
        brief = data.campaigns;
        videoUrl = data.tiktok_video_url;
      }
    } else if (type === 'deal') {
      table = 'deal_applications';
      const { data } = await supabase
        .from('deal_applications')
        .select('*, deals(title, description, guidelines, category, video_length, product_visibility)')
        .eq('id', submissionId)
        .single();
      if (data) {
        submission = data;
        brief = data.deals;
        videoUrl = data.tiktok_video_url || '';
      }
    } else if (type === 'reward') {
      table = 'reward_submissions';
      const { data } = await supabase
        .from('reward_submissions')
        .select('*, reward_ads(title, description, guidelines, category, reward_description, views_required)')
        .eq('id', submissionId)
        .single();
      if (data) {
        submission = data;
        brief = data.reward_ads;
        videoUrl = data.tiktok_video_url;
      }
    }

    if (!submission || !brief) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already reviewed by AI
    if (submission.ai_review) {
      return new Response(JSON.stringify({ review: submission.ai_review }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch TikTok page content for video metadata
    let videoMetadata = 'Could not fetch video metadata.';
    if (videoUrl) {
      try {
        // Use Firecrawl to scrape TikTok page
        const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
        if (firecrawlKey) {
          const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${firecrawlKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url: videoUrl,
              formats: ['markdown'],
              waitFor: 3000,
            }),
          });
          if (scrapeRes.ok) {
            const scrapeData = await scrapeRes.json();
            videoMetadata = scrapeData.data?.markdown?.substring(0, 3000) || 'No content extracted.';
          }
        } else {
          // Fallback: basic fetch
          const fetchRes = await fetch(videoUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; bot)' },
            redirect: 'follow',
          });
          if (fetchRes.ok) {
            const html = await fetchRes.text();
            // Extract og:description and other meta
            const descMatch = html.match(/property="og:description"\s+content="([^"]+)"/);
            const titleMatch = html.match(/property="og:title"\s+content="([^"]+)"/);
            videoMetadata = `Title: ${titleMatch?.[1] || 'Unknown'}\nDescription: ${descMatch?.[1] || 'Unknown'}`;
          }
        }
      } catch (e) {
        console.error('Failed to fetch TikTok metadata:', e);
      }
    }

    // Build the AI prompt
    const guidelines = brief.guidelines || [];
    const briefSummary = `
## Campaign Brief
- Title: ${brief.title}
- Description: ${brief.description || 'N/A'}
- Category: ${brief.category || 'N/A'}
- Video Length: ${brief.video_length || 'Any'}
- Product Visibility: ${brief.product_visibility || 'Any'}
${guidelines.length > 0 ? `- Guidelines:\n${guidelines.map((g: string, i: number) => `  ${i + 1}. ${g}`).join('\n')}` : '- No specific guidelines'}
${brief.reward_description ? `- Reward: ${brief.reward_description}` : ''}
`;

    const prompt = `You are a content review assistant for Jarla, a UGC (user-generated content) platform that connects brands with TikTok creators.

Your job is to review a creator's TikTok video submission against the campaign brief and provide a recommendation to the admin reviewer.

${briefSummary}

## Submitted TikTok Video
- URL: ${videoUrl || 'No URL'}
- Video Page Content/Metadata:
${videoMetadata}

## Your Task
Analyze whether this TikTok video appears to follow the campaign brief requirements. Consider:
1. Does the video description/hashtags relate to the brand/product?
2. Does it appear to follow the guidelines?
3. Are there any red flags (spam, unrelated content, copied content)?

Respond with a JSON object:
{
  "recommendation": "approve" or "deny",
  "confidence": "high", "medium", or "low",
  "summary": "1-2 sentence summary of your assessment",
  "details": ["Detail point 1", "Detail point 2", ...],
  "concerns": ["Any concern 1", ...] (empty array if none)
}

IMPORTANT: Only respond with the JSON object, no other text. Be fair but thorough. If you can't determine enough from the metadata, set confidence to "low" and explain why. Remember that UGC content should feel authentic - don't be overly strict about exact adherence.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error('AI gateway error:', status, text);

      if (status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited, please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    let rawContent = aiData.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let review: any;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      review = JSON.parse(cleaned);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*"recommendation"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          review = JSON.parse(jsonMatch[0]);
        } catch {
          review = {
            recommendation: 'unknown',
            confidence: 'low',
            summary: 'Could not parse AI response.',
            details: [rawContent.substring(0, 300)],
            concerns: [],
          };
        }
      } else {
        review = {
          recommendation: 'unknown',
          confidence: 'low',
          summary: 'Could not parse AI response.',
          details: [rawContent.substring(0, 300)],
          concerns: [],
        };
      }
    }

    review.reviewed_at = new Date().toISOString();

    // Store the review in the database
    await supabase
      .from(table)
      .update({ ai_review: review })
      .eq('id', submissionId);

    return new Response(JSON.stringify({ review }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Review submission error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

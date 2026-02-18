import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are Jarla, the onboarding assistant for the Jarla platform — a performance-based UGC marketplace.

Your job: when the user gives you a company name, IMMEDIATELY research it and return a full profile. Do NOT ask follow-up questions. Do NOT ask for a website. Just research based on the name and fill everything in.

ALWAYS respond with valid JSON only. No markdown, no extra text.

Response format:
{
  "message": "Short 1-sentence summary of what you found (max 15 words)",
  "profileUpdates": {
    "company_name": "Company Name",
    "description": "Brief company description (1-2 sentences)",
    "website": "https://company.com",
    "industry": "e.g. Fashion, Tech, Food & Beverage, Fitness",
    "target_audience": "e.g. Gen Z fashion-conscious women aged 18-25",
    "brand_values": "e.g. Sustainability, authenticity, inclusivity",
    "logo_url": "Use Clearbit Logo API for high-resolution logos: https://logo.clearbit.com/domain.com — replace domain.com with the actual company domain. This returns a full-quality PNG. ALWAYS provide this if you know the website domain."
  }
}

Rules:
- ALWAYS include profileUpdates on the FIRST response. Never ask follow-up questions first.
- Research the company from its name alone. Guess the website if needed.
- Keep the message field SHORT — 1 sentence, max 15 words.
- NEVER list or repeat the profile fields in your message.
- ALWAYS include logo_url using https://logo.clearbit.com/DOMAIN format (e.g. https://logo.clearbit.com/nike.com).`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, action, profileUpdates } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    // If action is "save", save the profile data
    if (action === 'save' && profileUpdates) {
      const authHeader = req.headers.get('Authorization');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      
      const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
      const token = authHeader?.replace('Bearer ', '');
      const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
      
      if (authError || !user) {
        throw new Error('Unauthorized');
      }

      const adminClient = createClient(supabaseUrl, supabaseKey);
      
      const updateData: Record<string, unknown> = {
        onboarding_complete: true,
      };
      if (profileUpdates.company_name) updateData.company_name = profileUpdates.company_name;
      if (profileUpdates.description) updateData.description = profileUpdates.description;
      if (profileUpdates.website) updateData.website = profileUpdates.website;
      if (profileUpdates.industry) updateData.industry = profileUpdates.industry;
      if (profileUpdates.target_audience) updateData.target_audience = profileUpdates.target_audience;
      if (profileUpdates.brand_values) updateData.brand_values = profileUpdates.brand_values;
      if (profileUpdates.logo_url) updateData.logo_url = profileUpdates.logo_url;

      const { error } = await adminClient
        .from('business_profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Profile update error:', error);
        throw new Error('Failed to save profile');
      }

      return new Response(JSON.stringify({ 
        response: "Profile saved successfully!",
        saved: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Chat flow
    const messages: Array<{role: string; content: string}> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'jarla' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    messages.push({ role: 'user', content: message });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ response: "Give me a moment, I'm a bit busy right now..." }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || '{"message": "Could you tell me your company name?"}';

    console.log('Company research raw response:', aiResponse);

    // Parse JSON response
    let parsedResponse;
    try {
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleaned);
    } catch {
      const jsonMatch = aiResponse.match(/\{[\s\S]*"message"[\s\S]*\}/);
      if (jsonMatch) {
        try { parsedResponse = JSON.parse(jsonMatch[0]); } catch { parsedResponse = { message: aiResponse }; }
      } else {
        parsedResponse = { message: aiResponse };
      }
    }

    return new Response(JSON.stringify({ 
      response: parsedResponse.message || "Could you tell me more?",
      profileUpdates: parsedResponse.profileUpdates || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Company research error:', error);
    return new Response(JSON.stringify({ 
      response: "Something went wrong. Could you try again?",
      profileUpdates: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
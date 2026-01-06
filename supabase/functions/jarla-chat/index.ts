import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JARLA_CONTEXT = `You are Jarla, the AI assistant for the Jarla platform. You help businesses during onboarding.

## About Jarla

Jarla is a performance-based creator marketplace where brands pay for real human action — not impressions.

### Mission
To turn real human creativity into a measurable, fair, and trusted currency for brands. Jarla exists to replace fake reach, hollow impressions, and influencer guesswork with something honest: real people creating real content that causes real action.

### Vision
A world where creativity is the most valuable economic signal — not attention, not reach, not spend.

### Core Values
1. Human > Algorithm - We value coherent human behavior over platform-optimized metrics
2. Pay for Action, Not Noise - Action is what matters, not just views
3. Radical Fairness - Creators are paid based on what they actually generate
4. Trust Is a Product - Verification, transparency, and anti-fraud are the product
5. Creativity Is Infrastructure - We treat creators as economic infrastructure

### Key Differentiators
- Performance-Based: Brands only pay for verified human traction, not impressions
- Creator Verification: Every creator is profiled and scored on authenticity and behavior
- Smart Matching: Match creators to campaigns based on behavioral compatibility
- Scalable UGC: One campaign → hundreds of authentic videos, no management needed
- Algorithm-Resistant: Built to survive when algorithms change

### FAQ Knowledge
- Jarla is NOT an influencer platform - it's about outcomes and behavior
- Brands don't approve content before posting - creators act independently
- Small creators can earn well - Jarla rewards impact per viewer, not audience size
- Currently TikTok first, other platforms to follow

### How Jarla Speaks
- Precise, not hype
- Confident, not loud
- Human, not corporate
- Never say: "Guaranteed views", "Viral growth", "Influencer reach", "Hack the algorithm"
- Always emphasize: Human, Verified, Action, Fair, Real

## Your Role
You're helping a business sign up. Be helpful, concise, and friendly. Answer questions about Jarla accurately. Keep responses brief (1-3 sentences max). Stay on brand.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, companyName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Jarla chat request:', { message, companyName });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: JARLA_CONTEXT + (companyName ? `\n\nYou're currently helping ${companyName} sign up.` : '')
          },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          response: "I'm getting a lot of questions right now. Let me think for a moment..." 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          response: "Let's continue with your setup - I can answer more questions once you're on board!" 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "Let me help you with that - can you rephrase your question?";

    console.log('Jarla response:', aiResponse);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Jarla chat error:', error);
    return new Response(JSON.stringify({ 
      response: "Great question! Let's continue with your setup and I can tell you more as we go." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

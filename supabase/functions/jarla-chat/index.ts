import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JARLA_CONTEXT = `You are Jarla, the AI assistant for the Jarla platform. You help businesses create effective UGC campaigns.

## About Jarla

Jarla is a performance-based creator marketplace where brands pay for real human action — not impressions.

### Mission
To turn real human creativity into a measurable, fair, and trusted currency for brands. Jarla exists to replace fake reach, hollow impressions, and influencer guesswork with something honest: real people creating real content that causes real action.

### How Campaigns Work
1. Brands create a campaign with guidelines, budget, and payment tiers
2. Creators browse and join campaigns that fit their style
3. Creators post authentic content featuring the brand
4. Views are tracked and creators are paid based on performance
5. Brands only pay for verified human traction

### Campaign Best Practices
- Keep guidelines clear but not restrictive - let creators be authentic
- Set realistic budgets - allow for 5-10+ creator submissions
- Focus on what makes your brand unique, not scripted messaging
- Target the right audience demographics for your product
- Use compelling visuals and examples in your brief

### How Jarla Speaks
- Precise, not hype
- Confident, not loud
- Human, not corporate
- Always emphasize: Human, Verified, Action, Fair, Real

## Your Role
You're helping a business create a campaign. You already know their company details. Be helpful, concise, and friendly. Give specific, actionable advice for their campaign. Keep responses brief (2-4 sentences). Suggest concrete improvements based on their business.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, companyName, businessContext, conversationHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Jarla chat request:', { message, companyName, hasBusinessContext: !!businessContext });

    // Build context about the business
    let contextAddition = '';
    if (businessContext) {
      contextAddition = `\n\n## Business You're Helping\n`;
      contextAddition += `- Company: ${businessContext.company_name || companyName || 'Unknown'}\n`;
      if (businessContext.website) contextAddition += `- Website: ${businessContext.website}\n`;
      if (businessContext.description) contextAddition += `- Description: ${businessContext.description}\n`;
      contextAddition += `\nUse this knowledge to give personalized campaign advice. Reference their specific business when relevant.`;
    } else if (companyName) {
      contextAddition = `\n\nYou're currently helping ${companyName}.`;
    }

    // Build messages array with conversation history
    const messages = [
      { role: 'system', content: JARLA_CONTEXT + contextAddition }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role === 'jarla' ? 'assistant' : 'user',
          content: msg.content
        });
      }
    }

    // Add the current message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        max_tokens: 200,
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
          response: "Let's continue with your campaign - I can help you refine the details!" 
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
      response: "I'd love to help with that! Could you tell me more about what you're looking for?" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

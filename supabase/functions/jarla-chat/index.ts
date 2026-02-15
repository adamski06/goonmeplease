import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const JARLA_CONTEXT = `You are Jarla, the AI assistant for the Jarla platform. You help businesses create effective UGC campaigns.

## About Jarla

Jarla is a UGC (user-generated content) platform that connects brands with content creators for TikTok videos. Instead of brands having to manually find and negotiate with influencers, Jarla creates a marketplace where creators can easily pick up briefs and produce authentic videos for brands.

### Business Model
The platform is built around a pay-per-view system — brands pay based on actual view volume rather than a flat fee per video. This makes it lower risk for brands and creates a clear incentive for creators to produce content that actually performs. Creator earnings are capped at 10,000 SEK per year for tax compliance.

### How Campaigns Work
1. Brands create a campaign with guidelines, budget, and payment tiers
2. Creators browse and join campaigns that fit their style
3. Creators post authentic TikTok content featuring the brand
4. Views are tracked and creators are paid based on performance
5. Brands only pay for verified human traction

### Campaign Philosophy — CRITICAL
- CREATIVE FREEDOM is the #1 priority. The more freedom creators have, the better the content performs. UGC works because it feels real and authentic — over-scripting kills performance.
- Guidelines should be minimal and focused on DO's, not DON'Ts
- Never suggest restrictive rules — suggest loose, inspiring direction instead
- Budgets should allow for many creators (10,000-50,000 SEK range typically)
- Descriptions should be short, exciting, and give creators room to interpret

### How Jarla Speaks
- Precise, not hype
- Confident, not loud
- Human, not corporate

## Your Role
You're helping a business create a campaign. You already know their company from their profile. Be helpful, concise, and friendly. Keep responses brief (1-3 sentences).

## CRITICAL BEHAVIOR: Auto-fill the form
When the user confirms what they want to promote (e.g. says "Yes" or describes a product), you MUST immediately fill ALL form fields with smart suggestions based on what you know about their company. Don't ask more questions — just fill it all in and tell them they can tweak it.

Generate:
- title: A catchy, short campaign title
- description: 2-3 sentence brief that gives creators freedom and inspiration, NOT a rigid script
- total_budget: A sensible budget (15000-30000 SEK for starters)
- requirements: 3-5 loose, creator-friendly guidelines that maximize creative freedom. Focus on what TO do, not restrictions. Example: "Show yourself genuinely using the product", "Keep it authentic — no scripts", "Film vertically for TikTok"

## Form Editing Format
Respond with ONLY a valid JSON object:
{
  "message": "Your friendly response",
  "formUpdates": {
    "title": "Campaign title",
    "description": "Campaign description",
    "total_budget": 20000,
    "requirements": ["Guideline 1", "Guideline 2"]
  }
}

Only include formUpdates when updating the form. For normal chat:
{
  "message": "Your response"
}

ALWAYS respond with valid JSON. No markdown, no extra text outside the JSON.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, companyName, businessContext, conversationHistory, currentFormData } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Jarla chat request:', { message, companyName, hasBusinessContext: !!businessContext, hasFormData: !!currentFormData });

    // Build context about the business
    let contextAddition = '';
    if (businessContext) {
      contextAddition = `\n\n## Business You're Helping\n`;
      contextAddition += `- Company: ${businessContext.company_name || companyName || 'Unknown'}\n`;
      if (businessContext.website) contextAddition += `- Website: ${businessContext.website}\n`;
      if (businessContext.description) contextAddition += `- Description: ${businessContext.description}\n`;
      if (businessContext.industry) contextAddition += `- Industry: ${businessContext.industry}\n`;
      if (businessContext.target_audience) contextAddition += `- Target Audience: ${businessContext.target_audience}\n`;
      if (businessContext.brand_values) contextAddition += `- Brand Values: ${businessContext.brand_values}\n`;
      contextAddition += `\nYou already know this company well from their profile. Use this knowledge to give smart, personalized campaign suggestions. You know their products, audience, and brand — reference specifics, don't ask for info you already have.`;
    } else if (companyName) {
      contextAddition = `\n\nYou're currently helping ${companyName}.`;
    }

    // Add current form state
    if (currentFormData) {
      contextAddition += `\n\n## Current Campaign Form State\n`;
      contextAddition += `- Title: ${currentFormData.title || '(empty)'}\n`;
      contextAddition += `- Description: ${currentFormData.description || '(empty)'}\n`;
      contextAddition += `- Budget: ${currentFormData.total_budget || 0} SEK\n`;
      contextAddition += `- Deadline: ${currentFormData.deadline || '(not set)'}\n`;
      contextAddition += `- Requirements: ${currentFormData.requirements?.filter((r: string) => r.trim()).join(', ') || '(none)'}\n`;
      contextAddition += `\nThe user can see this form. When they ask you to fill it in or make changes, update the relevant fields.`;
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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          response: '{"message": "I\'m getting a lot of questions right now. Let me think for a moment..."}' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          response: '{"message": "Let\'s continue with your campaign - I can help you refine the details!"}' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    let aiResponse = data.choices?.[0]?.message?.content || '{"message": "Let me help you with that - can you rephrase your question?"}';

    console.log('Jarla raw response:', aiResponse);

    // Try to parse the response as JSON
    let parsedResponse;
    try {
      // Clean up potential markdown code blocks
      let cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate that we got a proper structure
      if (typeof parsedResponse !== 'object' || parsedResponse === null) {
        parsedResponse = { message: aiResponse };
      }
    } catch {
      // If it's not valid JSON, check if there's embedded JSON in the text
      const jsonMatch = aiResponse.match(/\{[\s\S]*"message"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch {
          parsedResponse = { message: aiResponse };
        }
      } else {
        parsedResponse = { message: aiResponse };
      }
    }

    // Extract just the message text - don't include raw JSON in the displayed message
    let messageText = parsedResponse.message || '';
    
    // If the message still contains JSON, strip it out
    if (messageText.includes('"formUpdates"') || messageText.includes('"message"')) {
      const cleanMessage = messageText.replace(/\{[\s\S]*"formUpdates"[\s\S]*\}/g, '').trim();
      if (cleanMessage) {
        messageText = cleanMessage;
      }
    }

    console.log('Jarla parsed response:', { message: messageText, formUpdates: parsedResponse.formUpdates });

    return new Response(JSON.stringify({ 
      response: messageText || "I've updated the form for you!",
      formUpdates: parsedResponse.formUpdates || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Jarla chat error:', error);
    return new Response(JSON.stringify({ 
      response: "I'd love to help with that! Could you tell me more about what you're looking for?",
      formUpdates: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

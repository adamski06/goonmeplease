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
You're helping a business create a campaign. You already know their company details. Be helpful, concise, and friendly. Give specific, actionable advice for their campaign. Keep responses brief (2-4 sentences). Suggest concrete improvements based on their business.

## IMPORTANT: Form Editing Capability
You can directly edit the campaign form! When the user asks you to fill in, update, or suggest content for their campaign, you MUST respond with a JSON object containing both your message and form updates.

The form has these fields:
- title: Campaign title (string)
- description: Campaign description (string)
- total_budget: Budget in SEK, minimum 10000 (number)
- deadline: Deadline date in YYYY-MM-DD format (string)
- requirements: Array of requirement strings (string[])

When you want to update the form, respond with ONLY a valid JSON object in this exact format:
{
  "message": "Your friendly response explaining what you did",
  "formUpdates": {
    "title": "New title here",
    "description": "New description",
    "total_budget": 15000,
    "requirements": ["Requirement 1", "Requirement 2"]
  }
}

Only include fields in formUpdates that you want to change. If the user is just chatting and not asking to edit the form, respond with just the message field:
{
  "message": "Your normal conversational response"
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
      contextAddition += `\nUse this knowledge to give personalized campaign advice. Reference their specific business when relevant.`;
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
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      // If it's not valid JSON, wrap it as a message
      parsedResponse = { message: aiResponse };
    }

    console.log('Jarla parsed response:', parsedResponse);

    return new Response(JSON.stringify({ 
      response: parsedResponse.message || aiResponse,
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

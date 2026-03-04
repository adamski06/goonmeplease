import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Cache the rate for 1 hour
let cachedRate: { usdToSek: number; timestamp: number } | null = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Return cached if fresh
    if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify({ usdToSek: cachedRate.usdToSek }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch from free API (no key needed)
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) {
      throw new Error(`Exchange rate API returned ${res.status}`);
    }
    const data = await res.json();
    const usdToSek = data.rates?.SEK || 10.5; // fallback

    cachedRate = { usdToSek, timestamp: Date.now() };

    return new Response(JSON.stringify({ usdToSek }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Exchange rate error:', error);
    // Return fallback rate
    return new Response(JSON.stringify({ usdToSek: 10.5 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

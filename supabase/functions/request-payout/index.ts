import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = userData.user.id;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get profile with stripe_connect_id
    const { data: profile } = await adminClient
      .from("profiles")
      .select("stripe_connect_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.stripe_connect_id) {
      return new Response(JSON.stringify({ error: "Bank account not connected. Please connect your bank first." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get min payout amount from settings
    const { data: setting } = await adminClient
      .from("platform_settings")
      .select("value")
      .eq("key", "min_payout_amount")
      .maybeSingle();
    const minPayout = parseFloat(setting?.value || "9.50");

    // Get creator balance (unpaid earnings where payout cooldown has passed)
    const { data: stats } = await adminClient
      .from("creator_stats")
      .select("total_balance")
      .eq("user_id", userId)
      .maybeSingle();

    const balance = stats?.total_balance || 0;
    if (balance < minPayout) {
      return new Response(JSON.stringify({ error: `Minimum payout is ${minPayout} USD. Current balance: ${balance} USD.` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check no pending payout request exists
    const { data: pending } = await adminClient
      .from("payout_requests")
      .select("id")
      .eq("creator_id", userId)
      .in("status", ["pending", "processing"])
      .limit(1);

    if (pending && pending.length > 0) {
      return new Response(JSON.stringify({ error: "You already have a pending payout request." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check 7-day cooldown: all unpaid earnings must be at least 7 days old
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentEarnings } = await adminClient
      .from("earnings")
      .select("id")
      .eq("creator_id", userId)
      .eq("is_paid", false)
      .gt("created_at", sevenDaysAgo)
      .limit(1);

    if (recentEarnings && recentEarnings.length > 0) {
      return new Response(JSON.stringify({ error: "Some earnings are still within the 7-day cooldown period." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create payout request
    const { data: request, error: insertError } = await adminClient
      .from("payout_requests")
      .insert({
        creator_id: userId,
        amount: balance,
        status: "pending",
        stripe_account_id: profile.stripe_connect_id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true, request }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

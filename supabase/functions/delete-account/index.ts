import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user with anon client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await anonClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Use service role to delete all user data
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete in order respecting foreign keys
    await adminClient.from("earnings").delete().eq("creator_id", userId);
    await adminClient.from("content_submissions").delete().eq("creator_id", userId);
    await adminClient.from("reward_submissions").delete().eq("creator_id", userId);
    await adminClient.from("deal_applications").delete().eq("creator_id", userId);
    await adminClient.from("payout_requests").delete().eq("creator_id", userId);
    await adminClient.from("support_requests").delete().eq("user_id", userId);
    await adminClient.from("favorites").delete().eq("user_id", userId);
    await adminClient.from("tiktok_accounts").delete().eq("user_id", userId);
    await adminClient.from("creator_stats").delete().eq("user_id", userId);

    // Delete business data if business user
    const { data: businessProfile } = await adminClient
      .from("business_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (businessProfile) {
      // Delete campaigns and related data
      const { data: campaigns } = await adminClient
        .from("campaigns")
        .select("id")
        .eq("business_id", userId);

      if (campaigns?.length) {
        const campaignIds = campaigns.map((c) => c.id);
        await adminClient.from("campaign_tiers").delete().in("campaign_id", campaignIds);
        await adminClient.from("content_submissions").delete().in("campaign_id", campaignIds);
        await adminClient.from("campaigns").delete().eq("business_id", userId);
      }

      // Delete deals
      const { data: deals } = await adminClient
        .from("deals")
        .select("id")
        .eq("business_id", userId);

      if (deals?.length) {
        const dealIds = deals.map((d) => d.id);
        await adminClient.from("deal_applications").delete().in("deal_id", dealIds);
        await adminClient.from("deals").delete().eq("business_id", userId);
      }

      // Delete reward ads
      const { data: rewardAds } = await adminClient
        .from("reward_ads")
        .select("id")
        .eq("business_id", userId);

      if (rewardAds?.length) {
        const rewardAdIds = rewardAds.map((r) => r.id);
        await adminClient.from("reward_submissions").delete().in("reward_ad_id", rewardAdIds);
        await adminClient.from("reward_ads").delete().eq("business_id", userId);
      }

      await adminClient.from("business_profiles").delete().eq("user_id", userId);
    }

    // Delete profile and roles
    await adminClient.from("profiles").delete().eq("user_id", userId);
    await adminClient.from("user_roles").delete().eq("user_id", userId);

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Failed to delete auth user:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete account" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

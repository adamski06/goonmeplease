import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function deleteUserData(adminClient: any, userId: string) {
  // Delete in order respecting foreign keys
  // First: earnings (references content_submissions)
  await adminClient.from("earnings").delete().eq("creator_id", userId);
  
  // Second: content_submissions (references tiktok_accounts & campaigns)
  await adminClient.from("content_submissions").delete().eq("creator_id", userId);
  
  // Third: reward_submissions (references tiktok_accounts & reward_ads)
  await adminClient.from("reward_submissions").delete().eq("creator_id", userId);
  
  // Fourth: deal_applications
  await adminClient.from("deal_applications").delete().eq("creator_id", userId);
  
  // Now safe to delete tiktok_accounts (no more FK references)
  await adminClient.from("tiktok_accounts").delete().eq("user_id", userId);
  
  // Other user data
  await adminClient.from("payout_requests").delete().eq("creator_id", userId);
  await adminClient.from("support_requests").delete().eq("user_id", userId);
  await adminClient.from("favorites").delete().eq("user_id", userId);
  await adminClient.from("notifications").delete().eq("user_id", userId);
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
      const campaignIds = campaigns.map((c: any) => c.id);
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
      const dealIds = deals.map((d: any) => d.id);
      await adminClient.from("deal_applications").delete().in("deal_id", dealIds);
      await adminClient.from("deals").delete().eq("business_id", userId);
    }

    // Delete reward ads
    const { data: rewardAds } = await adminClient
      .from("reward_ads")
      .select("id")
      .eq("business_id", userId);

    if (rewardAds?.length) {
      const rewardAdIds = rewardAds.map((r: any) => r.id);
      await adminClient.from("reward_submissions").delete().in("reward_ad_id", rewardAdIds);
      await adminClient.from("reward_ads").delete().eq("business_id", userId);
    }

    await adminClient.from("business_profiles").delete().eq("user_id", userId);
  }

  // Delete profile and roles
  await adminClient.from("profiles").delete().eq("user_id", userId);
  await adminClient.from("user_roles").delete().eq("user_id", userId);
}

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Determine target user
    let targetUserId: string;
    
    // Check if this is a service-role call with target_user_id
    const isServiceRole = authHeader.replace("Bearer ", "") === serviceRoleKey;
    
    if (isServiceRole) {
      // Service role can delete any user by specifying target_user_id
      try {
        const body = await req.json();
        if (!body?.target_user_id) {
          return new Response(JSON.stringify({ error: "target_user_id required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        targetUserId = body.target_user_id;
      } catch {
        return new Response(JSON.stringify({ error: "Invalid request body" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Regular user self-delete
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

      targetUserId = user.id;
      
      // Check if admin is deleting another user
      try {
        const body = await req.json();
        if (body?.target_user_id) {
          const { data: isAdmin } = await adminClient.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          });
          
          if (!isAdmin) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          targetUserId = body.target_user_id;
        }
      } catch {
        // No body — self-delete
      }
    }

    await deleteUserData(adminClient, targetUserId);

    // Delete the auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId);
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

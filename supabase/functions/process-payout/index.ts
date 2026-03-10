import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const adminUserId = userData.user.id;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin role
    const { data: isAdmin } = await adminClient.rpc("has_role", { _user_id: adminUserId, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { payout_request_id, action } = await req.json();

    if (!payout_request_id || !action) {
      return new Response(JSON.stringify({ error: "Missing payout_request_id or action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the payout request
    const { data: payoutReq } = await adminClient
      .from("payout_requests")
      .select("*")
      .eq("id", payout_request_id)
      .eq("status", "pending")
      .maybeSingle();

    if (!payoutReq) {
      return new Response(JSON.stringify({ error: "Payout request not found or already processed" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "reject") {
      const { admin_notes } = await req.json().catch(() => ({}));
      await adminClient
        .from("payout_requests")
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUserId,
          admin_notes: admin_notes || null,
        })
        .eq("id", payout_request_id);

      return new Response(JSON.stringify({ success: true, status: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "approve") {
      // Update to processing
      await adminClient
        .from("payout_requests")
        .update({ status: "processing" })
        .eq("id", payout_request_id);

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2025-08-27.basil" });

      // Amount in cents
      const amountCents = Math.round(payoutReq.amount * 100);

      // Create transfer to connected account
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: "usd",
        destination: payoutReq.stripe_account_id,
        metadata: {
          payout_request_id: payoutReq.id,
          creator_id: payoutReq.creator_id,
        },
      });

      // Mark payout as paid
      await adminClient
        .from("payout_requests")
        .update({
          status: "paid",
          stripe_transfer_id: transfer.id,
          reviewed_at: new Date().toISOString(),
          reviewed_by: adminUserId,
        })
        .eq("id", payout_request_id);

      // Mark all unpaid earnings as paid
      await adminClient
        .from("earnings")
        .update({ is_paid: true, paid_at: new Date().toISOString() })
        .eq("creator_id", payoutReq.creator_id)
        .eq("is_paid", false);

      // Update creator_stats
      await adminClient
        .from("creator_stats")
        .update({ total_balance: 0, pending_balance: 0, updated_at: new Date().toISOString() })
        .eq("user_id", payoutReq.creator_id);

      return new Response(JSON.stringify({ success: true, status: "paid", transfer_id: transfer.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[process-payout] error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

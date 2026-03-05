import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHARGE_AMOUNT_CENTS = 120; // $1.20 per video

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reward_ad_id, business_id } = await req.json();
    if (!reward_ad_id || !business_id) {
      throw new Error("Missing reward_ad_id or business_id");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the business's Stripe customer ID
    const { data: bp, error: bpError } = await supabaseAdmin
      .from("business_profiles")
      .select("stripe_customer_id, company_name")
      .eq("user_id", business_id)
      .maybeSingle();

    if (bpError || !bp?.stripe_customer_id) {
      throw new Error("Business has no saved payment method");
    }

    // Get reward ad title for description
    const { data: reward } = await supabaseAdmin
      .from("reward_ads")
      .select("title")
      .eq("id", reward_ad_id)
      .maybeSingle();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Get the customer's default payment method
    const customer = await stripe.customers.retrieve(bp.stripe_customer_id);
    if (customer.deleted) throw new Error("Stripe customer has been deleted");

    const defaultPm = customer.invoice_settings?.default_payment_method;
    if (!defaultPm) {
      // Try to find any payment method
      const pms = await stripe.paymentMethods.list({
        customer: bp.stripe_customer_id,
        type: "card",
        limit: 1,
      });
      if (pms.data.length === 0) {
        throw new Error("No payment method on file for this business");
      }
      // Use the first available
      const paymentMethodId = pms.data[0].id;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: CHARGE_AMOUNT_CENTS,
        currency: "usd",
        customer: bp.stripe_customer_id,
        payment_method: paymentMethodId,
        off_session: true,
        confirm: true,
        description: `Jarla Reward: ${reward?.title || reward_ad_id} — video submission`,
        metadata: {
          reward_ad_id,
          business_id,
          type: "reward_video_charge",
        },
      });

      return new Response(JSON.stringify({ success: true, payment_intent_id: paymentIntent.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Charge using default payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: CHARGE_AMOUNT_CENTS,
      currency: "usd",
      customer: bp.stripe_customer_id,
      payment_method: defaultPm as string,
      off_session: true,
      confirm: true,
      description: `Jarla Reward: ${reward?.title || reward_ad_id} — video submission`,
      metadata: {
        reward_ad_id,
        business_id,
        type: "reward_video_charge",
      },
    });

    return new Response(JSON.stringify({ success: true, payment_intent_id: paymentIntent.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[charge-reward-video] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

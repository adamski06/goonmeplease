import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/twilio";
const TWILIO_FROM_NUMBER = "+14783751461";

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
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const twilioApiKey = Deno.env.get("TWILIO_API_KEY");

    if (!lovableApiKey || !twilioApiKey) {
      return new Response(JSON.stringify({ error: "SMS service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await anonClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action, phone, code } = body;

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    if (action === "send") {
      // Validate phone number (E.164 format)
      const cleanPhone = phone?.trim();
      if (!cleanPhone || !/^\+[1-9]\d{6,14}$/.test(cleanPhone)) {
        return new Response(JSON.stringify({ error: "Invalid phone number. Use international format (e.g. +46701234567)" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Rate limit: max 3 codes per user per 10 minutes
      const { data: recentCodes } = await adminClient
        .from("phone_verifications")
        .select("id")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

      if (recentCodes && recentCodes.length >= 3) {
        return new Response(JSON.stringify({ error: "Too many attempts. Please wait a few minutes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate 6-digit code
      const verifyCode = String(Math.floor(100000 + Math.random() * 900000));

      // Store code
      await adminClient.from("phone_verifications").insert({
        user_id: user.id,
        phone_number: cleanPhone,
        code: verifyCode,
      });

      // Send SMS via Twilio gateway
      const smsResponse = await fetch(`${GATEWAY_URL}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${lovableApiKey}`,
          "X-Connection-Api-Key": twilioApiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: cleanPhone,
          From: TWILIO_FROM_NUMBER,
          Body: `Your Jarla verification code is: ${verifyCode}`,
        }),
      });

      const smsData = await smsResponse.json();
      if (!smsResponse.ok) {
        console.error("Twilio error:", JSON.stringify(smsData));
        return new Response(JSON.stringify({ error: "Failed to send verification code" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (action === "verify") {
      const cleanPhone = phone?.trim();
      const cleanCode = code?.trim();

      if (!cleanPhone || !cleanCode || cleanCode.length !== 6) {
        return new Response(JSON.stringify({ error: "Invalid verification code" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find matching unexpired code
      const { data: verification } = await adminClient
        .from("phone_verifications")
        .select("id")
        .eq("user_id", user.id)
        .eq("phone_number", cleanPhone)
        .eq("code", cleanCode)
        .eq("verified", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!verification) {
        return new Response(JSON.stringify({ error: "Invalid or expired code" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Mark as verified
      await adminClient
        .from("phone_verifications")
        .update({ verified: true })
        .eq("id", verification.id);

      // Update user profile with verified phone
      await adminClient
        .from("profiles")
        .update({ phone_number: cleanPhone })
        .eq("user_id", user.id);

      return new Response(JSON.stringify({ success: true, verified: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Phone verify error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHEETS = "https://connector-gateway.lovable.dev/google_sheets/v4";

function gwHeaders(connectorKey: string) {
  return {
    Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    "X-Connection-Api-Key": connectorKey,
    "Content-Type": "application/json",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: u } = await userClient.auth.getUser();
    const user = u?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { submissionId } = await req.json();
    if (!submissionId) return new Response(JSON.stringify({ error: "submissionId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Call SQL function with user's JWT so RLS/owner checks apply
    const { data: code, error: claimErr } = await userClient.rpc("claim_reward_coupon", { p_submission_id: submissionId });
    if (claimErr) {
      return new Response(JSON.stringify({ error: claimErr.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!code) {
      return new Response(JSON.stringify({ error: "No code returned" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Look up reward_ad + coupon to update sheet
    const { data: sub } = await admin.from("reward_submissions").select("reward_ad_id, creator_id").eq("id", submissionId).maybeSingle();
    if (sub) {
      const { data: ad } = await admin.from("reward_ads").select("coupon_sheet_id").eq("id", sub.reward_ad_id).maybeSingle();
      const { data: coupon } = await admin.from("reward_coupons").select("sheet_row, claimed_at").eq("reward_ad_id", sub.reward_ad_id).eq("code", code).maybeSingle();

      if (ad?.coupon_sheet_id && coupon?.sheet_row) {
        const sheetsKey = Deno.env.get("GOOGLE_SHEETS_API_KEY")!;
        const { data: profile } = await admin.from("profiles").select("username, full_name").eq("user_id", sub.creator_id).maybeSingle();
        const claimedBy = profile?.username ? `@${profile.username}` : (profile?.full_name || sub.creator_id);
        const usedAt = (coupon.claimed_at || new Date().toISOString()).replace("T", " ").slice(0, 19);
        await fetch(`${SHEETS}/spreadsheets/${ad.coupon_sheet_id}/values/Coupons!B${coupon.sheet_row}:D${coupon.sheet_row}?valueInputOption=RAW`, {
          method: "PUT",
          headers: gwHeaders(sheetsKey),
          body: JSON.stringify({ values: [["USED", usedAt, claimedBy]] }),
        }).catch(() => {});
      }
    }

    return new Response(JSON.stringify({ code }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

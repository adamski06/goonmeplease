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

    const { rewardAdId } = await req.json();
    if (!rewardAdId) return new Response(JSON.stringify({ error: "rewardAdId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: ad } = await admin.from("reward_ads").select("id, business_id, coupon_sheet_id").eq("id", rewardAdId).maybeSingle();
    if (!ad) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (ad.business_id !== user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!ad.coupon_sheet_id) {
      return new Response(JSON.stringify({ error: "No sheet linked" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sheetsKey = Deno.env.get("GOOGLE_SHEETS_API_KEY")!;
    // Read column A from row 2 down
    const valuesRes = await fetch(`${SHEETS}/spreadsheets/${ad.coupon_sheet_id}/values/Coupons!A2:A?majorDimension=ROWS`, { headers: gwHeaders(sheetsKey) });
    if (!valuesRes.ok) {
      const t = await valuesRes.text();
      return new Response(JSON.stringify({ error: "Sheet read failed", detail: t }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const json = await valuesRes.json();
    const rows: string[][] = json.values || [];

    let added = 0, updated = 0;
    for (let i = 0; i < rows.length; i++) {
      const code = String(rows[i]?.[0] || "").trim();
      if (!code) continue;
      const sheetRow = i + 2; // header is row 1
      // Upsert: try update by (reward_ad_id, code), else insert
      const { data: existing } = await admin.from("reward_coupons").select("id, sheet_row").eq("reward_ad_id", rewardAdId).eq("code", code).maybeSingle();
      if (existing) {
        if (existing.sheet_row !== sheetRow) {
          await admin.from("reward_coupons").update({ sheet_row: sheetRow }).eq("id", existing.id);
          updated++;
        }
      } else {
        const { error: insErr } = await admin.from("reward_coupons").insert({ reward_ad_id: rewardAdId, code, sheet_row: sheetRow });
        if (!insErr) added++;
      }
    }

    const { count: total } = await admin.from("reward_coupons").select("*", { count: "exact", head: true }).eq("reward_ad_id", rewardAdId);
    const { count: unclaimed } = await admin.from("reward_coupons").select("*", { count: "exact", head: true }).eq("reward_ad_id", rewardAdId).is("claimed_at", null);

    return new Response(JSON.stringify({ added, updated, total, unclaimed, scanned: rows.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

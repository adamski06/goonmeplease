import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHEETS = "https://connector-gateway.lovable.dev/google_sheets/v4";
const DRIVE = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Identify caller
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { rewardAdId } = await req.json();
    if (!rewardAdId) return new Response(JSON.stringify({ error: "rewardAdId required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: ad } = await supabase.from("reward_ads").select("id, title, business_id, coupon_sheet_id, coupon_sheet_url").eq("id", rewardAdId).maybeSingle();
    if (!ad) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (ad.business_id !== user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // If already exists, return it
    if (ad.coupon_sheet_id && ad.coupon_sheet_url) {
      return new Response(JSON.stringify({ spreadsheetId: ad.coupon_sheet_id, url: ad.coupon_sheet_url, existed: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const sheetsKey = Deno.env.get("GOOGLE_SHEETS_API_KEY")!;
    const driveKey = Deno.env.get("GOOGLE_DRIVE_API_KEY")!;

    // 1) Create spreadsheet
    const createRes = await fetch(`${SHEETS}/spreadsheets`, {
      method: "POST",
      headers: gwHeaders(sheetsKey),
      body: JSON.stringify({
        properties: { title: `Jarla Coupons – ${ad.title}` },
        sheets: [{ properties: { title: "Coupons" } }],
      }),
    });
    if (!createRes.ok) {
      const t = await createRes.text();
      return new Response(JSON.stringify({ error: "Sheet create failed", detail: t }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sheet = await createRes.json();
    const spreadsheetId = sheet.spreadsheetId as string;
    const url = sheet.spreadsheetUrl as string;

    // 2) Write header
    await fetch(`${SHEETS}/spreadsheets/${spreadsheetId}/values/Coupons!A1:D1?valueInputOption=RAW`, {
      method: "PUT",
      headers: gwHeaders(sheetsKey),
      body: JSON.stringify({ values: [["Code", "Status", "Used At", "Claimed By"]] }),
    });

    // 3) Share with business owner email
    const { data: ownerRes } = await supabase.auth.admin.getUserById(ad.business_id);
    const ownerEmail = ownerRes?.user?.email;
    if (ownerEmail) {
      await fetch(`${DRIVE}/files/${spreadsheetId}/permissions?sendNotificationEmail=true`, {
        method: "POST",
        headers: gwHeaders(driveKey),
        body: JSON.stringify({ type: "user", role: "writer", emailAddress: ownerEmail }),
      });
    }

    // 4) Save on reward_ad
    await supabase.from("reward_ads").update({
      coupon_sheet_id: spreadsheetId,
      coupon_sheet_url: url,
      coupon_source: "sheet",
    }).eq("id", rewardAdId);

    return new Response(JSON.stringify({ spreadsheetId, url, sharedWith: ownerEmail }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("reward-sheet-create error", e);
    return new Response(JSON.stringify({ error: String(e?.message || e), stack: String(e?.stack || "") }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

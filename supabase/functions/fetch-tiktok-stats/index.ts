import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_ids } = await req.json();

    if (!submission_ids || !Array.isArray(submission_ids) || submission_ids.length === 0) {
      return new Response(JSON.stringify({ error: "submission_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch submissions
    const { data: submissions, error: fetchError } = await supabase
      .from("content_submissions")
      .select("id, tiktok_video_url, tiktok_video_id, campaign_id")
      .in("id", submission_ids);

    if (fetchError) throw fetchError;

    const results: Record<string, { views: number; likes: number; shares: number; earnings: number }> = {};

    // Fetch stats from TikTok oEmbed for each submission
    for (const sub of submissions || []) {
      try {
        const url = sub.tiktok_video_url;
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl);

        if (res.ok) {
          const data = await res.json();
          const views = data.view_count || data.statistics?.playCount || 0;
          const likes = data.like_count || data.statistics?.diggCount || 0;
          const shares = data.share_count || data.statistics?.shareCount || 0;

          results[sub.id] = { views, likes, shares, earnings: 0 };

          if (views > 0 || likes > 0 || shares > 0) {
            await supabase
              .from("content_submissions")
              .update({
                current_views: views,
                current_likes: likes,
                current_shares: shares,
              })
              .eq("id", sub.id);
          }
        }
      } catch (e) {
        console.error(`Failed to fetch stats for ${sub.id}:`, e);
        results[sub.id] = { views: 0, likes: 0, shares: 0, earnings: 0 };
      }
    }

    // Fallback: scrape page for submissions with 0 views
    for (const sub of submissions || []) {
      if (results[sub.id]?.views === 0 && sub.tiktok_video_id) {
        try {
          const pageRes = await fetch(sub.tiktok_video_url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });
          const html = await pageRes.text();

          const viewMatch = html.match(/"playCount"\s*:\s*(\d+)/);
          const likeMatch = html.match(/"diggCount"\s*:\s*(\d+)/);
          const shareMatch = html.match(/"shareCount"\s*:\s*(\d+)/);

          const views = viewMatch ? parseInt(viewMatch[1]) : 0;
          const likes = likeMatch ? parseInt(likeMatch[1]) : 0;
          const shares = shareMatch ? parseInt(shareMatch[1]) : 0;

          if (views > 0 || likes > 0 || shares > 0) {
            results[sub.id] = { ...results[sub.id], views, likes, shares };
            await supabase
              .from("content_submissions")
              .update({
                current_views: views,
                current_likes: likes,
                current_shares: shares,
              })
              .eq("id", sub.id);
          }
        } catch (e) {
          console.error(`Page scrape failed for ${sub.id}:`, e);
        }
      }
    }

    // Calculate earnings for each submission based on views and campaign tiers
    for (const sub of submissions || []) {
      if (results[sub.id]?.views > 0) {
        try {
          const { data: earnings, error: earningsError } = await supabase
            .rpc("calculate_submission_earnings", { p_submission_id: sub.id });
          
          if (!earningsError && earnings !== null) {
            results[sub.id].earnings = earnings;
          }
        } catch (e) {
          console.error(`Earnings calc failed for ${sub.id}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

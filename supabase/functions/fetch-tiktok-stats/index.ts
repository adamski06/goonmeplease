import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function fetchTiktokStats(videoUrl: string, videoId: string | null) {
  let views = 0, likes = 0, shares = 0;

  // Try oEmbed first
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      views = data.view_count || data.statistics?.playCount || 0;
      likes = data.like_count || data.statistics?.diggCount || 0;
      shares = data.share_count || data.statistics?.shareCount || 0;
    }
  } catch (e) {
    console.error("oEmbed failed:", e);
  }

  // Fallback: scrape page
  if (views === 0 && videoId) {
    try {
      const pageRes = await fetch(videoUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const html = await pageRes.text();
      const viewMatch = html.match(/"playCount"\s*:\s*(\d+)/);
      const likeMatch = html.match(/"diggCount"\s*:\s*(\d+)/);
      const shareMatch = html.match(/"shareCount"\s*:\s*(\d+)/);
      if (viewMatch) views = parseInt(viewMatch[1]);
      if (likeMatch) likes = parseInt(likeMatch[1]);
      if (shareMatch) shares = parseInt(shareMatch[1]);
    } catch (e) {
      console.error("Page scrape failed:", e);
    }
  }

  return { views, likes, shares };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { submission_ids, reward_submission_ids } = body;

    const hasSpread = submission_ids && Array.isArray(submission_ids) && submission_ids.length > 0;
    const hasReward = reward_submission_ids && Array.isArray(reward_submission_ids) && reward_submission_ids.length > 0;

    if (!hasSpread && !hasReward) {
      return new Response(JSON.stringify({ error: "submission_ids or reward_submission_ids required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results: Record<string, { views: number; likes: number; shares: number; earnings: number }> = {};

    // --- Handle spread/content submissions ---
    if (hasSpread) {
      const { data: submissions, error: fetchError } = await supabase
        .from("content_submissions")
        .select("id, tiktok_video_url, tiktok_video_id, campaign_id")
        .in("id", submission_ids);

      if (fetchError) throw fetchError;

      for (const sub of submissions || []) {
        const stats = await fetchTiktokStats(sub.tiktok_video_url, sub.tiktok_video_id);
        results[sub.id] = { ...stats, earnings: 0 };

        if (stats.views > 0 || stats.likes > 0 || stats.shares > 0) {
          await supabase
            .from("content_submissions")
            .update({
              current_views: stats.views,
              current_likes: stats.likes,
              current_shares: stats.shares,
            })
            .eq("id", sub.id);
        }
      }

      // Calculate earnings
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
    }

    // --- Handle reward submissions ---
    if (hasReward) {
      const { data: rewardSubs, error: rewardError } = await supabase
        .from("reward_submissions")
        .select("id, tiktok_video_url, tiktok_video_id, reward_ad_id")
        .in("id", reward_submission_ids);

      if (rewardError) throw rewardError;

      for (const sub of rewardSubs || []) {
        const stats = await fetchTiktokStats(sub.tiktok_video_url, sub.tiktok_video_id);
        results[sub.id] = { ...stats, earnings: 0 };

        if (stats.views > 0 || stats.likes > 0) {
          await supabase
            .from("reward_submissions")
            .update({
              current_views: stats.views,
              current_likes: stats.likes,
            })
            .eq("id", sub.id);
          console.log(`Updated reward stats for ${sub.id}: views=${stats.views}, likes=${stats.likes}`);
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

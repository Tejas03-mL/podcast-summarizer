import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Max-Age": "86400",
};

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getThumbnail(videoUrl: string): string | null {
  const ytId = extractYouTubeId(videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  return null;
}

function buildFallbackSummary(videoTitle: string, videoUrl: string, ytId: string | null, channelName?: string | null) {
  const topic = videoTitle.trim() || (ytId ? `YouTube Video ${ytId}` : "Video");
  const sourceLabel = channelName?.trim() || (ytId ? "YouTube" : "the provided link");

  return {
    title: topic,
    summary: `This is a no-key fallback summary generated from the available metadata for ${topic}. The app could not reach the Lovable AI gateway, so it inferred the likely topic from the title, URL, and source metadata from ${sourceLabel}. For a full AI summary, add a valid LOVABLE_API_KEY or connect another AI provider.`,
    key_points: [
      `Topic inferred from the available metadata: ${topic}`,
      `Source detected from ${sourceLabel}`,
      "No external AI key was available, so this output is deterministic and safe for local testing.",
      "Add a transcript or connect an AI provider for richer summaries.",
      "Use this fallback to keep the app functional while you configure production credentials.",
    ],
    tags: ["fallback", "metadata", "local-dev"],
    estimated_duration: 300,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { videoUrl, title } = await req.json();

    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "videoUrl is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ytId = extractYouTubeId(videoUrl);
    const thumbnail = getThumbnail(videoUrl);
    const providedTitle = typeof title === "string" ? title : "";
    let videoTitle = providedTitle || (ytId ? `YouTube Video - ${ytId}` : "Video");

    if (ytId && !providedTitle) {
      try {
        const oEmbedResponse = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`
        );

        if (oEmbedResponse.ok) {
          const oEmbedData = await oEmbedResponse.json();
          videoTitle = oEmbedData.title || videoTitle;
        }
      } catch (error) {
        console.warn("YouTube oEmbed lookup failed:", error);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const denoEnv = Deno.env.get("DENO_ENV") || Deno.env.get("NODE_ENV") || "development";
    const isProd = denoEnv === "production";

    if (!LOVABLE_API_KEY) {
      if (isProd) {
        throw new Error("LOVABLE_API_KEY is not configured");
      }

      console.warn("LOVABLE_API_KEY not set — returning fallback summary for development.");
      const fallback = buildFallbackSummary(videoTitle, videoUrl, ytId);

      return new Response(
        JSON.stringify({
          title: fallback.title,
          summary: fallback.summary,
          key_points: fallback.key_points,
          tags: fallback.tags,
          thumbnail_url: thumbnail,
          duration_seconds: fallback.estimated_duration,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are an expert podcast and video content analyzer. Your task is to analyze the provided video/podcast information and generate a comprehensive, well-structured summary. 

When given a YouTube URL or video link, analyze the metadata available and create an intelligent summary based on the video context, title, and URL patterns.

Always respond in JSON format with this exact structure:
{
  "title": "Video/Podcast Title",
  "summary": "A comprehensive 3-5 paragraph summary of the content...",
  "key_points": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "tags": ["tag1", "tag2", "tag3"],
  "estimated_duration": 1800
}

Make the summary engaging, informative, and useful. The key_points should be actionable insights. Tags should be relevant topics (3-5 tags).`;

    const userPrompt = `Please analyze this video and provide a comprehensive summary:

Video URL: ${videoUrl}
${ytId ? `YouTube Video ID: ${ytId}` : ""}
${title ? `Title: ${title}` : ""}

Generate an insightful summary, key points, and relevant tags for this content. Make the summary detailed and valuable for someone who wants to understand the main ideas without watching the full video.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content from AI");
    }

    const parsed = JSON.parse(content);

    return new Response(
      JSON.stringify({
        title: parsed.title || videoTitle,
        summary: parsed.summary || "Summary generated successfully.",
        key_points: parsed.key_points || [],
        tags: parsed.tags || [],
        thumbnail_url: thumbnail,
        duration_seconds: parsed.estimated_duration || null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

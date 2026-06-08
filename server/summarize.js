// Local dev summarization server — replaces the Supabase Edge Function.
// Supports: Groq (primary, free) → Gemini (fallback)
// Run: node server/summarize.js
// Vite proxies /api/summarize → http://localhost:3456/summarize

import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ── Load .env from project root ──────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = val;
  }
}
// ─────────────────────────────────────────────────────────────────────────────

const PORT = 3456;
const GROQ_API_KEY   = process.env.VITE_GROQ_API_KEY   || process.env.GROQ_API_KEY   || "";
const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY  || process.env.GEMINI_API_KEY  || "";

// Groq config (OpenAI-compatible, free tier: 14,400 req/day)
const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";   // high quality, free

// Gemini config (fallback)
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL   = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Content-Type": "application/json",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getThumbnail(url) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

function fetchJson(urlStr, options) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const reqOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method,
      headers: options.headers,
    };
    const req = https.request(reqOptions, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function getVideoTitle(videoUrl) {
  try {
    const res = await fetchJson(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`,
      { method: "GET", headers: {} }
    );
    return res.body?.title || null;
  } catch {
    return null;
  }
}

function buildPrompt(videoUrl, videoTitle, ytId) {
  return `You are an expert podcast and video content analyzer.

Analyze this video and return ONLY a valid JSON object with EXACTLY this structure:
{
  "title": "the video title as a string",
  "summary": "a comprehensive 3-5 paragraph summary as a string",
  "key_points": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "tags": ["tag1", "tag2", "tag3"],
  "estimated_duration": 300
}

Video details:
- URL: ${videoUrl}
- Title: ${videoTitle}
${ytId ? `- YouTube ID: ${ytId}` : ""}

Rules:
- Return ONLY the JSON object, no markdown, no explanation, no code fences.
- Make the summary engaging and insightful.
- Key points should be actionable takeaways.
- Tags: 3-5 relevant topic keywords (lowercase).
- estimated_duration: your best guess in seconds based on the title/content type.`;
}

// ── Groq (primary) ───────────────────────────────────────────────────────────
async function callGroq(prompt) {
  const payload = JSON.stringify({
    model: GROQ_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const res = await fetchJson(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: payload,
  });

  if (res.status !== 200) {
    const msg = res.body?.error?.message || JSON.stringify(res.body);
    throw new Error(`Groq API error ${res.status}: ${msg}`);
  }

  const content = res.body.choices?.[0]?.message?.content || "";
  return JSON.parse(content);
}

// ── Gemini (fallback) ─────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const payload = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
  });

  const res = await fetchJson(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
  });

  if (res.status !== 200) {
    const msg = res.body?.error?.message || JSON.stringify(res.body);
    throw new Error(`Gemini API error ${res.status}: ${msg}`);
  }

  const text = res.body.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(clean);
}

// ── Smart provider selection ─────────────────────────────────────────────────
async function callAI(prompt) {
  if (GROQ_API_KEY) {
    console.log("[api] Using provider: Groq (llama-3.3-70b-versatile)");
    return callGroq(prompt);
  }
  if (GEMINI_API_KEY) {
    console.log("[api] Using provider: Gemini (gemini-2.0-flash)");
    return callGemini(prompt);
  }
  throw new Error("No AI provider configured. Add VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY to your .env file.");
}

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS);
    return res.end();
  }

  if (req.method !== "POST" || req.url !== "/summarize") {
    res.writeHead(404, CORS);
    return res.end(JSON.stringify({ error: "Not found" }));
  }

  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", async () => {
    try {
      const { videoUrl, title } = JSON.parse(body);
      if (!videoUrl) {
        res.writeHead(400, CORS);
        return res.end(JSON.stringify({ error: "videoUrl is required" }));
      }

      const ytId      = extractYouTubeId(videoUrl);
      const thumbnail = getThumbnail(videoUrl);
      const videoTitle = title?.trim() || (await getVideoTitle(videoUrl)) || (ytId ? `YouTube Video ${ytId}` : "Video");

      const prompt = buildPrompt(videoUrl, videoTitle, ytId);
      const parsed = await callAI(prompt);

      res.writeHead(200, CORS);
      res.end(JSON.stringify({
        title:            parsed.title            || videoTitle,
        summary:          parsed.summary          || "",
        key_points:       Array.isArray(parsed.key_points) ? parsed.key_points : [],
        tags:             Array.isArray(parsed.tags)       ? parsed.tags       : [],
        thumbnail_url:    thumbnail,
        duration_seconds: parsed.estimated_duration        || null,
      }));
    } catch (err) {
      console.error("[api] Error:", err.message);
      res.writeHead(500, CORS);
      res.end(JSON.stringify({ error: err.message || "Unknown error" }));
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🎙️  Summarize server  →  http://localhost:${PORT}`);
  console.log(`   Proxied by Vite:  /api/summarize → http://localhost:${PORT}/summarize`);
  if (GROQ_API_KEY)        console.log(`✅  Groq key loaded    (${GROQ_API_KEY.slice(0, 8)}...)  [primary]`);
  else                     console.warn("⚠️  GROQ key missing   — add VITE_GROQ_API_KEY to .env");
  if (GEMINI_API_KEY)      console.log(`✅  Gemini key loaded  (${GEMINI_API_KEY.slice(0, 8)}...)  [fallback]`);
  else                     console.log("ℹ️  Gemini key not set (optional fallback)");
  console.log("");
});

# 🎙️ Podcast+ — AI-Powered Video Summarizer

> Instantly summarize any YouTube video or podcast using AI. Get key points, tags, and duration — all saved to your personal history.

![Podcast+ Screenshot](https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg)

---

## ✨ Features

- 🔗 **Paste any YouTube URL** and get an AI-generated summary in seconds
- 🤖 **Powered by Groq (Llama 3.3 70B)** — free, fast, and accurate
- 📝 **Key Points** — 5 actionable takeaways extracted from each video
- 🏷️ **Auto Tags** — relevant topic keywords generated automatically
- ⏱️ **Duration Estimate** — AI-inferred video length
- 📺 **Embedded Video Preview** — watch inline after summarizing
- 💾 **Save to History** — all summaries stored in your Supabase account
- 🔐 **Auth** — sign up / sign in with email & password via Supabase Auth
- 🌑 **Dark Mode UI** — glassmorphism design with smooth animations

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | TailwindCSS + Shadcn/UI (Radix UI) |
| Auth & Database | Supabase (PostgreSQL + Auth) |
| AI Provider | **Groq API** (Llama 3.3 70B) — primary |
| AI Fallback | Google Gemini 2.0 Flash |
| Local API Server | Node.js (ESM, no framework) |
| Routing | React Router DOM v6 |
| State / Queries | TanStack React Query v5 |
| Forms | React Hook Form + Zod |

---

## 🏗️ Architecture

```
Browser (React + Vite :8080)
    │
    ├─ Auth routes  ──────────────────────► Supabase Auth
    │
    ├─ /summarize
    │     │
    │     └─ POST /api/summarize  ────────► Vite Proxy
    │                                            │
    │                                     Node.js server (:3456)
    │                                            │
    │                               ┌───────────┴───────────┐
    │                         Groq API               Gemini API
    │                     (llama-3.3-70b)        (gemini-2.0-flash)
    │                        [PRIMARY]               [FALLBACK]
    │
    └─ Save / History  ───────────────────► Supabase DB (video_summaries)
```

**Production path** (when deployed): Uses the Supabase Edge Function `summarize-video` with Lovable AI Gateway.  
**Local dev path**: Uses `server/summarize.js` which calls Groq/Gemini directly via a Vite proxy.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A free [Groq API key](https://console.groq.com/keys) ← **recommended**
- Optionally a [Gemini API key](https://aistudio.google.com/apikey) as fallback

### 1. Clone the repo

```bash
git clone https://github.com/Tejas03-mL/podcast-summarizer.git
cd podcast-summarizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
# Supabase (required for auth + history)
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-public-key"

# Groq API key — PRIMARY AI provider (free at https://console.groq.com/keys)
VITE_GROQ_API_KEY="gsk_..."

# Gemini API key — FALLBACK (free at https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY="AIza..."
```

### 4. Run in development

Start both the Vite frontend and the local AI server together:

```bash
npm run dev:full
```

Or run them separately in two terminals:

```bash
# Terminal 1 — Frontend
npm run dev

# Terminal 2 — Local AI server
npm run dev:server
```

Open **http://localhost:8080** in your browser.

---

## 📁 Project Structure

```
podcast-summarizer-pro/
├── server/
│   └── summarize.js        # Local Node.js AI server (Groq + Gemini)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ui/             # Shadcn/Radix components
│   ├── contexts/
│   │   └── AuthContext.tsx  # Supabase auth state
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts   # Supabase client
│   │       └── types.ts    # Auto-generated DB types
│   ├── pages/
│   │   ├── AuthPage.tsx    # Sign in / Sign up
│   │   ├── HomePage.tsx    # Landing dashboard
│   │   ├── SummarizePage.tsx # Core AI summarizer
│   │   ├── HistoryPage.tsx # Saved summaries
│   │   └── AboutPage.tsx
│   └── App.tsx             # Routes + providers
├── supabase/
│   ├── functions/
│   │   └── summarize-video/ # Edge function (production)
│   └── migrations/          # DB schema
├── .env.example             # Environment template
├── vite.config.ts           # Vite config + /api proxy
└── package.json
```

---

## 🔑 AI Provider Details

### Groq (Primary — Recommended)
- **Model:** `llama-3.3-70b-versatile`
- **Free tier:** 14,400 requests/day, 6,000 tokens/min
- **Speed:** ~1–3 seconds per summary
- **Get key:** https://console.groq.com/keys

### Google Gemini (Fallback)
- **Model:** `gemini-2.0-flash`
- **Free tier:** Limited (may require billing for some projects)
- **Get key:** https://aistudio.google.com/apikey

The server automatically uses **Groq if `VITE_GROQ_API_KEY` is set**, otherwise falls back to Gemini.

---

## 🗄️ Database Schema

Two tables are used in Supabase:

**`profiles`** — User profile info  
**`video_summaries`** — Saved summaries

```sql
video_summaries (
  id             uuid PRIMARY KEY,
  user_id        uuid REFERENCES auth.users,
  title          text,
  video_url      text,
  video_source   text,
  thumbnail_url  text,
  summary        text,
  key_points     jsonb,
  tags           text[],
  duration_seconds integer,
  created_at     timestamptz
)
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite frontend only |
| `npm run dev:server` | Start local AI server only |
| `npm run dev:full` | Start both together (recommended) |
| `npm run build` | Production build |
| `npm run test` | Run unit tests |
| `npm run lint` | Lint source files |

---

## 🌐 Deployment

For production deployment, the app uses a **Supabase Edge Function** (`supabase/functions/summarize-video/`) instead of the local Node.js server.

You'll need to:
1. Deploy to Supabase: `supabase functions deploy summarize-video`
2. Set the `LOVABLE_API_KEY` secret in Supabase dashboard
3. Deploy the frontend to Vercel / Netlify / Cloudflare Pages

---

## 🔒 Security Notes

- **Never commit your `.env` file** — it's in `.gitignore`
- The `VITE_GROQ_API_KEY` and `VITE_GEMINI_API_KEY` are only used server-side in `server/summarize.js` — they are NOT exposed to the browser
- The Supabase anon key (`VITE_SUPABASE_PUBLISHABLE_KEY`) is safe to expose — it's a public key protected by Row Level Security (RLS)



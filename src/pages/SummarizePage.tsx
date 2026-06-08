import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Youtube, Link2, Zap, Sparkles, AlertCircle, CheckCircle2, Play, Clock, Tag, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface SummaryResult {
  title: string;
  summary: string;
  key_points: string[];
  tags: string[];
  thumbnail_url: string | null;
  duration_seconds: number | null;
}

const SummarizePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isYouTube = (url: string) => /youtube\.com|youtu\.be/.test(url);

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();

      // youtu.be short link
      if (host.includes('youtu.be')) {
        const id = u.pathname.slice(1).split(/[/?]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }

      // youtube.com paths: /watch, /embed, /shorts
      const pathname = u.pathname;
      // /shorts/VIDEO_ID
      if (pathname.startsWith('/shorts/')) {
        const parts = pathname.split('/');
        const id = parts[2] || parts[1];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }

      // query param v
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;

      // embed path
      const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11,})/);
      if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
    } catch (e) {
      // fallthrough
    }
    return null;
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);

    try {
      const useLocalGemini = Boolean(import.meta.env.VITE_GEMINI_API_KEY);
      let data: SummaryResult & { error?: string };

      if (useLocalGemini) {
        // ── Local dev: call Vite proxy → Node.js server → Gemini API ──
        const res = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: videoUrl.trim(),
            title: customTitle.trim() || undefined,
          }),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      } else {
        // ── Production: call Supabase Edge Function ──
        const { data: fnData, error: fnError } = await supabase.functions.invoke('summarize-video', {
          body: { videoUrl: videoUrl.trim(), title: customTitle.trim() || undefined },
        });
        if (fnError) throw fnError;
        data = fnData;
      }

      if (data?.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (data.error.includes('Credits')) {
          toast.error('Credits exhausted. Please add funds.');
        } else {
          throw new Error(data.error);
        }
        setError(data.error);
        return;
      }

      setResult(data);
      toast.success('Summary generated successfully! 🎉');
    } catch (err: any) {
      const msg = err.message || 'Failed to generate summary';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result || !user) return;

    try {
      const { error } = await supabase.from('video_summaries').insert({
        user_id: user.id,
        title: result.title,
        video_url: videoUrl.trim(),
        video_source: 'url',
        thumbnail_url: result.thumbnail_url,
        summary: result.summary,
        key_points: result.key_points,
        tags: result.tags,
        duration_seconds: result.duration_seconds,
      });

      if (error) throw error;

      setSaved(true);
      toast.success('Summary saved to your history! 📚');
    } catch (err: any) {
      toast.error('Failed to save: ' + err.message);
    }
  };

  const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-primary border border-primary/20 mb-4">
            <Zap className="w-4 h-4" />
            AI Summarizer
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">
            Summarize Any <span className="text-gradient">Video</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Paste a YouTube link or video URL below and get instant AI-powered insights
          </p>
        </div>

        {/* Input Form */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-scaleIn">
          <form onSubmit={handleSummarize} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Link2 className="w-4 h-4 text-primary" />
                Video URL <span className="text-primary">*</span>
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or any video URL"
                    required
                    className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  />
                </div>
              </div>
              {isYouTube(videoUrl) && (
                <p className="flex items-center gap-1.5 text-xs text-primary mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  YouTube link detected
                </p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                Custom Title <span className="text-muted-foreground text-xs font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Give this video a custom title..."
                className="input-dark w-full px-4 py-3 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !videoUrl.trim()}
              className="btn-primary w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-space-900/30 border-t-space-900 rounded-full animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Summary
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card rounded-2xl p-4 border border-destructive/30 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Error generating summary</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="glass-card rounded-2xl p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h3 className="font-display font-semibold text-foreground mb-2">AI is analyzing your video...</h3>
            <p className="text-muted-foreground text-sm">This takes a few seconds. Extracting key insights...</p>
            <div className="mt-4 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-6 animate-fadeInUp">
            {/* Video player */}
            {embedUrl && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <Play className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Video Preview</span>
                </div>
                <div className="relative aspect-video">
                  <iframe
                    src={embedUrl}
                    title={result.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Summary card */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4 gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-display font-bold text-foreground mb-2">{result.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
                {result.duration_seconds && (
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm glass rounded-lg px-3 py-1.5 flex-shrink-0">
                    <Clock className="w-4 h-4" />
                    {Math.round(result.duration_seconds / 60)} min
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Summary</h3>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-wrap">{result.summary}</p>
              </div>

              {result.key_points.length > 0 && (
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    <Sparkles className="w-4 h-4 text-primary inline mr-1.5" />
                    Key Points
                  </h3>
                  <ul className="space-y-2">
                    {result.key_points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                          {i + 1}
                        </div>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                  saved
                    ? 'bg-primary/20 text-primary border border-primary/30 cursor-default'
                    : 'btn-primary'
                }`}
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved to History!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Save to History
                  </>
                )}
              </button>
              <button
                onClick={() => navigate('/history')}
                className="px-6 py-3 rounded-xl text-sm font-semibold glass border border-border hover:border-primary/30 hover:text-primary transition-all"
              >
                View History
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SummarizePage;

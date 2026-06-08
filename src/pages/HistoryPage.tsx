import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Trash2, Clock, Tag, Sparkles, BookOpen, Play, ChevronDown, ChevronUp, Calendar, AlertTriangle, Youtube, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Summary {
  id: string;
  title: string;
  video_url: string | null;
  thumbnail_url: string | null;
  summary: string;
  key_points: unknown;
  tags: string[] | null;
  created_at: string;
  duration_seconds: number | null;
}

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchSummaries = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('video_summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSummaries(data || []);
    } catch (err: any) {
      toast.error('Failed to load history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, [user]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase.from('video_summaries').delete().eq('id', id);
      if (error) throw error;
      setSummaries((prev) => prev.filter((s) => s.id !== id));
      toast.success('Summary deleted');
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error('Failed to delete: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = summaries.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.summary.toLowerCase().includes(q) ||
      (s.tags || []).some((t) => t.toLowerCase().includes(q)) ||
      (Array.isArray(s.key_points) ? (s.key_points as string[]) : []).some((k) => k.toLowerCase().includes(q))
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-24 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fadeInUp">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-1">
              My <span className="text-gradient">History</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {summaries.length} summaries saved
            </p>
          </div>
          <Link
            to="/summarize"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            <Sparkles className="w-4 h-4" />
            New Summary
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, keywords, or tags..."
            className="input-dark w-full pl-11 pr-10 py-3.5 rounded-xl text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {search && (
          <p className="text-muted-foreground text-sm mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span className="text-primary">{search}</span>"
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-secondary rounded w-2/3 mb-3" />
                <div className="h-3 bg-secondary rounded w-1/3 mb-4" />
                <div className="h-3 bg-secondary rounded mb-2" />
                <div className="h-3 bg-secondary rounded w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-foreground text-lg mb-2">
              {search ? 'No results found' : 'No summaries yet'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? 'Try different keywords or clear the search' : 'Start by summarizing your first video!'}
            </p>
            {!search && (
              <Link to="/summarize" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
                <Sparkles className="w-4 h-4" />
                Summarize a Video
              </Link>
            )}
          </div>
        )}

        {/* Summary cards */}
        <div className="space-y-4">
          {filtered.map((s) => {
            const embedUrl = s.video_url ? getYouTubeEmbedUrl(s.video_url) : null;
            const isExpanded = expanded === s.id;
            const isDeleting = deleting === s.id;
            const confirmDelete = deleteConfirm === s.id;

            return (
              <div key={s.id} className="summary-card rounded-2xl overflow-hidden">
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {s.thumbnail_url ? (
                      <img
                        src={s.thumbnail_url}
                        alt={s.title}
                        className="w-20 h-14 object-cover rounded-xl flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground leading-tight mb-2 line-clamp-2">
                        {s.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(s.created_at)}
                        </span>
                        {s.duration_seconds && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {Math.round(s.duration_seconds / 60)} min
                          </span>
                        )}
                        {s.video_url && (
                          <a
                            href={s.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Youtube className="w-3.5 h-3.5" />
                            Watch
                          </a>
                        )}
                      </div>
                      {s.tags && s.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {s.tags.slice(0, 4).map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs border border-primary/20"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : s.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(confirmDelete ? null : s.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Summary preview */}
                  {!isExpanded && (
                    <p className="text-muted-foreground text-sm mt-3 line-clamp-2 leading-relaxed">
                      {s.summary}
                    </p>
                  )}
                </div>

                {/* Delete confirm */}
                {confirmDelete && (
                  <div className="px-5 pb-4">
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
                      <p className="text-sm text-foreground flex-1">Delete this summary? This cannot be undone.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground glass transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          disabled={isDeleting}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive text-foreground hover:bg-destructive/80 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border px-5 pt-4 pb-5 space-y-4 animate-fadeInUp">
                    {/* Video player */}
                    {embedUrl && (
                      <div className="rounded-xl overflow-hidden aspect-video">
                        <iframe
                          src={embedUrl}
                          title={s.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                    {/* Full summary */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Full Summary</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">{s.summary}</p>
                    </div>

                    {/* Key points */}
                    {s.key_points && Array.isArray(s.key_points) && (s.key_points as string[]).length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          Key Points
                        </h4>
                        <ul className="space-y-2">
                          {(s.key_points as string[]).map((point, i) => (
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
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HistoryPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Globe2, BookOpen, Search, Trash2, Play, Users, ArrowRight, Mic2, Youtube, FileVideo } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FeatureCard: React.FC<{ icon: React.ElementType; title: string; desc: string; color: string }> = ({ icon: Icon, title, desc, color }) => (
  <div className="summary-card rounded-2xl p-6 group cursor-default">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} transition-transform group-hover:scale-110 duration-300`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl font-display font-bold text-gradient mb-1">{value}</div>
    <div className="text-muted-foreground text-sm">{label}</div>
  </div>
);

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute top-1/4 left-1/6 w-96 h-96 rounded-full opacity-10 blur-3xl bg-primary animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full opacity-10 blur-3xl bg-accent animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-primary border border-primary/20 mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Video Summarization
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-bold leading-tight mb-6">
                <span className="text-foreground">Turn Videos into</span>{' '}
                <span className="text-gradient">Smart Summaries</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-lg">
                Paste any YouTube link or upload a video. Our AI instantly generates comprehensive summaries, key insights, and searchable history — saving you hours of watching.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/summarize"
                  className="btn-primary flex items-center gap-2 px-8 py-4 rounded-xl text-base animate-pulse-glow"
                >
                  <Zap className="w-5 h-5" />
                  Start Summarizing
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/history"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold glass border border-border hover:border-primary/30 hover:text-primary transition-all duration-300"
                >
                  <BookOpen className="w-5 h-5" />
                  View History
                </Link>
              </div>
            </div>

            {/* Demo card */}
            <div className="relative animate-float">
              <div className="glass-card rounded-2xl p-6 gradient-border">
                <div className="flex items-center gap-3 mb-4">
                  <Youtube className="w-6 h-6 text-destructive" />
                  <div className="flex-1 bg-muted rounded-lg px-4 py-2 text-muted-foreground text-sm font-mono">
                    youtube.com/watch?v=...
                  </div>
                  <button className="btn-primary px-4 py-2 rounded-lg text-sm">
                    Analyze
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-sm text-foreground font-medium">Summary Generated!</span>
                  </div>
                  <div className="bg-muted rounded-xl p-4 space-y-2">
                    <div className="h-3 bg-secondary rounded animate-pulse" />
                    <div className="h-3 bg-secondary rounded w-4/5 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="h-3 bg-secondary rounded w-3/5 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <div className="space-y-2">
                    {['Key Point 1 ✓', 'Key Point 2 ✓', 'Key Point 3 ✓'].map((pt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-primary">
                        <Sparkles className="w-3 h-3" />
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 text-xs font-semibold text-primary border border-primary/20">
                ⚡ Instant AI
              </div>
              <div className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 text-xs font-semibold text-accent border border-accent/20">
                💾 Auto-Saved
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="10x" label="Faster than watching" />
            <StatCard value="AI" label="Powered Insights" />
            <StatCard value="∞" label="Summaries stored" />
            <StatCard value="100%" label="Private & Secure" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Everything you <span className="text-gradient">need</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed for power users, students, and content creators
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Youtube} title="YouTube Links" desc="Paste any YouTube URL and get an instant AI-generated summary with key insights." color="bg-destructive/10 text-destructive" />
            <FeatureCard icon={FileVideo} title="Video Upload" desc="Upload video files directly for AI analysis and comprehensive summarization." color="bg-primary/10 text-primary" />
            <FeatureCard icon={Search} title="Smart Search" desc="Search through all your past summaries by title or keywords instantly." color="bg-accent/10 text-accent" />
            <FeatureCard icon={BookOpen} title="Complete History" desc="All your summaries are saved permanently with date, tags, and key points." color="bg-primary/10 text-primary" />
            <FeatureCard icon={Trash2} title="Easy Management" desc="Delete summaries you no longer need. Full control over your history." color="bg-destructive/10 text-destructive" />
            <FeatureCard icon={Users} title="Multi-User" desc="Secure, isolated accounts. Each user sees only their own summaries." color="bg-accent/10 text-accent" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card rounded-3xl p-12 gradient-border">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <Mic2 className="w-8 h-8 text-space-900" />
            </div>
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">
              Ready to save <span className="text-gradient">hours</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of users already using Podcast+ to learn faster
            </p>
            <Link to="/summarize" className="btn-primary inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg">
              <Play className="w-5 h-5" />
              Try it Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;

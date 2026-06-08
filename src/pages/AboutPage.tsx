import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mic2, Sparkles, Target, Shield, Zap, Globe2, Award, Heart } from 'lucide-react';

const AboutPage: React.FC = () => {
  const team = [
    { name: 'AI Research Team', role: 'Algorithm & Summarization', avatar: 'A' },
    { name: 'Frontend Team', role: 'UI/UX Design', avatar: 'F' },
    { name: 'Backend Team', role: 'Infrastructure & Security', avatar: 'B' },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 relative overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10 blur-3xl bg-accent" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full opacity-5 blur-3xl bg-primary" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-accent border border-accent/20 mb-6">
              <Heart className="w-4 h-4" />
              Our Story
            </div>
            <h1 className="text-5xl font-display font-bold mb-6">
              About <span className="text-gradient">Podcast+</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Podcast+ was born from a simple idea: <em className="text-foreground">what if you could understand any video in minutes instead of hours?</em> We built the AI-powered summarization platform that makes learning faster and more accessible for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Our <span className="text-gradient">Mission</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We believe that knowledge should be accessible and efficient. With hours of video content created every minute, it's impossible to consume everything relevant to your work, studies, or interests.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Podcast+ uses advanced AI to extract the most important insights from any video or podcast, giving you a comprehensive summary in seconds — complete with key points, tags, and searchable history.
              </p>
              <div className="space-y-3">
                {[
                  'Save hours of watching time every week',
                  'Never miss important insights again',
                  'Build a personal knowledge library',
                  'Search across all your summaries',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Target, title: 'Precision', desc: 'AI trained on millions of videos for accurate summarization', color: 'text-primary bg-primary/10' },
                { icon: Shield, title: 'Privacy', desc: 'Your data is encrypted and never shared with third parties', color: 'text-accent bg-accent/10' },
                { icon: Zap, title: 'Speed', desc: 'Get comprehensive summaries in under 30 seconds', color: 'text-primary bg-primary/10' },
                { icon: Globe2, title: 'Accessible', desc: 'Works with YouTube, Vimeo, and direct video links', color: 'text-accent bg-accent/10' },
              ].map(({ icon: Icon, title, desc, color }, i) => (
                <div key={i} className="summary-card rounded-2xl p-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-1">{title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-16 bg-secondary/20 rounded-3xl mx-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Powered by <span className="text-gradient">Latest AI</span>
            </h2>
            <p className="text-muted-foreground">State-of-the-art technology stack</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Google Gemini', desc: 'Core AI model', icon: Sparkles },
              { name: 'Real-time DB', desc: 'Instant sync', icon: Zap },
              { name: 'Secure Auth', desc: 'Multi-user', icon: Shield },
              { name: 'Cloud Edge', desc: 'Global CDN', icon: Globe2 },
            ].map(({ name, desc, icon: Icon }, i) => (
              <div key={i} className="glass-card rounded-xl p-5 text-center">
                <Icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="font-semibold text-foreground text-sm">{name}</p>
                <p className="text-muted-foreground text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Built at <span className="text-gradient">DYPTC</span>
            </h2>
            <p className="text-muted-foreground">
              Dr. D.Y. Patil Technical Campus, Talsande
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {team.map(({ name, role, avatar }, i) => (
              <div key={i} className="summary-card rounded-2xl p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-space-900 text-2xl font-display font-bold mx-auto mb-4">
                  {avatar}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">{name}</h3>
                <p className="text-muted-foreground text-sm">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Award / Badge */}
      <section className="py-10">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="glass-card rounded-2xl p-8 inline-block">
            <Award className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-foreground font-semibold font-display">Raviraj's Project 2025</p>
            <p className="text-muted-foreground text-sm mt-1">AI & Web Technology</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;

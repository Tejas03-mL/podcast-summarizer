import React from 'react';
import { Link } from 'react-router-dom';
import { Mic2, Sparkles, Mail, Phone, Globe, Twitter, Youtube, Github, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-20 border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-space-900/50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-space-900" />
              </div>
              <span className="text-xl font-display font-bold text-gradient">Podcast+</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI-powered podcast & video summarization. Save time, learn more.
            </p>
            
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-foreground font-semibold font-display mb-4">Pages</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/summarize', label: 'Summarize' },
                { to: '/history', label: 'My History' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-foreground font-semibold font-display mb-4">Features</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Summarization
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                YouTube Support
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                History & Search
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Multi-user Secure
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Key Points Extract
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-foreground font-semibold font-display mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:raj@gmail.com" className="hover:text-primary transition-colors">
                  raj@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span>+91 8668686934</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Globe className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="#" className="hover:text-primary transition-colors">
                  www.podcastplus.ai
                </a>
              </li>
            </ul>

            <div className="mt-4 p-3 glass rounded-xl">
              <p className="text-muted-foreground text-xs font-semibold mb-1">DYPTC Campus</p>
              <p className="text-muted-foreground text-xs">
                Dr. D.Y. Patil Technical Campus, Talsande
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            © 2025 Podcast+. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> by Raviraj
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

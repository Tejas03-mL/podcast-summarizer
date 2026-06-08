import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic2, Sparkles, LogOut, Home, Info, BookOpen, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const navLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/about', icon: Info, label: 'About' },
    { to: '/summarize', icon: Upload, label: 'Summarize' },
    { to: '/history', icon: BookOpen, label: 'History' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="nav-blur fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:glow-primary transition-all duration-300">
                <Mic2 className="w-5 h-5 text-space-900" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <span className="text-xl font-display font-bold text-gradient">Podcast+</span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center text-space-900 text-xs font-bold">
                    {user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                    {user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden pb-3 flex gap-1 overflow-x-auto scrollbar-hidden">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                isActive(to)
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

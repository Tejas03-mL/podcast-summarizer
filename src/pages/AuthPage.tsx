import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Mic2, Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back! 🎙️');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success('Account created! Please check your email to verify.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl bg-primary animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl bg-accent animate-pulse-slow" style={{ animationDelay: '2s' }} />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-primary opacity-60 animate-float" />
      <div className="absolute top-3/4 right-1/3 w-3 h-3 rounded-full bg-accent opacity-40 animate-float" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 rounded-full bg-primary opacity-50 animate-float" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 w-full max-w-md px-6 animate-scaleIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center glow-primary">
                <Mic2 className="w-7 h-7 text-space-900" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gradient">Podcast+</h1>
              <p className="text-muted-foreground text-sm">AI-Powered Summaries</p>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="flex mb-6 bg-muted rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                isLogin ? 'bg-gradient-primary text-space-900 shadow-lg' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                !isLogin ? 'bg-gradient-primary text-space-900 shadow-lg' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-dark w-full pl-10 pr-4 py-3 rounded-xl text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input-dark w-full pl-10 pr-10 py-3 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-space-900/30 border-t-space-900 rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-muted-foreground text-xs mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-center text-muted-foreground text-xs mt-4">
          🔒 Secure & private — your data stays yours
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Music, Mail, Lock, Chrome, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signUpWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05080F] via-[#0A0F1A] to-[#05080F] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#C9A84C]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#C9A84C]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="max-w-md w-full relative animate-fadeIn">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-[#C9A84C] to-[#E5C46B] mb-6 shadow-2xl pulse-glow relative group">
            <Music size={48} className="text-[#05080F] group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#C9A84C] flex items-center justify-center">
              <Sparkles size={12} className="text-[#05080F]" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C9A84C] via-[#E5C46B] to-[#C9A84C] bg-clip-text text-transparent">
            Arco
          </h1>
          <p className="text-white/40 mt-2 text-sm">AI-Powered Music Studio</p>
        </div>
        
        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#0A0F1A]/80 to-[#05080F]/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-semibold ${
                isLogin 
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] text-[#05080F] shadow-lg scale-[1.02]' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-lg transition-all duration-300 font-semibold ${
                !isLogin 
                  ? 'bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] text-[#05080F] shadow-lg scale-[1.02]' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              Create Account
            </button>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-slideIn">
              {error}
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/60">
                Email Address
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#C9A84C] transition-colors duration-200" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all duration-200"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-white/60">
                Password
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-[#C9A84C] transition-colors duration-200" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
              {!isLogin && (
                <p className="text-xs text-white/40 mt-2 flex items-center gap-1">
                  <Sparkles size={10} className="text-[#C9A84C]" />
                  Must be at least 6 characters
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] text-[#05080F] rounded-xl font-semibold hover:shadow-lg hover:shadow-[#C9A84C]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          </form>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gradient-to-br from-[#0A0F1A]/80 to-[#05080F]/80 text-white/40">or continue with</span>
            </div>
          </div>
          
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-[#C9A84C]/50 transition-all duration-300 disabled:opacity-50 group"
          >
            <Chrome size={18} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Google</span>
          </button>
          
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">
              By continuing, you agree to our Terms of Service
            </p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Music, Mail, Lock, Chrome } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A84C]/10 mb-4">
            <Music size={32} className="text-[#C9A84C]" />
          </div>
          <h1 className="text-3xl font-bold text-[#C9A84C]">Arco</h1>
          <p className="text-[#EEF2FF]/60 mt-2">AI-Powered Music Platform</p>
        </div>
        
        <div className="bg-[#0a0f1a] rounded-lg border border-[#C9A84C]/20 p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isLogin ? 'bg-[#C9A84C] text-[#05080F]' : 'bg-[#05080F] text-[#EEF2FF]/60'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                !isLogin ? 'bg-[#C9A84C] text-[#05080F]' : 'bg-[#05080F] text-[#EEF2FF]/60'
              }`}
            >
              Sign Up
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EEF2FF]/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] focus:border-[#C9A84C] focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-[#EEF2FF]/80">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#EEF2FF]/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] focus:border-[#C9A84C] focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full py-2 bg-[#C9A84C] text-[#05080F] rounded-lg font-semibold hover:bg-[#b8943a] transition-colors"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#C9A84C]/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0a0f1a] text-[#EEF2FF]/40">OR</span>
            </div>
          </div>
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] hover:border-[#C9A84C] transition-colors"
          >
            <Chrome size={18} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

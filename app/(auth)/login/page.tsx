'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Music, Mail, Lock, Chrome, ArrowRight, Loader2 } from 'lucide-react';

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
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
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

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #05080F; --gold: #C9A84C; --gold-light: #E8C96A;
      --text: #EEF2FF; --text-muted: #EEF2FF55; --text-dim: #EEF2FF22;
      --serif: 'Playfair Display', Georgia, serif;
      --body: 'Crimson Pro', Georgia, serif;
      --mono: 'DM Mono', monospace;
    }
    body { background: var(--bg); color: var(--text); overflow-x: hidden; }
    .login-page {
      min-height: 100vh; background: var(--bg);
      display: flex; align-items: center; justify-content: center;
      padding: 24px; position: relative; overflow: hidden;
    }
    .grain {
      position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.035;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 200px;
    }
    .bg-lines {
      position: absolute; inset: 0; pointer-events: none; overflow: hidden;
    }
    .bg-line-h {
      position: absolute; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, #C9A84C08, transparent);
    }
    .bg-line-v {
      position: absolute; top: 0; bottom: 0; width: 1px; background: linear-gradient(180deg, transparent, #C9A84C08, transparent);
    }
    .login-wrap {
      width: 100%; max-width: 440px; position: relative; z-index: 1;
    }
    .login-header {
      text-align: center; margin-bottom: 48px;
    }
    .login-logo-mark {
      width: 56px; height: 56px; border: 1px solid var(--gold);
      display: inline-flex; align-items: center; justify-content: center;
      position: relative; margin-bottom: 24px;
    }
    .login-logo-mark::before {
      content: ''; position: absolute; inset: 4px; border: 1px solid #C9A84C33;
    }
    .login-wordmark {
      font-family: var(--serif); font-size: 36px; font-weight: 900;
      letter-spacing: 0.1em; color: var(--text); text-transform: uppercase;
      display: block; margin-bottom: 8px;
    }
    .login-tagline {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.3em;
      text-transform: uppercase; color: var(--gold); opacity: 0.7;
    }
    .login-card {
      border: 1px solid #C9A84C18; padding: 48px;
      position: relative; background: #07090Ecc;
      backdrop-filter: blur(20px);
    }
    .login-card::before, .login-card::after {
      content: ''; position: absolute; width: 16px; height: 16px;
      border-color: var(--gold); border-style: solid; opacity: 0.5;
    }
    .login-card::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
    .login-card::after { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
    .toggle-row {
      display: flex; margin-bottom: 40px;
      border-bottom: 1px solid #C9A84C15;
    }
    .toggle-btn {
      flex: 1; padding: 12px; background: transparent; border: none;
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
      text-transform: uppercase; cursor: pointer; color: var(--text-muted);
      position: relative; transition: color 0.2s;
    }
    .toggle-btn.active { color: var(--gold); }
    .toggle-btn.active::after {
      content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
      height: 1px; background: var(--gold);
    }
    .toggle-btn:hover:not(.active) { color: var(--text); }
    .error-box {
      margin-bottom: 24px; padding: 12px 16px;
      border: 1px solid #ff444430; background: #ff444408;
      font-family: var(--mono); font-size: 11px; letter-spacing: 0.05em;
      color: #ff6666;
    }
    .field { margin-bottom: 24px; }
    .field-label {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--text-muted);
      display: block; margin-bottom: 10px;
    }
    .field-input-wrap { position: relative; }
    .field-icon {
      position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
      color: #C9A84C44; pointer-events: none; transition: color 0.2s;
    }
    .field-input {
      width: 100%; padding: 14px 14px 14px 42px;
      background: #ffffff04; border: 1px solid #C9A84C18;
      color: var(--text); font-family: var(--body); font-size: 16px;
      font-weight: 300; outline: none; transition: border-color 0.2s, background 0.2s;
      -webkit-appearance: none; border-radius: 0;
    }
    .field-input::placeholder { color: var(--text-muted); font-style: italic; }
    .field-input:focus { border-color: #C9A84C66; background: #ffffff06; }
    .field-input:focus + .field-icon, .field-input-wrap:focus-within .field-icon { color: var(--gold); }
    .field-hint {
      font-family: var(--mono); font-size: 9px; letter-spacing: 0.15em;
      color: var(--text-muted); margin-top: 8px; opacity: 0.6;
    }
    .btn-submit {
      width: 100%; padding: 16px; margin-top: 8px;
      background: var(--gold); color: var(--bg); border: none; cursor: pointer;
      font-family: var(--mono); font-size: 11px; letter-spacing: 0.25em;
      text-transform: uppercase; display: flex; align-items: center;
      justify-content: center; gap: 10px;
      transition: background 0.2s, transform 0.1s; margin-bottom: 32px;
    }
    .btn-submit:hover:not(:disabled) { background: var(--gold-light); }
    .btn-submit:active:not(:disabled) { transform: scale(0.99); }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .divider {
      display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
    }
    .divider-line { flex: 1; height: 1px; background: #C9A84C12; }
    .divider-text {
      font-family: var(--mono); font-size: 9px; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--text-muted); opacity: 0.5;
    }
    .btn-google {
      width: 100%; padding: 14px; background: transparent;
      border: 1px solid #C9A84C18; color: var(--text-muted); cursor: pointer;
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
      text-transform: uppercase; display: flex; align-items: center;
      justify-content: center; gap: 10px;
      transition: border-color 0.2s, color 0.2s, background 0.2s;
    }
    .btn-google:hover:not(:disabled) {
      border-color: #C9A84C44; color: var(--text); background: #C9A84C06;
    }
    .btn-google:disabled { opacity: 0.5; cursor: not-allowed; }
    .login-footer {
      margin-top: 24px; text-align: center;
      font-family: var(--mono); font-size: 9px; letter-spacing: 0.15em;
      color: var(--text-muted); opacity: 0.35; text-transform: uppercase;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    @media (max-width: 480px) {
      .login-card { padding: 32px 24px; }
      .login-header { margin-bottom: 32px; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="login-page">
        <div className="grain" />
        <div className="bg-lines">
          <div className="bg-line-h" style={{ top: '25%' }} />
          <div className="bg-line-h" style={{ top: '75%' }} />
          <div className="bg-line-v" style={{ left: '20%' }} />
          <div className="bg-line-v" style={{ left: '80%' }} />
        </div>

        <div className="login-wrap">
          <div className="login-header">
            <div className="login-logo-mark">
              <Music size={20} color="#C9A84C" />
            </div>
            <span className="login-wordmark">Arco</span>
            <span className="login-tagline">AI-Powered Music Studio</span>
          </div>

          <div className="login-card">
            <div className="toggle-row">
              <button
                className={`toggle-btn ${isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Sign In
              </button>
              <button
                className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Create Account
              </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label">Email Address</label>
                <div className="field-input-wrap">
                  <input
                    className="field-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                  <div className="field-icon"><Mail size={16} /></div>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Password</label>
                <div className="field-input-wrap">
                  <input
                    className="field-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <div className="field-icon"><Lock size={16} /></div>
                </div>
                {!isLogin && <p className="field-hint">Minimum 6 characters</p>}
              </div>

              <button className="btn-submit" type="submit" disabled={loading}>
                {loading
                  ? <><Loader2 size={14} className="spin" /> {isLogin ? 'Signing In...' : 'Creating Account...'}</>
                  : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={14} /></>
                }
              </button>
            </form>

            <div className="divider">
              <div className="divider-line" />
              <span className="divider-text">or</span>
              <div className="divider-line" />
            </div>

            <button className="btn-google" onClick={handleGoogleSignIn} disabled={loading}>
              <Chrome size={15} />
              Continue with Google
            </button>

            <p className="login-footer">By continuing you agree to our Terms of Service</p>
          </div>
        </div>
      </div>
    </>
  );
}

‘use client’;

import { useEffect, useState, useRef } from ‘react’;
import { useRouter } from ‘next/navigation’;
import { useAuth } from ‘@/hooks/useAuth’;
import { Music, Mic, Share2, Sparkles, ArrowRight, Play, ChevronRight, Zap, Piano, Wand2, TrendingUp, Award } from ‘lucide-react’;

export default function LandingPage() {
const { user, loading } = useAuth();
const router = useRouter();
const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
const [scrollY, setScrollY] = useState(0);
const heroRef = useRef<HTMLDivElement>(null);

useEffect(() => {
if (!loading && user) router.push(’/dashboard’);
}, [user, loading, router]);

useEffect(() => {
const handleMouse = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
const handleScroll = () => setScrollY(window.scrollY);
window.addEventListener(‘mousemove’, handleMouse);
window.addEventListener(‘scroll’, handleScroll);
return () => { window.removeEventListener(‘mousemove’, handleMouse); window.removeEventListener(‘scroll’, handleScroll); };
}, []);

const features = [
{ icon: Mic, title: ‘Smart Transcription’, description: ‘Hum, sing, or play — Arco converts any audio to professional sheet music in seconds using Spotify Basic Pitch.’ },
{ icon: Piano, title: ‘Instrument Conversion’, description: ‘Transform piano to violin, cello, trumpet, and 14+ more with intelligent range mapping via Magenta.js.’ },
{ icon: Wand2, title: ‘AI Music Assistant’, description: ‘Ask Gemini to rewrite passages, suggest harmonies, or adapt pieces for beginners. Music theory on demand.’ },
{ icon: Share2, title: ‘Team Collaboration’, description: ‘Share full band arrangements with one link. Each musician gets their own part, no account required.’ },
];

if (loading) {
return (
<div style={{ minHeight: ‘100vh’, background: ‘#05080F’, display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’ }}>
<div style={{ textAlign: ‘center’ }}>
<div style={{
width: 40, height: 40, border: ‘2px solid #C9A84C33’, borderTop: ‘2px solid #C9A84C’,
borderRadius: ‘50%’, animation: ‘spin 1s linear infinite’, margin: ‘0 auto 16px’
}} />
<p style={{ color: ‘#ffffff40’, fontFamily: ‘serif’, letterSpacing: ‘0.2em’, fontSize: 12 }}>LOADING ARCO</p>
</div>
<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
</div>
);
}

return (
<>
<style>{`
@import url(‘https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap’);

```
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #05080F;
      --gold: #C9A84C;
      --gold-light: #E8C96A;
      --gold-dim: #C9A84C22;
      --text: #EEF2FF;
      --text-muted: #EEF2FF55;
      --text-dim: #EEF2FF22;
      --serif: 'Playfair Display', Georgia, serif;
      --body: 'Crimson Pro', Georgia, serif;
      --mono: 'DM Mono', monospace;
    }

    html { scroll-behavior: smooth; }

    body { background: var(--bg); color: var(--text); overflow-x: hidden; }

    .arco-page { min-height: 100vh; background: var(--bg); position: relative; }

    /* Grain overlay */
    .grain {
      position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.035;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 200px;
    }

    /* Spotlight cursor */
    .spotlight {
      position: fixed; pointer-events: none; z-index: 0;
      width: 600px; height: 600px; border-radius: 50%;
      background: radial-gradient(circle, #C9A84C08 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: left 0.15s ease, top 0.15s ease;
    }

    /* Nav */
    .nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 50;
      padding: 28px 48px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid transparent;
      transition: border-color 0.3s, background 0.3s, backdrop-filter 0.3s;
    }
    .nav.scrolled {
      border-color: #C9A84C15;
      background: #05080Fcc;
      backdrop-filter: blur(20px);
    }
    .nav-logo {
      display: flex; align-items: center; gap: 14px;
      text-decoration: none;
    }
    .nav-logo-mark {
      width: 36px; height: 36px;
      border: 1px solid var(--gold);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .nav-logo-mark::before {
      content: ''; position: absolute; inset: 3px;
      border: 1px solid #C9A84C44;
    }
    .nav-wordmark {
      font-family: var(--serif); font-size: 22px; font-weight: 400;
      letter-spacing: 0.15em; color: var(--text);
      text-transform: uppercase;
    }
    .nav-cta {
      font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--gold);
      border: 1px solid var(--gold); padding: 10px 24px;
      background: transparent; cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .nav-cta:hover { background: var(--gold); color: var(--bg); }

    /* Hero */
    .hero {
      min-height: 100vh; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 140px 48px 80px;
      position: relative; text-align: center;
    }
    .hero-eyebrow {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.35em;
      text-transform: uppercase; color: var(--gold);
      margin-bottom: 40px;
      display: flex; align-items: center; gap: 16px;
    }
    .hero-eyebrow::before, .hero-eyebrow::after {
      content: ''; flex: 1; max-width: 60px; height: 1px; background: var(--gold);
    }
    .hero-title {
      font-family: var(--serif); font-size: clamp(56px, 9vw, 120px);
      font-weight: 900; line-height: 0.9; letter-spacing: -0.02em;
      margin-bottom: 40px; color: var(--text);
    }
    .hero-title em {
      font-style: italic; color: var(--gold);
      display: block;
    }
    .hero-subtitle {
      font-family: var(--body); font-size: clamp(18px, 2vw, 22px);
      font-weight: 300; color: var(--text-muted); line-height: 1.7;
      max-width: 540px; margin: 0 auto 56px; font-style: italic;
    }
    .hero-actions {
      display: flex; align-items: center; gap: 24px; justify-content: center;
      flex-wrap: wrap;
    }
    .btn-primary {
      font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em;
      text-transform: uppercase; background: var(--gold); color: var(--bg);
      border: none; padding: 16px 40px; cursor: pointer;
      display: flex; align-items: center; gap: 10px;
      transition: background 0.2s, transform 0.2s;
      font-weight: 400;
    }
    .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }
    .btn-ghost {
      font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em;
      text-transform: uppercase; background: transparent; color: var(--text-muted);
      border: 1px solid #EEF2FF22; padding: 16px 40px; cursor: pointer;
      display: flex; align-items: center; gap: 10px;
      transition: border-color 0.2s, color 0.2s;
    }
    .btn-ghost:hover { border-color: #EEF2FF55; color: var(--text); }

    /* Decorative lines */
    .hero-line {
      position: absolute; background: var(--gold);
      opacity: 0.15;
    }
    .hero-line-h { height: 1px; width: 100%; left: 0; }
    .hero-line-v { width: 1px; height: 100%; top: 0; }

    /* Stats strip */
    .stats-strip {
      border-top: 1px solid #C9A84C20; border-bottom: 1px solid #C9A84C20;
      padding: 48px;
      display: grid; grid-template-columns: repeat(4, 1fr);
      position: relative; z-index: 1;
    }
    .stat-item {
      text-align: center; padding: 0 24px;
      border-right: 1px solid #C9A84C15;
    }
    .stat-item:last-child { border-right: none; }
    .stat-value {
      font-family: var(--serif); font-size: 48px; font-weight: 700;
      color: var(--gold); line-height: 1; margin-bottom: 8px;
    }
    .stat-label {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.25em;
      text-transform: uppercase; color: var(--text-muted);
    }

    /* Features */
    .features-section {
      padding: 120px 48px;
      position: relative; z-index: 1;
    }
    .section-header {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 80px; margin-bottom: 80px; align-items: end;
    }
    .section-label {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.3em;
      text-transform: uppercase; color: var(--gold); margin-bottom: 20px;
    }
    .section-title {
      font-family: var(--serif); font-size: clamp(36px, 4vw, 52px);
      font-weight: 700; line-height: 1.1; color: var(--text);
    }
    .section-title em { font-style: italic; color: var(--gold); }
    .section-desc {
      font-family: var(--body); font-size: 18px; font-weight: 300;
      color: var(--text-muted); line-height: 1.8; font-style: italic;
      align-self: end;
    }
    .features-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px;
      border: 1px solid #C9A84C15; background: #C9A84C15;
    }
    .feature-card {
      background: var(--bg); padding: 52px 48px;
      position: relative; overflow: hidden;
      transition: background 0.3s;
      cursor: default;
    }
    .feature-card::before {
      content: ''; position: absolute; top: 0; left: 0;
      width: 2px; height: 0; background: var(--gold);
      transition: height 0.4s ease;
    }
    .feature-card:hover::before { height: 100%; }
    .feature-card:hover { background: #0A0F1A; }
    .feature-number {
      font-family: var(--mono); font-size: 11px; letter-spacing: 0.2em;
      color: var(--gold); margin-bottom: 32px; opacity: 0.6;
    }
    .feature-icon {
      width: 48px; height: 48px; margin-bottom: 24px;
      border: 1px solid #C9A84C30;
      display: flex; align-items: center; justify-content: center;
      color: var(--gold);
    }
    .feature-title {
      font-family: var(--serif); font-size: 24px; font-weight: 700;
      color: var(--text); margin-bottom: 16px;
    }
    .feature-desc {
      font-family: var(--body); font-size: 16px; font-weight: 300;
      color: var(--text-muted); line-height: 1.8;
    }

    /* Marquee */
    .marquee-wrap {
      overflow: hidden; border-top: 1px solid #C9A84C15;
      border-bottom: 1px solid #C9A84C15; padding: 20px 0;
      position: relative; z-index: 1;
    }
    .marquee-track {
      display: flex; gap: 80px; width: max-content;
      animation: marquee 30s linear infinite;
    }
    .marquee-item {
      font-family: var(--mono); font-size: 11px; letter-spacing: 0.25em;
      text-transform: uppercase; color: var(--text-muted); white-space: nowrap;
      display: flex; align-items: center; gap: 24px;
    }
    .marquee-dot { width: 4px; height: 4px; background: var(--gold); border-radius: 50%; }
    @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

    /* CTA */
    .cta-section {
      padding: 120px 48px; position: relative; z-index: 1;
    }
    .cta-inner {
      max-width: 900px; margin: 0 auto; text-align: center;
      padding: 80px; position: relative;
      border: 1px solid #C9A84C20;
    }
    .cta-inner::before, .cta-inner::after {
      content: ''; position: absolute;
      width: 20px; height: 20px;
      border-color: var(--gold); border-style: solid;
    }
    .cta-inner::before { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
    .cta-inner::after { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }
    .cta-title {
      font-family: var(--serif); font-size: clamp(40px, 5vw, 64px);
      font-weight: 900; color: var(--text); margin-bottom: 24px; line-height: 1;
    }
    .cta-title em { font-style: italic; color: var(--gold); }
    .cta-subtitle {
      font-family: var(--body); font-size: 18px; font-weight: 300;
      color: var(--text-muted); font-style: italic; margin-bottom: 48px;
    }
    .cta-note {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.2em;
      text-transform: uppercase; color: var(--text-muted); margin-top: 20px;
      opacity: 0.5;
    }

    /* Footer */
    .footer {
      border-top: 1px solid #C9A84C15; padding: 40px 48px;
      display: flex; align-items: center; justify-content: space-between;
      position: relative; z-index: 1;
    }
    .footer-logo {
      font-family: var(--serif); font-size: 16px; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text-muted);
    }
    .footer-copy {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em;
      color: var(--text-muted); opacity: 0.4;
    }
    .footer-links { display: flex; gap: 32px; }
    .footer-link {
      font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--text-muted); text-decoration: none;
      opacity: 0.5; transition: opacity 0.2s, color 0.2s;
    }
    .footer-link:hover { opacity: 1; color: var(--gold); }

    /* Horizontal rule with ornament */
    .ornament {
      display: flex; align-items: center; gap: 16px;
      padding: 0 48px; margin: 0 0 80px;
    }
    .ornament-line { flex: 1; height: 1px; background: #C9A84C15; }
    .ornament-mark {
      font-family: var(--serif); font-size: 20px; color: var(--gold); opacity: 0.4;
    }

    @media (max-width: 768px) {
      .nav { padding: 20px 24px; }
      .hero { padding: 120px 24px 60px; }
      .stats-strip { grid-template-columns: repeat(2, 1fr); padding: 32px 24px; }
      .stat-item:nth-child(2) { border-right: none; }
      .stat-item { padding: 16px; }
      .features-section { padding: 80px 24px; }
      .section-header { grid-template-columns: 1fr; gap: 24px; }
      .features-grid { grid-template-columns: 1fr; }
      .feature-card { padding: 40px 28px; }
      .cta-section { padding: 80px 24px; }
      .cta-inner { padding: 48px 32px; }
      .footer { flex-direction: column; gap: 20px; padding: 32px 24px; text-align: center; }
      .footer-links { justify-content: center; }
    }
  `}</style>

  <div className="arco-page">
    <div className="grain" />

    {/* Spotlight */}
    <div className="spotlight" style={{ left: mousePos.x, top: mousePos.y }} />

    {/* Nav */}
    <nav className={`nav ${scrollY > 40 ? 'scrolled' : ''}`}>
      <a className="nav-logo" href="#">
        <div className="nav-logo-mark">
          <Music size={14} color="#C9A84C" />
        </div>
        <span className="nav-wordmark">Arco</span>
      </a>
      <button className="nav-cta" onClick={() => router.push('/login')}>
        Begin →
      </button>
    </nav>

    {/* Hero */}
    <section className="hero" ref={heroRef}>
      <div className="hero-line hero-line-h" style={{ bottom: 0 }} />

      <div className="hero-eyebrow">
        AI-Powered Music Studio
      </div>

      <h1 className="hero-title">
        Your Music,<br />
        <em>Perfectly</em><br />
        Transcribed
      </h1>

      <p className="hero-subtitle">
        Hum a melody, play a chord, sing a phrase — Arco transforms any sound into professional sheet music for any instrument, instantly.
      </p>

      <div className="hero-actions">
        <button className="btn-primary" onClick={() => router.push('/login')}>
          Start Creating <ArrowRight size={14} />
        </button>
        <button className="btn-ghost" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
          <Play size={12} /> See How It Works
        </button>
      </div>
    </section>

    {/* Stats */}
    <div className="stats-strip">
      {[
        { value: '14+', label: 'Instruments' },
        { value: '99%', label: 'Accuracy' },
        { value: '<2s', label: 'Processing' },
        { value: 'Free', label: 'Forever' },
      ].map((s, i) => (
        <div className="stat-item" key={i}>
          <div className="stat-value">{s.value}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>

    {/* Marquee */}
    <div className="marquee-wrap">
      <div className="marquee-track">
        {[...Array(2)].map((_, r) =>
          ['Transcription', 'Instrument Conversion', 'Sheet Music', 'Chord Charts', 'Band Arranger', 'Practice Mode', 'AI Assistant', 'Key Transposer', 'Export to PDF', 'MIDI Export', 'Hum Mode', 'Collaboration'].map((t, i) => (
            <div className="marquee-item" key={`${r}-${i}`}>
              <span className="marquee-dot" />
              {t}
            </div>
          ))
        )}
      </div>
    </div>

    {/* Features */}
    <section className="features-section" id="features">
      <div className="section-header">
        <div>
          <div className="section-label">What Arco Does</div>
          <h2 className="section-title">
            Every Tool a<br />Musician <em>Actually</em><br />Needs
          </h2>
        </div>
        <p className="section-desc">
          Built for pianists, worship teams, music students, and composers who are tired of software that makes simple things complicated.
        </p>
      </div>

      <div className="features-grid">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div className="feature-card" key={i}>
              <div className="feature-number">0{i + 1}</div>
              <div className="feature-icon"><Icon size={20} /></div>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.description}</p>
            </div>
          );
        })}
      </div>
    </section>

    {/* CTA */}
    <section className="cta-section">
      <div className="cta-inner">
        <div className="section-label" style={{ marginBottom: 32 }}>Get Started Today</div>
        <h2 className="cta-title">
          Music That<br /><em>Moves</em> You
        </h2>
        <p className="cta-subtitle">
          Join musicians, worship teams, and composers who use Arco every week.
        </p>
        <button className="btn-primary" onClick={() => router.push('/login')} style={{ margin: '0 auto' }}>
          Open Arco Free <ArrowRight size={14} />
        </button>
        <p className="cta-note">No credit card · No trial · Free forever</p>
      </div>
    </section>

    {/* Footer */}
    <footer className="footer">
      <span className="footer-logo">Arco</span>
      <span className="footer-copy">© 2025 Arco Music Platform</span>
      <div className="footer-links">
        <a href="#" className="footer-link">Privacy</a>
        <a href="#" className="footer-link">Terms</a>
        <a href="#" className="footer-link">Contact</a>
      </div>
    </footer>
  </div>
</>
```

);
}
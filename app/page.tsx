'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  Music, 
  Mic, 
  Share2, 
  Sparkles, 
  ArrowRight, 
  Play, 
  ChevronRight,
  Zap,
  Shield,
  Globe,
  Headphones,
  Piano,
  Wand2,
  TrendingUp,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const features = [
    {
      icon: Mic,
      title: 'Smart Transcription',
      description: 'Convert any audio to sheet music instantly with AI-powered pitch detection',
      color: 'from-blue-500 to-cyan-500',
      gradient: 'blue'
    },
    {
      icon: Piano,
      title: 'Instrument Conversion',
      description: 'Transform between 14+ instruments with intelligent range mapping',
      color: 'from-purple-500 to-pink-500',
      gradient: 'purple'
    },
    {
      icon: Wand2,
      title: 'AI Assistant',
      description: 'Get real-time suggestions and analysis from Gemini AI',
      color: 'from-green-500 to-emerald-500',
      gradient: 'green'
    },
    {
      icon: Share2,
      title: 'Collaboration',
      description: 'Share compositions instantly and export to multiple formats',
      color: 'from-orange-500 to-red-500',
      gradient: 'orange'
    }
  ];

  const stats = [
    { value: '14+', label: 'Instruments', icon: Piano },
    { value: '99%', label: 'Accuracy', icon: TrendingUp },
    { value: 'Real-time', label: 'Processing', icon: Zap },
    { value: 'Free', label: 'To Start', icon: Award }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white/60">Loading Arco...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05080F] via-[#0A0F1A] to-[#05080F] overflow-x-hidden">
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#C9A84C]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#C9A84C]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#E5C46B] flex items-center justify-center">
              <Music size={20} className="text-[#05080F]" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] bg-clip-text text-transparent">
              Arco
            </span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-[#C9A84C]/50 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 mb-8 animate-fadeIn">
            <Sparkles size={14} className="text-[#C9A84C]" />
            <span className="text-sm text-[#C9A84C]">AI-Powered Music Studio</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fadeIn">
            <span className="bg-gradient-to-r from-white via-[#C9A84C] to-white bg-clip-text text-transparent">
              Create Music
            </span>
            <br />
            <span className="text-white">Like Never Before</span>
          </h1>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12 animate-fadeIn">
            Transform your ideas into professional compositions with AI transcription, 
            smart instrument conversion, and real-time sheet music rendering.
          </p>
          
          <div className="flex gap-4 justify-center animate-fadeIn">
            <button
              onClick={() => router.push('/login')}
              className="group px-8 py-4 bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] text-[#05080F] rounded-full font-semibold hover:shadow-2xl hover:shadow-[#C9A84C]/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              Start Creating
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
            >
              <Play size={18} />
              Watch Demo
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="text-center animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C9A84C]/10 mb-3">
                    <Icon size={20} className="text-[#C9A84C]" />
                  </div>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/40">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Everything you need to compose, transcribe, and share professional music
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group relative bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#C9A84C]/30 transition-all duration-500 hover:transform hover:-translate-y-2 cursor-pointer"
                  onMouseEnter={() => setHoveredFeature(idx)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}></div>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#C9A84C]/20 to-transparent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon size={24} className="text-[#C9A84C]" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-[#C9A84C] text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Learn more</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A84C]/10 mb-4">
                  <Zap size={12} className="text-[#C9A84C]" />
                  <span className="text-xs text-[#C9A84C]">Real-time Demo</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">
                  See It In Action
                </h3>
                <p className="text-white/60 mb-6">
                  Watch how Arco transcribes audio to sheet music in real-time, 
                  converts between instruments, and generates chord charts instantly.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    '🎵 Real-time audio transcription',
                    '🎹 Smart instrument conversion',
                    '📝 Automatic chord detection',
                    '🤖 AI-powered suggestions'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-white/80 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => router.push('/login')}
                  className="px-6 py-3 bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] text-[#05080F] rounded-full font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Try It Now
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] rounded-2xl blur-2xl opacity-20"></div>
                <div className="relative bg-[#05080F] rounded-2xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-white/40 ml-2">arco-studio</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-white/5 rounded-lg animate-pulse delay-150"></div>
                    <div className="h-20 bg-white/5 rounded-lg animate-pulse delay-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] bg-clip-text text-transparent">
                Trusted by Creators
              </span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Join thousands of musicians using Arco to create amazing music
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Chen',
                role: 'Composer',
                content: 'Arco completely changed how I compose. The transcription is incredibly accurate and the AI suggestions are surprisingly helpful.'
              },
              {
                name: 'Marcus Rodriguez',
                role: 'Music Producer',
                content: 'The instrument conversion feature is magic. I can record on piano and instantly hear how it sounds on strings or brass.'
              },
              {
                name: 'Emma Thompson',
                role: 'Music Teacher',
                content: 'Perfect for teaching. My students can see their melodies as sheet music instantly and practice with the playback feature.'
              }
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-[#C9A84C]/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E5C46B] flex items-center justify-center">
                    <span className="text-[#05080F] font-bold">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-xs text-white/40">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#C9A84C]/10 to-transparent rounded-3xl p-12 border border-[#C9A84C]/20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Create?
            </h2>
            <p className="text-white/60 text-lg mb-8">
              Join Arco today and transform your musical ideas into reality
            </p>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C9A84C] to-[#E5C46B] text-[#05080F] rounded-full font-semibold hover:shadow-2xl hover:shadow-[#C9A84C]/30 transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight size={18} />
            </button>
            <p className="text-xs text-white/30 mt-4">No credit card required • Free forever</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Music size={16} className="text-[#C9A84C]" />
              <span className="text-sm text-white/40">© 2024 Arco Music Platform</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-white/40 hover:text-[#C9A84C] transition-colors">Privacy</a>
              <a href="#" className="text-sm text-white/40 hover:text-[#C9A84C] transition-colors">Terms</a>
              <a href="#" className="text-sm text-white/40 hover:text-[#C9A84C] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        
        .delay-150 {
          animation-delay: 0.15s;
        }
        
        .delay-300 {
          animation-delay: 0.3s;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
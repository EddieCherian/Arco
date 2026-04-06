'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Music, Mic, Share2, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const features = [
    {
      icon: Mic,
      title: 'Audio Transcription',
      description: 'Record or upload audio and convert to sheet music instantly using Spotify Basic Pitch'
    },
    {
      icon: Music,
      title: 'Smart Instrument Conversion',
      description: 'Transform between 14+ instruments with intelligent range mapping using Magenta.js'
    },
    {
      icon: Share2,
      title: 'Collaboration Tools',
      description: 'Share compositions via unique links and export to PDF, MIDI, MP3, or MusicXML'
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Get musical suggestions and analysis from Gemini 2.0 Flash AI'
    }
  ];

  return (
    <div className="min-h-screen bg-[#05080F]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 mb-6">
              <Sparkles size={14} className="text-[#C9A84C]" />
              <span className="text-sm text-[#C9A84C]">AI-Powered Music Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="text-[#C9A84C]">Arco</span>
              <span className="text-[#EEF2FF]">: Compose</span>
              <br />
              <span className="text-[#EEF2FF]">Transcribe, Play</span>
            </h1>
            
            <p className="text-xl text-[#EEF2FF]/70 mb-8 max-w-2xl mx-auto">
              Professional music composition platform with AI transcription, 
              instrument conversion, and real-time sheet music rendering
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="px-8 py-3 bg-[#C9A84C] text-[#05080F] rounded-lg font-semibold hover:bg-[#b8943a] transition-all transform hover:scale-105 flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => {
                  const demoSection = document.getElementById('features');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3 border border-[#C9A84C]/30 text-[#EEF2FF] rounded-lg font-semibold hover:bg-[#C9A84C]/10 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-4">
            Powerful Features
          </h2>
          <p className="text-[#EEF2FF]/60 text-lg max-w-2xl mx-auto">
            Everything you need to create professional music compositions
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-[#0a0f1a] rounded-lg p-6 border border-[#C9A84C]/20 hover:border-[#C9A84C]/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-[#C9A84C]/10 flex items-center justify-center mb-4 group-hover:bg-[#C9A84C]/20 transition-colors">
                  <Icon size={24} className="text-[#C9A84C]" />
                </div>
                <h3 className="text-lg font-semibold text-[#EEF2FF] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#EEF2FF]/60">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Preview Section */}
      <div className="bg-gradient-to-b from-[#0a0f1a] to-[#05080F] py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#C9A84C] mb-4">
                See It In Action
              </h2>
              <p className="text-[#EEF2FF]/60">
                Real-time transcription, sheet music rendering, and AI assistance
              </p>
            </div>
            
            <div className="bg-[#0a0f1a] rounded-lg border border-[#C9A84C]/20 p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-[#EEF2FF]/60">Ready to record</span>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#05080F] rounded-lg border border-[#C9A84C]/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#EEF2FF]/80">Microphone Input</span>
                        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                          <Mic size={14} className="text-[#C9A84C]" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-[#05080F] rounded-lg border border-[#C9A84C]/10">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#EEF2FF]/80">File Upload</span>
                        <div className="w-8 h-8 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
                          <Music size={14} className="text-[#C9A84C]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-l border-[#C9A84C]/20 pl-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-[#C9A84C]">
                      <Sparkles size={14} />
                      <span>AI Assistant Ready</span>
                    </div>
                    <div className="p-3 bg-[#05080F] rounded-lg border border-[#C9A84C]/10">
                      <p className="text-xs text-[#EEF2FF]/60">
                        Ask me about chord progressions, arrangement ideas, or music theory...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#C9A84C] mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-[#EEF2FF]/60 text-lg mb-8">
            Join Arco today and transform your musical ideas into professional compositions
          </p>
          <button
            onClick={() => router.push('/login')}
            className="px-8 py-3 bg-[#C9A84C] text-[#05080F] rounded-lg font-semibold hover:bg-[#b8943a] transition-all transform hover:scale-105 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#C9A84C]/20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-[#EEF2FF]/40">
          <p>© 2024 Arco Music Platform. Powered by Next.js, Firebase, and Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { MidiData } from '@/lib/types';

interface GeminiAssistantProps {
  midiData: MidiData;
}

export function GeminiAssistant({ midiData }: GeminiAssistantProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setConversation(prev => [...prev, { role: 'user', content: message }]);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          context: {
            key: midiData.key,
            tempo: midiData.tempo,
            timeSignature: midiData.timeSignature,
            instrument: midiData.instrument,
            noteCount: midiData.notes.length,
            duration: midiData.notes.length > 0 ? Math.max(...midiData.notes.map(n => n.endTime)) : 0
          }
        })
      });
      
      const data = await res.json();
      const aiResponse = data.response || 'Sorry, I could not process that request.';
      
      setConversation(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setResponse(aiResponse);
    } catch (error) {
      setConversation(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI assistant.' }]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="bg-[#0a0f1a] rounded-lg border border-[#C9A84C]/20 flex flex-col h-[600px]">
      <div className="p-4 border-b border-[#C9A84C]/20 flex items-center gap-2">
        <Sparkles size={18} className="text-[#C9A84C]" />
        <h3 className="font-semibold text-[#C9A84C]">Gemini AI Assistant</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conversation.length === 0 ? (
          <div className="text-center text-[#EEF2FF]/40 py-8">
            <Sparkles size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Ask me about:</p>
            <ul className="text-xs mt-2 space-y-1">
              <li>• Chord progressions for your melody</li>
              <li>• Arrangement suggestions</li>
              <li>• Music theory analysis</li>
              <li>• Technical help with the platform</li>
            </ul>
          </div>
        ) : (
          conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-[#C9A84C]/10 border border-[#C9A84C]/20 ml-8'
                  : 'bg-[#05080F] border border-[#C9A84C]/10 mr-8'
              }`}
            >
              <p className="text-xs text-[#C9A84C] mb-1">
                {msg.role === 'user' ? 'You' : 'Arco AI'}
              </p>
              <p className="text-sm text-[#EEF2FF]">{msg.content}</p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-[#C9A84C] p-3">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Thinking...</span>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-[#C9A84C]/20">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask for musical suggestions..."
            className="flex-1 px-4 py-2 bg-[#05080F] border border-[#C9A84C]/30 rounded-lg text-[#EEF2FF] placeholder-[#EEF2FF]/30 focus:border-[#C9A84C] focus:outline-none"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !message.trim()}
            className="px-4 py-2 bg-[#C9A84C] text-[#05080F] rounded-lg hover:bg-[#b8943a] transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { MidiData } from '@/lib/types';

interface GeminiAssistantProps {
  midiData: MidiData;
}

export function GeminiAssistant({ midiData }: GeminiAssistantProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isLoading]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    const userMsg = message.trim();
    setMessage('');
    setIsLoading(true);
    setConversation(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
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
      setConversation(prev => [...prev, { role: 'assistant', content: data.response || 'Could not process that request.' }]);
    } catch {
      setConversation(prev => [...prev, { role: 'assistant', content: 'Error connecting to AI assistant.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    'Suggest chords for this melody',
    'What key am I playing in?',
    'How can I improve this piece?',
    'Suggest a time signature change',
  ];

  const css = `
    .ai-wrap { display: flex; flex-direction: column; height: 580px; }
    .ai-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; gap: 24px; }
    .ai-empty-icon { width: 48px; height: 48px; border: 1px solid #C9A84C25; display: flex; align-items: center; justify-content: center; color: #C9A84C; opacity: 0.5; }
    .ai-empty-title { font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-weight: 700; color: #EEF2FF; text-align: center; }
    .ai-empty-title em { font-style: italic; color: #C9A84C; }
    .ai-suggestions { display: flex; flex-direction: column; gap: 6px; width: 100%; }
    .ai-suggestion { background: transparent; border: 1px solid #C9A84C15; padding: 10px 14px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #EEF2FF33; text-align: left; transition: border-color 0.2s, color 0.2s, background 0.2s; }
    .ai-suggestion:hover { border-color: #C9A84C40; color: #EEF2FF88; background: #C9A84C06; }
    .ai-messages { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
    .ai-messages::-webkit-scrollbar { width: 3px; }
    .ai-messages::-webkit-scrollbar-track { background: transparent; }
    .ai-messages::-webkit-scrollbar-thumb { background: #C9A84C25; }
    .ai-msg { padding: 14px 16px; position: relative; max-width: 90%; }
    .ai-msg-user { background: #C9A84C08; border: 1px solid #C9A84C20; align-self: flex-end; }
    .ai-msg-user::after { content: ''; position: absolute; bottom: -1px; right: -1px; width: 8px; height: 8px; border-bottom: 1px solid #C9A84C; border-right: 1px solid #C9A84C; }
    .ai-msg-assistant { background: #080C14; border: 1px solid #C9A84C12; align-self: flex-start; }
    .ai-msg-assistant::before { content: ''; position: absolute; top: -1px; left: -1px; width: 8px; height: 8px; border-top: 1px solid #C9A84C; border-left: 1px solid #C9A84C; opacity: 0.5; }
    .ai-msg-role { font-family: 'DM Mono', monospace; font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase; color: #C9A84C; opacity: 0.7; margin-bottom: 8px; }
    .ai-msg-content { font-family: 'Crimson Pro', Georgia, serif; font-size: 15px; font-weight: 300; color: #EEF2FF99; line-height: 1.7; }
    .ai-thinking { display: flex; align-items: center; gap: 8px; padding: 14px 16px; border: 1px solid #C9A84C12; background: #080C14; align-self: flex-start; }
    .ai-thinking-dot { width: 4px; height: 4px; background: #C9A84C; border-radius: 50%; animation: aidot 1.2s ease-in-out infinite; }
    .ai-thinking-dot:nth-child(2) { animation-delay: 0.2s; }
    .ai-thinking-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes aidot { 0%, 100% { opacity: 0.2; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
    .ai-input-row { padding: 16px 20px; border-top: 1px solid #C9A84C12; display: flex; gap: 10px; align-items: center; }
    .ai-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid #C9A84C18; padding: 10px 0; font-family: 'Crimson Pro', Georgia, serif; font-size: 15px; font-style: italic; font-weight: 300; color: #EEF2FF99; outline: none; transition: border-color 0.2s, color 0.2s; }
    .ai-input:focus { border-color: #C9A84C66; color: #EEF2FF; }
    .ai-input::placeholder { color: #EEF2FF22; }
    .ai-send { width: 36px; height: 36px; background: #C9A84C; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #05080F; flex-shrink: 0; transition: background 0.2s; }
    .ai-send:hover:not(:disabled) { background: #E8C96A; }
    .ai-send:disabled { opacity: 0.4; cursor: not-allowed; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="ai-wrap">
        {conversation.length === 0 && !isLoading ? (
          <div className="ai-empty">
            <div className="ai-empty-icon"><Sparkles size={20} /></div>
            <p className="ai-empty-title">Ask <em>Arco</em> Anything</p>
            <div className="ai-suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="ai-suggestion" onClick={() => { setMessage(s); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ai-messages">
            {conversation.map((msg, idx) => (
              <div key={idx} className={`ai-msg ${msg.role === 'user' ? 'ai-msg-user' : 'ai-msg-assistant'}`}>
                <div className="ai-msg-role">{msg.role === 'user' ? 'You' : 'Arco AI'}</div>
                <div className="ai-msg-content">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="ai-thinking">
                <div className="ai-thinking-dot" />
                <div className="ai-thinking-dot" />
                <div className="ai-thinking-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        <div className="ai-input-row">
          <input
            className="ai-input"
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask for musical suggestions..."
          />
          <button className="ai-send" onClick={sendMessage} disabled={isLoading || !message.trim()}>
            {isLoading ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </>
  );
}

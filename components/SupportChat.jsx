"use client";
import { useState, useRef, useEffect } from 'react';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: "Hey! I'm Remy, ReFuel's support assistant. I can help with product questions, your formula, subscriptions, shipping, or anything else about ReFuel. What's on your mind?",
};

export default function SupportChat() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasUnread(false);
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text ?? "Sorry, I couldn't get a response. Try again!";
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      if (!open) setHasUnread(true);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, something went wrong on my end. Please try again or email us at haydenh.refuel@gmail.com",
      }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => setMessages([WELCOME_MESSAGE]);

  // ── Suggested prompts shown when only the welcome message exists ──────────
  const SUGGESTIONS = [
    "What's in the Custom Gel Powder?",
    "How does the subscription work?",
    "What's the difference between the two gels?",
    "How do I use the quiz?",
  ];

  return (
    <>
      {/* ── Floating button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1a2535 0%, #2e4460 100%)' }}
        aria-label="Open support chat"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
        )}

        {/* Unread dot */}
        {hasUnread && !open && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────────────── */}
      <div className={`fixed bottom-24 right-6 z-[60] w-[370px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right
        ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
        style={{ height: '520px', background: '#fff' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1a2535 0%, #2e4460 100%)' }}>
          <div className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">RF</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">Remy</p>
            <p className="text-white/60 text-xs">ReFuel Support · Usually instant</p>
          </div>
          <button onClick={clearChat}
            className="text-white/40 hover:text-white/70 transition p-1 rounded-lg hover:bg-white/10"
            title="Clear chat">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
          <button onClick={() => setOpen(false)}
            className="text-white/40 hover:text-white/70 transition p-1 rounded-lg hover:bg-white/10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 mt-0.5 flex items-center justify-center text-white text-xs font-black"
                  style={{ background: 'linear-gradient(135deg, #1a2535, #2e4460)', minWidth: '1.5rem' }}>
                  R
                </div>
              )}
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-gray-900 text-white rounded-tr-sm'
                  : 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100'}`}>
                {/* Render newlines as line breaks */}
                {msg.content.split('\n').map((line, li) => (
                  <span key={li}>{line}{li < msg.content.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 rounded-full flex-shrink-0 mr-2 flex items-center justify-center text-white text-xs font-black"
                style={{ background: 'linear-gradient(135deg, #1a2535, #2e4460)', minWidth: '1.5rem' }}>
                R
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Suggested prompts — only shown at start */}
          {messages.length === 1 && !loading && (
            <div className="pt-1 space-y-1.5">
              {SUGGESTIONS.map((s, i) => (
                <button key={i}
                  onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                  className="w-full text-left text-xs text-gray-600 bg-white border border-gray-200 hover:border-gray-400 hover:text-gray-900 px-3 py-2 rounded-xl transition-all">
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-3 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              rows={1}
              className="flex-1 resize-none text-sm text-gray-900 placeholder-gray-400 outline-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:border-gray-400 transition max-h-24"
              style={{ lineHeight: '1.4' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg, #1a2535 0%, #2e4460 100%)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </div>
          <p className="text-center text-xs text-gray-300 mt-2">Powered by ReFuel AI · responses may not be perfect</p>
        </div>
      </div>
    </>
  );
}

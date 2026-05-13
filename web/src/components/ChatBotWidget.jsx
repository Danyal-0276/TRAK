import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, Trash2, X } from 'lucide-react';
import { chatWithBot, clearChatHistory, getChatHistory } from '../utils/Service/api';
import { useAuth } from '../context/AuthContext';

const QUICK_PROMPTS = [
  'Top tech headlines',
  'Latest Pakistan news',
  'Show trending topics',
];

const ChatBotWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [renderPanel, setRenderPanel] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Welcome to TRAK AI. Ask me anything about fresh news.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef(null);
  const glow = useMemo(() => ({ boxShadow: '0 12px 40px rgba(15,23,42,0.28)' }), []);

  useEffect(() => {
    if (open) setRenderPanel(true);
    else {
      const id = window.setTimeout(() => setRenderPanel(false), 180);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getChatHistory();
        if (Array.isArray(res.messages) && res.messages.length) {
          const mapped = res.messages.map((m) => ({
            role: m.role,
            text: m.text,
            articleTitle: m.article_title,
            articleUrl: m.article_url,
            source: m.source,
          }));
          setMessages(mapped);
        }
      } catch (_) {
        // keep default intro message
      } finally {
        setHistoryLoaded(true);
      }
    };
    if (!user) {
      setHistoryLoaded(true);
      return;
    }
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const sendMessage = async (preset) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatWithBot(text);
      const top = Array.isArray(res.articles) && res.articles[0] ? res.articles[0] : null;
      const fallbackUrl = top?.title
        ? `https://www.google.com/search?q=${encodeURIComponent(top.title)}`
        : null;
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: res.reply || 'No response',
          articleTitle: top?.title,
          articleUrl: top?.canonical_url || fallbackUrl,
        },
      ]);
      if (!open) {
        setHasUnread(true);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: error.message || 'Chat failed' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 1000 }}>
      <style>{`
        @keyframes chatMsgIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .35; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
      {renderPanel ? (
        <div style={{ width: 360, height: 520, background: '#fff', border: '1px solid #dbe4f0', borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...glow, opacity: open ? 1 : 0, transform: `translateY(${open ? 0 : 12}px) scale(${open ? 1 : 0.98})`, transition: 'all 180ms ease' }}>
          <div style={{ padding: '12px 14px', background: 'linear-gradient(135deg, #0f172a, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <Sparkles size={14} />
              <strong style={{ fontSize: 14 }}>TRAK AI Assistant</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => setConfirmClear(true)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}
                title="Clear chat history"
              >
                <Trash2 size={15} />
              </button>
              <button onClick={() => setOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
            </div>
          </div>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 12, background: 'radial-gradient(circle at top right, #f8fafc 0%, #ffffff 55%)' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 8, textAlign: m.role === 'user' ? 'right' : 'left', animation: `chatMsgIn 220ms ease ${Math.min(i * 20, 120)}ms both` }}>
                <span style={{ display: 'inline-block', fontSize: 13, padding: '10px 12px', borderRadius: 14, background: m.role === 'user' ? 'linear-gradient(135deg, #0f172a, #1e293b)' : 'linear-gradient(135deg, #eef2ff, #f8fafc)', color: m.role === 'user' ? '#fff' : '#0f172a', maxWidth: '88%', lineHeight: 1.5, border: m.role === 'user' ? 'none' : '1px solid #dbe4f0' }}>
                  {m.text}
                </span>
                {m.articleUrl && (
                  <div style={{ marginTop: 7, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <button onClick={() => window.open(m.articleUrl, '_blank', 'noopener,noreferrer')} style={{ border: '1px solid #dbe4f0', borderRadius: 10, padding: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', cursor: 'pointer', maxWidth: 250, textAlign: 'left' }}>
                      <div style={{ padding: '8px 10px' }}>
                        <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{m.source || 'TRAK Source'}</div>
                        <div style={{ fontSize: 12, color: '#0f172a', fontWeight: 600, lineHeight: 1.4 }}>
                          {m.articleTitle || 'Open related article'}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 11, color: '#334155' }}>View article</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>TRAK AI is typing</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#64748b',
                        animation: `typingBounce 1s ${i * 0.16}s infinite`,
                      }}
                    />
                  ))}
                </span>
              </div>
            )}
            {!loading && historyLoaded && messages.length === 0 && (
              <div style={{ fontSize: 12, color: '#64748b' }}>No chat history yet.</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 10px', borderTop: '1px solid #e2e8f0' }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                style={{ fontSize: 11, border: '1px solid #cbd5e1', borderRadius: 999, background: '#fff', color: '#334155', padding: '5px 9px', cursor: 'pointer' }}
              >
                {p}
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', padding: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything about news..."
              style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: 10, padding: '9px 11px' }}
            />
            <button onClick={() => sendMessage()} disabled={loading} style={{ width: 36, height: 36, border: 'none', background: '#0f172a', color: '#fff', borderRadius: 10, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => { setOpen(true); setHasUnread(false); }} style={{ width: 58, height: 58, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #0f172a, #334155)', color: '#fff', cursor: 'pointer', boxShadow: '0 12px 30px rgba(15,23,42,0.35)', display: 'grid', placeItems: 'center', position: 'relative', transform: 'translateZ(0)', transition: 'transform 160ms ease' }}>
          {hasUnread && <span style={{ position: 'absolute', top: 6, right: 6, width: 10, height: 10, borderRadius: '50%', background: '#ef4444', border: '2px solid #fff' }} />}
          <Bot size={22} />
        </button>
      )}
      {confirmClear && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', display: 'grid', placeItems: 'center', zIndex: 1001 }}>
          <div style={{ width: 320, background: '#fff', borderRadius: 14, border: '1px solid #dbe4f0', padding: 16, boxShadow: '0 16px 42px rgba(15,23,42,0.26)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Clear chat history?</div>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 14 }}>This action cannot be undone.</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setConfirmClear(false)} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={async () => {
                  await clearChatHistory();
                  setMessages([{ role: 'bot', text: 'History cleared. Ask me anything new.' }]);
                  setConfirmClear(false);
                }}
                style={{ border: 'none', background: '#dc2626', color: '#fff', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBotWidget;

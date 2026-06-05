import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, Sparkles, Trash2, X } from 'lucide-react';
import { chatWithBot, clearChatHistory, getChatHistory } from '../utils/Service/api';
import { useAuth } from '../context/AuthContext';
import { useChatBot } from '../context/ChatBotContext';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { filledActionColors } from '../theme/buttonContrast';

/** In-app TRAK article path only — never external publisher URLs. */
function resolveTrakArticlePath(article) {
  if (!article) return null;
  const path = article.trak_path || article.article_path;
  if (typeof path === 'string' && path.startsWith('/article/')) return path;
  const id = article.id || article.article_id;
  return id ? `/article/${encodeURIComponent(String(id))}` : null;
}

function mapHistoryMessage(m) {
  const path =
    (typeof m.article_path === 'string' && m.article_path.startsWith('/article/') && m.article_path) ||
    (m.article_id ? `/article/${encodeURIComponent(String(m.article_id))}` : null);
  const relatedArticles = [];
  if (path) {
    relatedArticles.push({
      title: m.article_title,
      source: m.source,
      path,
    });
  }
  return {
    role: m.role,
    text: m.text,
    relatedArticles,
  };
}



const ChatBotWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { open, setOpen, hasUnread, setHasUnread, closeChat, toggleChat } = useChatBot();
  const { isMobile } = useResponsive();
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);

  const [renderPanel, setRenderPanel] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi! I am TRAK AI — built by the TRAK team to help you explore news. Ask about headlines, topics, or stories in your feed.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef(null);
  const glow = useMemo(
    () => ({ boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.45)' : '0 12px 40px rgba(0,0,0,0.18)' }),
    [isDark],
  );

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
          const mapped = res.messages.map(mapHistoryMessage);
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
      const related = Array.isArray(res.related_articles) && res.related_articles.length
        ? res.related_articles
        : Array.isArray(res.articles) && res.articles.length
          ? res.articles
          : res.has_trak_article && res.primary_article
            ? [res.primary_article]
            : [];
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: res.reply || 'No response',
          relatedArticles: related
            .map((a) => ({
              title: a.title,
              source: a.source,
              path: resolveTrakArticlePath(a),
            }))
            .filter((a) => a.path),
        },
      ]);
      if (!open) {
        setHasUnread(true);
      }
    } catch (error) {
      const fallback =
        error?.status === 502
          ? 'TRAK AI is temporarily unavailable. Please try again in a moment.'
          : error?.status === 401
            ? 'Please sign in again to use TRAK AI.'
            : error.message || 'Chat failed. Please try again.';
      setMessages((prev) => [...prev, { role: 'bot', text: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const dockBottom = isMobile ? 76 : 20;

  return (
    <div style={{ position: 'fixed', right: 20, bottom: dockBottom, zIndex: 1101 }}>
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
        <div
          style={{
            width: isMobile ? 'min(360px, calc(100vw - 40px))' : 360,
            height: isMobile ? 'min(520px, calc(100vh - 160px))' : 520,
            background: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            ...glow,
            opacity: open ? 1 : 0,
            transform: `translateY(${open ? 0 : 12}px) scale(${open ? 1 : 0.98})`,
            transition: 'all 180ms ease',
          }}
        >
          <div
            style={{
              padding: '12px 14px',
              background: colors.backgroundSecondary,
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.textPrimary }}>
              <Sparkles size={14} />
              <strong style={{ fontSize: 14 }}>TRAK AI Assistant</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textSecondary }}
                title="Clear chat history"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                onClick={closeChat}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: colors.textSecondary }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: 'auto', padding: 12, background: colors.background }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 8,
                  textAlign: m.role === 'user' ? 'right' : 'left',
                  animation: `chatMsgIn 220ms ease ${Math.min(i * 20, 120)}ms both`,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: 13,
                    padding: '10px 12px',
                    borderRadius: 14,
                    background: m.role === 'user' ? action.background : colors.backgroundSecondary,
                    color: m.role === 'user' ? action.foreground : colors.textPrimary,
                    maxWidth: '88%',
                    lineHeight: 1.5,
                    border: m.role === 'user' ? 'none' : `1px solid ${colors.border}`,
                  }}
                >
                  {m.text}
                </span>
                {Array.isArray(m.relatedArticles) && m.relatedArticles.length > 0 && (
                  <div
                    style={{
                      marginTop: 7,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                      alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {m.relatedArticles.map((art, j) => (
                      <button
                        key={`${art.path}-${j}`}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate(art.path);
                        }}
                        style={{
                          border: `1px solid ${colors.border}`,
                          borderRadius: 10,
                          padding: 0,
                          background: colors.backgroundSecondary,
                          cursor: 'pointer',
                          maxWidth: 250,
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ padding: '8px 10px' }}>
                          <div style={{ fontSize: 10, color: colors.textTertiary, marginBottom: 4 }}>
                            {art.source || 'TRAK'} · In app
                          </div>
                          <div style={{ fontSize: 12, color: colors.textPrimary, fontWeight: 600, lineHeight: 1.4 }}>
                            {art.title || 'Open TRAK article'}
                          </div>
                          <div style={{ marginTop: 6, fontSize: 11, color: colors.textSecondary }}>Read in TRAK</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: colors.textSecondary }}>TRAK AI is typing</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: colors.textTertiary,
                        animation: `typingBounce 1s ${i * 0.16}s infinite`,
                      }}
                    />
                  ))}
                </span>
              </div>
            )}
            {!loading && historyLoaded && messages.length === 0 && (
              <div style={{ fontSize: 12, color: colors.textSecondary }}>No chat history yet.</div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              padding: '8px 10px',
              borderTop: `1px solid ${colors.border}`,
            }}
          >
          </div>
          <div
            style={{
              borderTop: `1px solid ${colors.border}`,
              padding: 10,
              display: 'flex',
              gap: 8,
              alignItems: 'center',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about news headlines..."
              style={{
                flex: 1,
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: '9px 11px',
                background: colors.backgroundSecondary,
                color: colors.textPrimary,
              }}
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading}
              style={{
                width: 36,
                height: 36,
                border: 'none',
                background: action.background,
                color: action.foreground,
                borderRadius: 10,
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggleChat}
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            border: 'none',
            background: action.background,
            color: action.foreground,
            cursor: 'pointer',
            boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.25)',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            transform: 'translateZ(0)',
            transition: 'transform 160ms ease',
          }}
        >
          {hasUnread && (
            <span
              style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: colors.error || '#ef4444',
                border: `2px solid ${action.background}`,
              }}
            />
          )}
          <Bot size={22} />
        </button>
      )}
      {confirmClear && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.35)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1001,
          }}
        >
          <div
            style={{
              width: 320,
              background: colors.surface,
              borderRadius: 14,
              border: `1px solid ${colors.border}`,
              padding: 16,
              boxShadow: glow.boxShadow,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
              Clear chat history?
            </div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 14 }}>
              This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                style={{
                  border: `1px solid ${colors.border}`,
                  background: colors.surface,
                  color: colors.textPrimary,
                  borderRadius: 8,
                  padding: '7px 12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await clearChatHistory();
                  setMessages([{ role: 'bot', text: 'History cleared. Ask me anything new.' }]);
                  setConfirmClear(false);
                }}
                style={{
                  border: 'none',
                  background: colors.error || '#dc2626',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '7px 12px',
                  cursor: 'pointer',
                }}
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

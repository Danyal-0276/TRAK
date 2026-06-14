import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthPath } from '../navigation/authPaths';
import { Bot, Send, Sparkles, SquarePen, PanelLeft, X } from 'lucide-react';
import {
  chatWithBot,
  getChatConversation,
} from '../utils/Service/api';
import { useAuth } from '../context/AuthContext';
import { useChatBot } from '../context/ChatBotContext';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { filledActionColors } from '../theme/buttonContrast';
import { CHAT_ANIMATION_CSS, CHAT_HERO_SUBTITLE, CHAT_HERO_TITLE, CHAT_PROMPTS } from './chat/chatUiConstants';
import ChatSidebar from './chat/ChatSidebar';
import { mapServerChatMessages } from './chat/chatMessageUtils';

function resolveTrakArticlePath(article) {
  if (!article) return null;
  const path = article.trak_path || article.article_path;
  if (typeof path === 'string' && path.startsWith('/article/')) return path;
  const id = article.id || article.article_id;
  return id ? `/article/${encodeURIComponent(String(id))}` : null;
}

function mapHistoryMessage(m) {
  return mapServerChatMessages([m])[0] || { role: m.role, text: m.text, relatedArticles: [] };
}

function BotAvatar({ colors, action, size = 30 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
        background: action.background,
        color: action.foreground,
      }}
    >
      <Bot size={size * 0.52} color={action.foreground} strokeWidth={2.25} />
    </div>
  );
}

function TypingBubble({ colors, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 12 }}>
      <BotAvatar colors={colors} action={action} />
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          padding: '12px 14px',
          borderRadius: 18,
          borderBottomLeftRadius: 6,
          background: colors.backgroundSecondary,
          border: `1px solid ${colors.border}`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: colors.textSecondary,
              animation: `typingBounce 1s ${i * 0.16}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatEmptyState({ colors, action, isDark, onSelect }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 8px 12px',
        animation: 'chatHeroIn 360ms cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          display: 'grid',
          placeItems: 'center',
          marginBottom: 16,
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            display: 'grid',
            placeItems: 'center',
            background: action.background,
            color: action.foreground,
          }}
        >
          <Bot size={30} strokeWidth={2} />
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, letterSpacing: -0.3, textAlign: 'center' }}>
        {CHAT_HERO_TITLE}
      </div>
      <div
        style={{
          fontSize: 13,
          color: colors.textSecondary,
          textAlign: 'center',
          marginTop: 8,
          marginBottom: 18,
          lineHeight: 1.5,
          maxWidth: 280,
        }}
      >
        {CHAT_HERO_SUBTITLE}
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {CHAT_PROMPTS.map((item) => (
          <button
            key={item.prompt}
            type="button"
            onClick={() => onSelect(item.prompt)}
            style={{
              width: '100%',
              textAlign: 'left',
              border: `1px solid ${colors.border}`,
              borderRadius: 14,
              padding: '11px 13px',
              background: colors.surface,
              cursor: 'pointer',
              transition: 'transform 120ms ease, opacity 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <Sparkles size={13} color={colors.textSecondary} />
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{item.label}</span>
            </div>
            <div style={{ fontSize: 12, color: colors.textSecondary, paddingLeft: 21 }}>{item.hint}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

const ChatBotWidget = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { open, setOpen, hasUnread, setHasUnread, closeChat, toggleChat } = useChatBot();
  const { isMobile } = useResponsive();
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);

  const [renderPanel, setRenderPanel] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const messageCountRef = useRef(0);

  const glow = useMemo(
    () => ({ boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.5)' : '0 16px 48px rgba(0,0,0,0.16)' }),
    [isDark],
  );

  const canSend = Boolean(input.trim()) && !loading;
  const showEmptyState = historyLoaded && messages.length === 0 && !loading;

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, []);

  const resizeTextarea = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    if (open) {
      setRenderPanel(true);
      const id = window.setTimeout(() => inputRef.current?.focus(), 240);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setRenderPanel(false), 220);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!user) {
      setHistoryLoaded(true);
      return;
    }
    setHistoryLoaded(true);
  }, [user]);

  const startNewChat = useCallback(() => {
    setConversationId(null);
    setMessages([]);
  }, []);

  const openConversation = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await getChatConversation(id);
      setConversationId(String(res.id || id));
      setMessages(mapServerChatMessages(res.messages));
      setHistoryLoaded(true);
      scrollToLatest();
    } catch {
      startNewChat();
    }
  }, [scrollToLatest, startNewChat]);

  useEffect(() => {
    if (messages.length > messageCountRef.current || loading) scrollToLatest();
    messageCountRef.current = messages.length;
  }, [messages, loading, scrollToLatest]);

  useEffect(() => {
    resizeTextarea();
  }, [input, open, resizeTextarea]);

  const sendMessage = async (preset) => {
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatWithBot(text, conversationId);
      if (res.conversation_id) {
        setConversationId(String(res.conversation_id));
      }
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
      if (!open) setHasUnread(true);
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

  const handleComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) sendMessage();
    }
  };

  if (!user || isAuthPath(location.pathname) || location.pathname.startsWith('/admin')) {
    return null;
  }

  const dockBottom = isMobile ? 76 : 20;

  return (
    <div style={{ position: 'fixed', right: 20, bottom: dockBottom, zIndex: 1101 }}>
      <style>{CHAT_ANIMATION_CSS}</style>
      {renderPanel ? (
        <div
          style={{
            width: isMobile ? 'min(400px, calc(100vw - 32px))' : 400,
            height: isMobile ? 'min(620px, calc(100vh - 140px))' : 620,
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: 20,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            ...glow,
            animation: open ? 'chatPanelIn 280ms cubic-bezier(0.22, 1, 0.36, 1) both' : 'none',
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
            transition: open ? 'none' : 'opacity 180ms ease, transform 180ms ease',
            pointerEvents: open ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              padding: '11px 14px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: colors.background,
            }}
          >
            <div style={{ flex: 1, textAlign: 'center', minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, letterSpacing: -0.3 }}>TRAK AI</div>
              <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {loading ? 'Thinking…' : 'News assistant'}
              </div>
            </div>
            <div style={{ position: 'absolute', left: 10, display: 'flex', gap: 2 }}>
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                }}
                title="Chat history"
              >
                <PanelLeft size={16} />
              </button>
              <button
                type="button"
                onClick={startNewChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                }}
                title="New chat"
              >
                <SquarePen size={16} />
              </button>
            </div>
            <div style={{ position: 'absolute', right: 10 }}>
              <button
                type="button"
                onClick={closeChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.textSecondary,
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                }}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <ChatSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            colors={colors}
            activeConversationId={conversationId}
            onSelectConversation={openConversation}
            onNewChat={startNewChat}
          />

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: showEmptyState ? '8px 14px' : '14px 14px',
              scrollBehavior: 'smooth',
            }}
          >
            {showEmptyState ? (
              <ChatEmptyState colors={colors} action={action} isDark={isDark} onSelect={sendMessage} />
            ) : (
              <>
                {messages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}-${m.text?.slice(0, 16)}`}
                    style={{
                      display: 'flex',
                      flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 10,
                      marginBottom: 16,
                      animation: `chatMsgIn 280ms cubic-bezier(0.22, 1, 0.36, 1) ${Math.min(i * 20, 120)}ms both`,
                    }}
                  >
                    {m.role === 'bot' ? <BotAvatar colors={colors} action={action} /> : null}
                    <div
                      style={{
                        maxWidth: m.role === 'user' ? '86%' : '100%',
                        flex: m.role === 'bot' ? 1 : undefined,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {m.role === 'user' ? (
                        <span
                          style={{
                            display: 'inline-block',
                            fontSize: 14,
                            padding: '10px 14px',
                            borderRadius: 20,
                            borderBottomRightRadius: 6,
                            background: action.background,
                            color: action.foreground,
                            lineHeight: 1.55,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {m.text}
                        </span>
                      ) : (
                        <div style={{ fontSize: 14, lineHeight: 1.65, color: colors.textPrimary, paddingTop: 4, paddingRight: 8 }}>
                          {m.text}
                        </div>
                      )}
                      {Array.isArray(m.relatedArticles) && m.relatedArticles.length > 0 && (
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
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
                                borderRadius: 14,
                                padding: 0,
                                background: colors.surface,
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'transform 120ms ease',
                              }}
                            >
                              <div style={{ padding: '10px 12px' }}>
                                <div style={{ fontSize: 10, color: colors.textTertiary, marginBottom: 4, letterSpacing: 0.3, textTransform: 'uppercase' }}>
                                  {art.source || 'TRAK'} · Related story
                                </div>
                                <div style={{ fontSize: 13, color: colors.textPrimary, fontWeight: 600, lineHeight: 1.45 }}>
                                  {art.title || 'Open TRAK article'}
                                </div>
                                <div style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>Read in TRAK →</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading ? <TypingBubble colors={colors} action={action} /> : null}
              </>
            )}
          </div>

          <div
            style={{
              borderTop: `1px solid ${colors.border}`,
              padding: '10px 14px 12px',
              background: colors.background,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 6,
                border: `1px solid ${colors.border}`,
                borderRadius: 26,
                padding: '5px 5px 5px 14px',
                background: colors.surface,
                minHeight: 50,
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Ask anything about news…"
                rows={1}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  background: 'transparent',
                  color: colors.textPrimary,
                  fontSize: 14,
                  lineHeight: 1.45,
                  maxHeight: 120,
                  padding: '9px 0',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!canSend}
                aria-label="Send message"
                style={{
                  width: 38,
                  height: 38,
                  border: 'none',
                  background: canSend ? action.background : colors.backgroundSecondary,
                  color: canSend ? action.foreground : colors.textTertiary,
                  borderRadius: '50%',
                  cursor: canSend ? 'pointer' : 'default',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  opacity: canSend ? 1 : 0.55,
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <div style={{ fontSize: 11, color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
              Enter to send · Shift+Enter for new line
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={toggleChat}
          aria-label="Open TRAK AI chatbot"
          title="TRAK AI"
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
            animation: 'fabPulse 3s ease-in-out infinite',
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
          <Bot size={26} strokeWidth={2.25} />
        </button>
      )}
    </div>
  );
};

export default ChatBotWidget;

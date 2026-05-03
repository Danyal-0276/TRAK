import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { MessageCircle, Send, Trash2, X, Sparkles } from 'lucide-react-native';
import { chatWithBot, clearChatHistory, getChatHistory } from '../utils/Service/api';
import { useTheme } from '../theme/ThemeContext';
import { useFeedback } from './ui/FeedbackProvider';

const QUICK_PROMPTS = [
  'Top tech headlines',
  'Latest Pakistan news',
  'Show trending topics',
];

function formatCaughtMessage(e) {
  if (e == null) return 'Chat failed';
  if (typeof e === 'string') return e;
  if (typeof e === 'object' && typeof e.message === 'string') return e.message;
  return 'Chat failed';
}

const ChatBotWidget = () => {
  const { theme } = useTheme();
  const { confirm } = useFeedback();
  const colors = theme?.colors;
  if (!colors) {
    return null;
  }
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState('.');
  const [hasUnread, setHasUnread] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey! I am TRAK AI. Ask me about latest news.' },
  ]);
  const pulse = useRef(new Animated.Value(0)).current;
  const openAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    Animated.timing(openAnim, {
      toValue: open ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [open, openAnim]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getChatHistory();
        if (Array.isArray(res.messages) && res.messages.length) {
          setMessages(
            res.messages.map((m) => ({
              role: m.role,
              text: m.text,
              articleTitle: m.article_title,
              articleUrl: m.article_url,
              source: m.source,
            }))
          );
        }
      } catch (_) {
        // keep default intro
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => {
      setTypingDots((prev) => (prev.length >= 3 ? '.' : `${prev}.`));
    }, 380);
    return () => clearInterval(id);
  }, [loading]);

  const sendMessage = async (textValue) => {
    const text = (textValue ?? input).trim();
    if (!text || loading) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await chatWithBot(text);
      const top = Array.isArray(res.articles) && res.articles[0] ? res.articles[0] : null;
      const fallbackUrl = top?.title
        ? `https://www.google.com/search?q=${encodeURIComponent(top.title)}`
        : null;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'bot', text: formatCaughtMessage(e) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View pointerEvents="box-none" style={styles.root}>
      {open ? (
        <Animated.View
          style={{
            opacity: openAnim,
            transform: [
              {
                translateY: openAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
              },
              {
                scale: openAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }),
              },
            ],
          }}
        >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <LinearGradient
            colors={theme.mode === 'dark' ? ['#1E293B', '#334155'] : ['#0f172a', '#1e293b']}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <Sparkles size={16} color="#fff" />
              <Text style={styles.headerTitle}>TRAK AI Assistant</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={async () => {
                  const accepted = await confirm({
                    title: 'Clear chat history?',
                    message: 'This cannot be undone.',
                    confirmText: 'Clear',
                    danger: true,
                  });
                  if (!accepted) return;
                  await clearChatHistory();
                  setMessages([{ role: 'bot', text: 'History cleared. Ask me anything new.' }]);
                }}
                style={styles.iconBtn}
              >
                <Trash2 size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.iconBtn}>
                <X size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={{ padding: 12 }}>
            {messages.map((m, i) => (
              <View key={`${m.role}-${i}`} style={[styles.msgWrap, m.role === 'user' ? styles.userWrap : styles.botWrap]}>
                <Text style={[styles.msg, m.role === 'user' ? styles.userMsg : { color: colors.textPrimary, backgroundColor: colors.backgroundSecondary }]}>
                  {m.text}
                </Text>
                {m.articleUrl ? (
                  <TouchableOpacity style={[styles.articleCard, { borderColor: colors.border }]} onPress={() => Linking.openURL(m.articleUrl)}>
                    <LinearGradient
                      colors={theme.mode === 'dark' ? ['rgba(51,65,85,0.65)', 'rgba(30,41,59,0.65)'] : ['rgba(248,250,252,0.86)', 'rgba(255,255,255,0.86)']}
                      style={styles.articleCardInner}
                    >
                      <Text style={{ color: colors.textTertiary, fontSize: 10, marginBottom: 4 }}>
                        {m.source || 'TRAK Source'}
                      </Text>
                      <Text style={{ color: colors.textPrimary, fontSize: 12, fontWeight: '700', lineHeight: 17 }}>
                        {m.articleTitle || 'Open related article'}
                      </Text>
                      <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6 }}>View article</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
            {loading && <Text style={{ color: colors.textSecondary, fontSize: 12 }}>TRAK AI is typing{typingDots}</Text>}
          </ScrollView>

          <View style={styles.quickRow}>
            {QUICK_PROMPTS.map((p) => (
              <TouchableOpacity key={p} style={[styles.quickChip, { borderColor: colors.border }]} onPress={() => sendMessage(p)}>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about latest news..."
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity style={styles.sendBtn} disabled={loading} onPress={() => sendMessage()}>
              <Send size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        </Animated.View>
      ) : (
        <Animated.View
          style={{
            transform: [
              {
                scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }),
              },
            ],
          }}
        >
          <TouchableOpacity onPress={() => { setOpen(true); setHasUnread(false); }} style={styles.fab}>
            <LinearGradient colors={['#0f172a', '#334155']} style={styles.fabInner}>
              {hasUnread ? <View style={styles.unreadDot} /> : null}
              <MessageCircle size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { position: 'absolute', right: 16, bottom: 98, zIndex: 9999 },
  fab: { borderRadius: 28, overflow: 'hidden' },
  fabInner: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
  panel: {
    width: 340,
    height: 470,
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 12,
  },
  header: { paddingHorizontal: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  iconBtn: { padding: 4 },
  messages: { flex: 1 },
  msgWrap: { marginBottom: 8, maxWidth: '88%' },
  userWrap: { alignSelf: 'flex-end' },
  botWrap: { alignSelf: 'flex-start' },
  msg: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, fontSize: 12, lineHeight: 18 },
  userMsg: { color: '#fff', backgroundColor: '#0f172a' },
  quickRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingBottom: 8, flexWrap: 'wrap' },
  quickChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12 },
  sendBtn: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#0f172a', alignItems: 'center', justifyContent: 'center' },
  unreadDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#fff',
  },
  articleCard: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    maxWidth: 250,
  },
  articleCardInner: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});

export default ChatBotWidget;

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
  Platform,
  LayoutAnimation,
  UIManager,
  Linking,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, Send, Trash2, Sparkles } from 'lucide-react-native';
import { chatWithBot, clearChatHistory, getChatHistory } from '../../utils/Service/api';
import { isRealFeedArticle } from '../../utils/feedRealOnly';
import { useTheme } from '../../theme/ThemeContext';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import { useAuth } from '../../context/AuthContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { resetTabBarVisibility, setTabBarHidden } from '../../navigation/tabBarVisibility';

const TAB_BAR_CLEARANCE = 96;
const COMPOSER_ESTIMATE = 150;

function getKeyboardInset(e) {
  const coords = e?.endCoordinates;
  if (!coords) return 0;
  const reported = coords.height ?? 0;
  const windowHeight = Dimensions.get('window').height;
  const fromScreenY = coords.screenY != null ? windowHeight - coords.screenY : 0;
  return Math.max(reported, fromScreenY, 0);
}

function formatCaughtMessage(e) {
  if (e == null) return 'Chat failed';
  if (typeof e === 'string') return e;
  if (typeof e === 'object' && typeof e.message === 'string') return e.message;
  return 'Chat failed';
}

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const embeddedInTab = Boolean(route.params?.embeddedInTab);
  const insets = useSafeAreaInsets();
  const { user, bootstrapped } = useAuth();
  const { theme } = useTheme();
  const { confirm } = useFeedback();
  const colors = theme?.colors;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingDots, setTypingDots] = useState('.');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey! I am TRAK AI. Ask me about latest news.' },
  ]);
  const scrollRef = useRef(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [composerHeight, setComposerHeight] = useState(COMPOSER_ESTIMATE);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const scrollToLatest = React.useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const restoreKeyboardLayout = React.useCallback(() => {
    setKeyboardInset(0);
    if (embeddedInTab) setTabBarHidden(false);
  }, [embeddedInTab]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      const height = getKeyboardInset(e);
      if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      setKeyboardInset(height);
      if (embeddedInTab) setTabBarHidden(true);
      scrollToLatest();
    };
    const onHide = () => {
      if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      restoreKeyboardLayout();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
      restoreKeyboardLayout();
    };
  }, [embeddedInTab, scrollToLatest, restoreKeyboardLayout]);

  useEffect(() => {
    if (keyboardInset > 0) scrollToLatest();
  }, [keyboardInset, scrollToLatest]);

  useFocusEffect(
    React.useCallback(() => {
      resetTabBarVisibility();
      return () => resetTabBarVisibility();
    }, [])
  );

  useEffect(() => {
    if (!bootstrapped || !user) return;
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
  }, [bootstrapped, user]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

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
      const top = Array.isArray(res.articles)
        ? res.articles.find((a) => isRealFeedArticle(a)) ?? null
        : null;
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
    } catch (e) {
      setMessages((prev) => [...prev, { role: 'bot', text: formatCaughtMessage(e) }]);
    } finally {
      setLoading(false);
    }
  };

  if (!bootstrapped || !user || !colors) {
    return null;
  }

  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);
  const tabBarPad = embeddedInTab ? TAB_BAR_CLEARANCE + Math.max(insets.bottom, 8) : Math.max(insets.bottom, 12);
  const composerBottomPad = keyboardInset > 0 ? 10 : tabBarPad;
  const scrollPadBottom = composerHeight + (keyboardInset > 0 ? keyboardInset : tabBarPad);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          {!embeddedInTab ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <View style={styles.headerLeft}>
            <Sparkles size={18} color={colors.textPrimary} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>TRAK AI Assistant</Text>
          </View>
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
            <Trash2 size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View style={[styles.flex, styles.chatStage, { backgroundColor: colors.background }]}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: scrollPadBottom }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={scrollToLatest}
        >
          {messages.map((m, i) => (
            <View key={`${m.role}-${i}`} style={[styles.msgWrap, m.role === 'user' ? styles.userWrap : styles.botWrap]}>
              <Text
                style={[
                  styles.msg,
                  m.role === 'user'
                    ? { color: action.foreground, backgroundColor: action.background }
                    : { color: colors.textPrimary, backgroundColor: colors.backgroundSecondary },
                ]}
              >
                {m.text}
              </Text>
              {m.articleUrl ? (
                <TouchableOpacity
                  style={[styles.articleCard, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => Linking.openURL(m.articleUrl)}
                >
                  <View style={styles.articleCardInner}>
                    <Text style={{ color: colors.textTertiary, fontSize: 11, marginBottom: 4 }}>
                      {m.source || 'TRAK Source'}
                    </Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '700', lineHeight: 20 }}>
                      {m.articleTitle || 'Open related article'}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 6 }}>View article</Text>
                  </View>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          {loading ? (
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>TRAK AI is typing{typingDots}</Text>
          ) : null}
        </ScrollView>

        <View
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - composerHeight) > 2) setComposerHeight(h);
          }}
          style={[
            styles.composerDock,
            {
              bottom: keyboardInset,
              paddingBottom: composerBottomPad,
              backgroundColor: colors.background,
            },
          ]}
        >
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about latest news..."
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
              onSubmitEditing={() => sendMessage()}
              onFocus={scrollToLatest}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, { backgroundColor: action.background }]}
              disabled={loading}
              onPress={() => sendMessage()}
            >
              <Send size={18} color={action.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  chatStage: {
    overflow: 'hidden',
  },
  composerDock: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  iconBtn: { padding: 8 },
  messages: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 8 },
  msgWrap: { marginBottom: 12, maxWidth: '85%' },
  userWrap: { alignSelf: 'flex-end' },
  botWrap: { alignSelf: 'flex-start' },
  msg: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, fontSize: 15, lineHeight: 22 },
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, flexWrap: 'wrap' },
  quickChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 4,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  articleCard: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  articleCardInner: { paddingHorizontal: 12, paddingVertical: 10 },
});

export default ChatScreen;

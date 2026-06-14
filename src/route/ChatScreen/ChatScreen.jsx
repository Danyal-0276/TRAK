import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  StatusBar,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Bot, Send, Trash2, Sparkles } from 'lucide-react-native';
import { chatWithBot, clearChatHistory, getChatHistory } from '../../utils/Service/api';
import { isRealFeedArticle } from '../../utils/feedRealOnly';
import { useTheme } from '../../theme/ThemeContext';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import { useAuth } from '../../context/AuthContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { resetTabBarVisibility } from '../../navigation/tabBarVisibility';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import { resolveTopInset } from '../../utils/screenSafeArea';
import AccentTabHeader from '../../components/ui/AccentTabHeader';
import { CHAT_HERO_SUBTITLE, CHAT_HERO_TITLE, CHAT_PROMPTS } from './chatUiConstants';

const TAB_BAR_CLEARANCE = 100;
const ESTIMATED_HEADER_HEIGHT = 88;
const COMPOSER_DOCK_HEIGHT = 96;
const COMPOSER_TOP_GAP = 20;

function getKeyboardInset(e) {
  const coords = e?.endCoordinates;
  if (!coords) return 0;
  const reported = coords.height ?? 0;
  const windowHeight = Dimensions.get('window').height;
  const fromScreenY = coords.screenY != null ? windowHeight - coords.screenY : 0;
  return Math.max(reported, fromScreenY, 0);
}

function TypingIndicator({ colors, action }) {
  const dot0 = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dots = [dot0, dot1, dot2];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 140),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(420 - i * 140),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [dot0, dot1, dot2]);

  return (
    <View style={styles.typingRow}>
      <View style={[styles.botAvatar, { backgroundColor: action.background }]}>
        <Bot size={15} color={action.foreground} strokeWidth={2.25} />
      </View>
      <View style={[styles.typingBubble, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        {dots.map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                backgroundColor: colors.textSecondary,
                opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
                transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function BotAvatar({ colors, action, size = 30 }) {
  return (
    <View style={[styles.botAvatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: action.background }]}>
      <Bot size={size * 0.52} color={action.foreground} strokeWidth={2.25} />
    </View>
  );
}

function ChatEmptyState({ colors, action, isDark, onSelect }) {
  return (
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.heroRing,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={[styles.heroAvatar, { backgroundColor: action.background }]}>
          <Bot size={34} color={action.foreground} strokeWidth={2} />
        </View>
      </View>
      <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>{CHAT_HERO_TITLE}</Text>
      <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>{CHAT_HERO_SUBTITLE}</Text>
      <View style={styles.promptGrid}>
        {CHAT_PROMPTS.map((item) => (
          <Pressable
            key={item.prompt}
            onPress={() => onSelect(item.prompt)}
            style={({ pressed }) => [
              styles.promptCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.88 : 1,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              },
            ]}
          >
            <View style={styles.promptCardTop}>
              <Sparkles size={14} color={colors.textSecondary} strokeWidth={2} />
              <Text style={[styles.promptLabel, { color: colors.textPrimary }]}>{item.label}</Text>
            </View>
            <Text style={[styles.promptHint, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.hint}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const embeddedInTab = Boolean(route.params?.embeddedInTab);
  const insets = useSafeAreaInsets();
  const topInset = resolveTopInset(insets, 0);
  const { user, bootstrapped } = useAuth();
  const { theme } = useTheme();
  const { confirm } = useFeedback();
  const colors = theme?.colors;
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(ESTIMATED_HEADER_HEIGHT + topInset);
  const [composerHeight, setComposerHeight] = useState(COMPOSER_DOCK_HEIGHT);

  const { translateY: headerTranslateY, handleScroll, hideHeader, showHeader } = useCollapsibleHeader({
    hideOffset: measuredHeaderHeight,
    hideThreshold: 40,
    syncTabBar: embeddedInTab,
  });

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const scrollToLatest = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  const restoreKeyboardLayout = useCallback(() => {
    setKeyboardInset(0);
    showHeader();
  }, [showHeader]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardInset(getKeyboardInset(e));
      hideHeader();
      if (messages.length) scrollToLatest();
    };
    const onHide = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      restoreKeyboardLayout();
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
      restoreKeyboardLayout();
    };
  }, [hideHeader, messages.length, scrollToLatest, restoreKeyboardLayout]);

  useFocusEffect(
    useCallback(() => {
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
              articleId: m.article_id,
              source: m.source,
            }))
          );
        }
      } catch (_) {
        // empty state
      } finally {
        setHistoryLoaded(true);
      }
    };
    loadHistory();
  }, [bootstrapped, user]);

  useEffect(() => {
    if (messages.length) scrollToLatest();
  }, [messages, loading, scrollToLatest]);

  const openArticle = (articleId) => {
    if (!articleId) return;
    navigation.navigate('NewsFeed', { screen: 'ArticleDetail', params: { articleId: String(articleId) } });
  };

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
        ? res.articles.find((a) => isRealFeedArticle(a)) ?? res.articles[0] ?? null
        : res.primary_article || null;
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: res.reply || 'No response',
          articleTitle: top?.title,
          articleId: top?.id || top?.article_id,
          source: top?.source_key || top?.source,
        },
      ]);
    } catch (chatError) {
      let failureText = 'Chat failed. Please try again.';
      if (typeof chatError === 'string' && chatError.trim()) failureText = chatError;
      else if (chatError?.message?.trim()) failureText = chatError.message;
      setMessages((prev) => [...prev, { role: 'bot', text: failureText }]);
    } finally {
      setLoading(false);
    }
  };

  if (!bootstrapped || !user || !colors) return null;

  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);
  const canSend = Boolean(input.trim()) && !loading;
  const showEmptyState = historyLoaded && messages.length === 0 && !loading;
  const tabBarPad = embeddedInTab ? TAB_BAR_CLEARANCE + Math.max(insets.bottom, 12) : Math.max(insets.bottom, 12);
  const composerBottom = keyboardInset > 0 ? keyboardInset + 8 : tabBarPad;
  const scrollBottomPad = composerHeight + COMPOSER_TOP_GAP + composerBottom + 24;
  const pageBg = colors.background;
  const shadowColor = colors.shadowDark || '#000';
  const headerChrome = colors.surface;

  const clearHistory = async () => {
    const accepted = await confirm({
      title: 'Clear chat history?',
      message: 'This cannot be undone.',
      confirmText: 'Clear',
      danger: true,
    });
    if (!accepted) return;
    await clearChatHistory();
    setMessages([]);
    showHeader();
  };

  const onMessagesScroll = (event) => {
    handleScroll(event);
  };

  return (
    <View style={[styles.container, { backgroundColor: pageBg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={headerChrome}
        translucent
      />

      <View style={[styles.statusBarCover, { height: topInset, backgroundColor: headerChrome }]} />

      <Animated.View
        style={[
          styles.headerContainer,
          {
            paddingTop: topInset,
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: headerChrome,
            borderBottomColor: colors.border,
            shadowColor,
          },
        ]}
        onLayout={(e) => {
          const h = Math.max(0, Math.round(e?.nativeEvent?.layout?.height || 0));
          if (h > 0 && h !== measuredHeaderHeight) setMeasuredHeaderHeight(h);
        }}
      >
        {!embeddedInTab ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow} hitSlop={8}>
            <Text style={{ color: colors.textPrimary, fontSize: 22 }}>‹</Text>
            <Text style={{ color: colors.textPrimary, fontSize: 15, fontWeight: '600', marginLeft: 2 }}>Back</Text>
          </TouchableOpacity>
        ) : null}
        <AccentTabHeader
          title="TRAK AI"
          icon={Bot}
          subtitle={loading ? 'Thinking…' : 'News assistant'}
          rightAction={
            <TouchableOpacity onPress={clearHistory} style={styles.clearBtn} hitSlop={8}>
              <Trash2 size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          }
        />
      </Animated.View>

      <View style={[styles.flex, { backgroundColor: pageBg }]}>
        <ScrollView
          ref={scrollRef}
          style={[styles.messages, { backgroundColor: pageBg }]}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: scrollBottomPad },
            showEmptyState && styles.messagesContentEmpty,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          onScroll={onMessagesScroll}
          scrollEventThrottle={16}
        >
          <View style={{ height: measuredHeaderHeight + 8 }} />
          {showEmptyState ? (
            <ChatEmptyState colors={colors} action={action} isDark={isDark} onSelect={sendMessage} />
          ) : (
            <>
              {messages.map((m, i) => (
                <View
                  key={`${m.role}-${i}-${m.text?.slice(0, 12)}`}
                  style={[styles.msgRow, m.role === 'user' ? styles.msgRowUser : styles.msgRowBot]}
                >
                  {m.role === 'bot' ? <BotAvatar colors={colors} action={action} /> : null}
                  <View style={[styles.msgColumn, m.role === 'user' && styles.msgColumnUser]}>
                    {m.role === 'bot' ? (
                      <View style={styles.botTextBlock}>
                        <Text style={[styles.botText, { color: colors.textPrimary }]}>{m.text}</Text>
                      </View>
                    ) : (
                      <View style={[styles.userBubble, { backgroundColor: action.background }]}>
                        <Text style={[styles.userText, { color: action.foreground }]}>{m.text}</Text>
                      </View>
                    )}
                    {m.articleId || m.articleTitle ? (
                      <TouchableOpacity
                        style={[styles.articleCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
                        onPress={() => openArticle(m.articleId)}
                        activeOpacity={0.85}
                        disabled={!m.articleId}
                      >
                        <Text style={[styles.articleSource, { color: colors.textTertiary }]}>
                          {m.source || 'TRAK'} · Related story
                        </Text>
                        <Text style={[styles.articleTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                          {m.articleTitle || 'Open article'}
                        </Text>
                        {m.articleId ? (
                          <Text style={[styles.articleLink, { color: colors.textSecondary }]}>Read in TRAK →</Text>
                        ) : null}
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              ))}
              {loading ? <TypingIndicator colors={colors} action={action} /> : null}
            </>
          )}
        </ScrollView>

        {keyboardInset === 0 && embeddedInTab ? (
          <View
            pointerEvents="none"
            style={[styles.tabBarGutter, { height: tabBarPad, backgroundColor: pageBg }]}
          />
        ) : null}

        <View
          style={[
            styles.composerDock,
            {
              bottom: composerBottom,
            },
          ]}
          onLayout={(e) => {
            const h = Math.max(0, Math.round(e?.nativeEvent?.layout?.height || 0));
            if (h > 0 && Math.abs(h - composerHeight) > 2) setComposerHeight(h);
          }}
        >
          <View style={[styles.composerShell, { backgroundColor: colors.surface }]}>
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              placeholder="Ask anything about news…"
              placeholderTextColor={colors.textTertiary}
              style={[styles.input, { color: colors.textPrimary }]}
              onSubmitEditing={() => canSend && sendMessage()}
              multiline
              blurOnSubmit={false}
              maxLength={2000}
              caretColor={isDark ? colors.textPrimary : action.background}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                canSend
                  ? { backgroundColor: action.background }
                  : { backgroundColor: colors.backgroundSecondary },
              ]}
              disabled={!canSend}
              onPress={() => sendMessage()}
              activeOpacity={0.85}
            >
              <Send size={17} color={canSend ? action.foreground : colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.composerHint, { color: colors.textSecondary }]}>
            TRAK AI can make mistakes — verify important news.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  tabBarGutter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  statusBarCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1001,
    elevation: 1001,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },
  clearBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingBottom: 8 },
  messagesContentEmpty: { flexGrow: 1, paddingTop: 4 },
  emptyWrap: { alignItems: 'center', paddingHorizontal: 4, paddingTop: 8, paddingBottom: 28 },
  heroRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 18,
  },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
    paddingHorizontal: 12,
  },
  promptGrid: { width: '100%', gap: 10, marginBottom: 16 },
  promptCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  promptCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  promptLabel: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  promptHint: { fontSize: 13, lineHeight: 18, paddingLeft: 22 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18, gap: 10 },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowBot: { justifyContent: 'flex-start' },
  msgColumn: { flex: 1, maxWidth: '100%' },
  msgColumnUser: { alignItems: 'flex-end', flex: 0, maxWidth: '86%' },
  botAvatar: { alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  botTextBlock: { flex: 1, paddingTop: 4, paddingRight: 8 },
  botText: { fontSize: 15, lineHeight: 24 },
  userBubble: {
    borderRadius: 20,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: { fontSize: 15, lineHeight: 22 },
  typingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 8 },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typingDot: { width: 7, height: 7, borderRadius: 3.5 },
  composerDock: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingTop: COMPOSER_TOP_GAP,
    paddingHorizontal: 14,
    paddingBottom: 4,
    backgroundColor: 'transparent',
  },
  composerShell: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 26,
    paddingLeft: 16,
    paddingRight: 5,
    paddingVertical: 5,
    gap: 6,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    maxHeight: 120,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  composerHint: { fontSize: 11, textAlign: 'center', marginTop: 8, marginBottom: 2 },
  articleCard: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  articleSource: { fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.3 },
  articleTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  articleLink: { fontSize: 12, marginTop: 6 },
});

export default ChatScreen;

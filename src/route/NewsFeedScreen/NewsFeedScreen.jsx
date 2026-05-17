// ============================================
// NewsFeedScreen.jsx - WITH SKELETON LOADING
// ============================================
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    StatusBar,
    RefreshControl,
    Animated,
    Platform,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { FeedHeader } from './components/FeedHeader';
import { TabBar } from './components/TabBar';
import { NewsCard } from '../../components/NewsCard';
import { FeedSkeleton } from '../../components/FeedSkeleton';
import ChatBotWidget from '../../components/ChatBotWidget';
import { addBookmark, getUserFeed, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { loadUserKeywords } from '../../utils/userKeywordsStorage';
import { filterFeedByUserKeywords } from '../../utils/feedKeywordMatch';
import { useTheme } from '../../theme/ThemeContext';
import { resetTabBarVisibility, setTabBarHidden } from '../../navigation/tabBarVisibility';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { resolveArticleSource } from '../../utils/articleSource';
import { buildArticleDetailParams } from '../../utils/articleNavigation';

const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT = 60;
const TAB_HEIGHT = 50;
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + TAB_HEIGHT;

// Skeleton Card Component
const SkeletonCard = ({ colors }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View style={[skeletonStyles.container]}>
            <View style={[skeletonStyles.card, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                {/* Header */}
                <View style={skeletonStyles.header}>
                    <View style={skeletonStyles.sourceContainer}>
                        <Animated.View style={[skeletonStyles.sourceIcon, { opacity, backgroundColor: colors.border }]} />
                        <View style={skeletonStyles.sourceInfo}>
                            <Animated.View style={[skeletonStyles.sourceName, { opacity, backgroundColor: colors.border }]} />
                            <Animated.View style={[skeletonStyles.timeText, { opacity, backgroundColor: colors.borderLight }]} />
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Animated.View style={[skeletonStyles.title, { opacity, backgroundColor: colors.border }]} />
                <Animated.View style={[skeletonStyles.titleShort, { opacity, backgroundColor: colors.border }]} />

                {/* Excerpt */}
                <Animated.View style={[skeletonStyles.excerpt, { opacity, backgroundColor: colors.borderLight }]} />
                <Animated.View style={[skeletonStyles.excerpt, { opacity, backgroundColor: colors.borderLight }]} />
                <Animated.View style={[skeletonStyles.excerptShort, { opacity, backgroundColor: colors.borderLight }]} />

                {/* Meta */}
                <View style={skeletonStyles.metaRow}>
                    <Animated.View style={[skeletonStyles.badge, { opacity, backgroundColor: colors.border }]} />
                    <Animated.View style={[skeletonStyles.badge, { opacity, backgroundColor: colors.border }]} />
                </View>

                {/* Actions */}
                <View style={[skeletonStyles.actionsContainer, { borderTopColor: colors.borderLight }]}>
                    <View style={skeletonStyles.actionsLeft}>
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                        <Animated.View style={[skeletonStyles.voteCount, { opacity, backgroundColor: colors.border }]} />
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                    </View>
                    <View style={skeletonStyles.actionsRight}>
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                        <Animated.View style={[skeletonStyles.actionCircle, { opacity, backgroundColor: colors.border }]} />
                    </View>
                </View>
            </View>
        </View>
    );
};

const NewsFeedScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [activeTab, setActiveTab] = useState('For you');
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [feedKeywords, setFeedKeywords] = useState([]);
    const [skipEntryAnim, setSkipEntryAnim] = useState(false);
    const tabMounted = useRef(false);

    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (!tabMounted.current) {
            tabMounted.current = true;
            return;
        }
        setSkipEntryAnim(true);
    }, [activeTab]);

    // Animation refs
    const scrollY = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const headerTranslateY = useRef(new Animated.Value(0)).current;

    const loadNews = async () => {
        try {
            setLoading(true);
            const kws = await loadUserKeywords();
            const keywords = Array.isArray(kws) ? kws : [];
            setFeedKeywords(keywords);
            if (!keywords.length) {
                setNewsData([]);
                return;
            }

            const cachedReactions = await getReactionMap().catch(() => ({}));
            const [response, reactionsRes] = await Promise.all([
                getUserFeed(),
                listReactions().catch(() => ({ results: [] })),
            ]);
            const reactionMap = await mergeReactionRows(reactionsRes.results || [], { replace: false }).catch(() => cachedReactions);
            const mapped = (response.results || []).map((item, idx) => {
                const aid = item.id || item.canonical_url || String(idx);
                const likes = Number(item.like_count ?? item.upvotes ?? 0);
                const dislikes = Number(item.dislike_count ?? 0);
                return {
                    ...item,
                    id: aid,
                    source: resolveArticleSource(item),
                    time: item.published_at
                        ? new Date(item.published_at).toLocaleString()
                        : 'Recently',
                    title: item.title || 'Untitled',
                    excerpt: item.excerpt || item.summary || '',
                    summary: item.summary || item.excerpt || '',
                    content: item.content || item.full_content || '',
                    fullContent: item.full_content || item.content || '',
                    category: item.topic_keywords?.[0] || 'General',
                    verified: item.credibility?.label === 'real',
                    trending: Boolean(item.topic_keywords?.length),
                    like_count: likes,
                    dislike_count: dislikes,
                    upvotes: likes,
                    readTime: 4,
                    userReaction: reactionMap[String(aid)] || null,
                };
            });
            setNewsData(mapped);
            setVotedItems(reactionMap);
        } catch (error) {
            console.error('Error loading news:', error);
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const lastSyncRef = useRef(0);
    const voteTimerRef = useRef({});

    const syncInteractionsFromServer = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && now - lastSyncRef.current < 45000) return;
        lastSyncRef.current = now;

        const [bmRes, reactRes] = await Promise.all([
            listBookmarks().catch(() => ({ results: [] })),
            listReactions().catch(() => ({ results: [] })),
        ]);
        const ids = (bmRes.results || []).map((b) => String(b.article_id));
        setBookmarkedItems(new Set(ids));
        await setBookmarkIds(ids).catch(() => {});

        const reactionMap = await mergeReactionRows(reactRes.results || [], { replace: false }).catch(() => ({}));
        setVotedItems(reactionMap);
        setNewsData((prev) =>
            prev.map((n) => ({
                ...n,
                userReaction: reactionMap[String(n.id)] || null,
            }))
        );
    }, []);

    useFocusEffect(
        useCallback(() => {
            syncInteractionsFromServer(false);
            loadNews();
        }, [syncInteractionsFromServer])
    );

    useEffect(() => {
        if (!feedKeywords.length) {
            setNewsData([]);
        }
    }, [feedKeywords]);

    useEffect(() => {
        resetTabBarVisibility();
        return () => resetTabBarVisibility();
    }, []);

    useEffect(() => {
        (async () => {
            const cached = await getBookmarkIds().catch(() => []);
            if (cached.length) {
                setBookmarkedItems(new Set(cached.map(String)));
            }
            const res = await listBookmarks().catch(() => ({ results: [] }));
            const ids = (res.results || []).map((b) => String(b.article_id));
            setBookmarkedItems(new Set(ids));
            await setBookmarkIds(ids).catch(() => {});
        })();
    }, []);


    const handleRefresh = async () => {
        setRefreshing(true);
        setTabBarHidden(false);
        // Show header on refresh
        Animated.spring(headerTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
        }).start();
        await loadNews();
        await syncInteractionsFromServer(true);
        setRefreshing(false);
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: false,
            listener: (event) => {
                const currentScrollY = event.nativeEvent.contentOffset.y;
                const diff = currentScrollY - lastScrollY.current;

                // Only trigger animation if scroll change is significant
                if (Math.abs(diff) > 5) {
                    if (diff > 0 && currentScrollY > 50) {
                        setTabBarHidden(true);
                        // Scrolling down - hide header behind status bar
                        Animated.spring(headerTranslateY, {
                            toValue: -TOTAL_HEADER_HEIGHT,
                            useNativeDriver: true,
                            friction: 8,
                            tension: 40,
                        }).start();
                    } else if (diff < 0) {
                        setTabBarHidden(false);
                        // Scrolling up - show header
                        Animated.spring(headerTranslateY, {
                            toValue: 0,
                            useNativeDriver: true,
                            friction: 8,
                            tension: 40,
                        }).start();
                    }
                }

                lastScrollY.current = currentScrollY;
            },
        }
    );

    const handleArticlePress = (article) => {
        navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        let newVote = null;
        let previousVote = null;

        setVotedItems((prev) => {
            previousVote = prev[id] ?? null;
            newVote = previousVote === type ? null : type;
            return { ...prev, [id]: newVote };
        });

        setNewsData((prev) =>
            prev.map((n) => {
                if (String(n.id) !== id) return n;
                let likes = Number(n.like_count ?? n.upvotes ?? 0);
                let dislikes = Number(n.dislike_count ?? 0);
                if (previousVote === 'up') likes -= 1;
                if (previousVote === 'down') dislikes -= 1;
                if (newVote === 'up') likes += 1;
                if (newVote === 'down') dislikes += 1;
                return {
                    ...n,
                    like_count: Math.max(0, likes),
                    dislike_count: Math.max(0, dislikes),
                    upvotes: Math.max(0, likes),
                    userReaction: newVote,
                };
            })
        );
        setReactionForArticle(id, newVote).catch(() => {});

        if (voteTimerRef.current[id]) clearTimeout(voteTimerRef.current[id]);
        voteTimerRef.current[id] = setTimeout(async () => {
            delete voteTimerRef.current[id];
            try {
                const data = await setReaction(
                    id,
                    newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none'
                );
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setNewsData((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : {
                                  ...n,
                                  like_count: likes,
                                  dislike_count: dislikes,
                                  upvotes: likes,
                                  userReaction: newVote,
                              }
                    )
                );
            } catch {
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null).catch(() => {});
            }
        }, 280);
    };

    const handleBookmark = async (itemId) => {
        const id = String(itemId);
        const wasBookmarked = bookmarkedItems.has(id);
        setBookmarkedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setBookmarkIds(Array.from(next)).catch(() => {});
            return next;
        });

        try {
            const article = newsData.find((n) => String(n.id) === id);
            if (wasBookmarked) {
                await removeBookmark(id);
            } else {
                await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
            setBookmarkedItems(prev => {
                const rollback = new Set(prev);
                if (rollback.has(id)) rollback.delete(id);
                else rollback.add(id);
                setBookmarkIds(Array.from(rollback)).catch(() => {});
                return rollback;
            });
        }
    };

    const hasFeedPersonalization = feedKeywords.length > 0;

    const filteredNews = useMemo(() => {
        if (activeTab === 'For you' && !hasFeedPersonalization) {
            return [];
        }
        if (activeTab === 'Bookmarks') {
            return newsData.filter((n) => bookmarkedItems.has(String(n.id)) || bookmarkedItems.has(n.id));
        }
        if (activeTab === 'Trending') {
            return [...newsData].sort((a, b) => {
                const ak = (a.topic_keywords?.length || 0) + (a.trending ? 2 : 0);
                const bk = (b.topic_keywords?.length || 0) + (b.trending ? 2 : 0);
                return bk - ak;
            });
        }
        if (activeTab === 'For you') {
            return filterFeedByUserKeywords(newsData, feedKeywords);
        }
        return newsData;
    }, [newsData, activeTab, hasFeedPersonalization, bookmarkedItems, feedKeywords]);

    return (
        <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor="transparent" 
                translucent 
            />
            
            {/* Enhanced gradient background */}
            <LinearGradient
                colors={theme.mode === 'dark' 
                    ? ['#0F172A', '#1E293B', '#334155', '#1E293B', '#0F172A']
                    : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
            <View 
                style={[
                    styles.statusBarCover,
                    { 
                        height: insets.top,
                        backgroundColor: colors.background 
                    }
                ]}
            />

            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <Animated.View
                    style={[
                        styles.headerContainer,
                        { 
                            paddingTop: insets.top,
                            transform: [{ translateY: headerTranslateY }],
                            backgroundColor: colors.surface,
                            shadowColor: colors.shadowDark || '#000',
                        },
                    ]}
                >
                    <FeedHeader navigation={navigation} />
                    <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </Animated.View>

                <Animated.ScrollView
                    style={[styles.feed, { backgroundColor: 'transparent' }]}
                    contentContainerStyle={[styles.feedContent, { backgroundColor: 'transparent', paddingTop: 8 }]}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                            progressViewOffset={TOTAL_HEADER_HEIGHT + insets.top}
                        />
                    }
                >
                    <View style={{ height: TOTAL_HEADER_HEIGHT + insets.top + 8 }} />

                    {loading ? (
                        <FeedSkeleton colors={colors} count={5} />
                    ) : filteredNews.length === 0 ? (
                        <View style={{ paddingHorizontal: 24, paddingTop: 24, alignItems: 'center' }}>
                            {activeTab === 'For you' && !hasFeedPersonalization ? (
                                <>
                                    <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                                        Choose your interests
                                    </Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
                                        Select news categories to see a personalized For You feed.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('TagSelection', { fromSettings: true })}
                                        style={{ backgroundColor: colors.primary, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 }}
                                        activeOpacity={0.85}
                                    >
                                        <Text style={{ color: colors.surface, fontWeight: '700', fontSize: 15 }}>Pick categories</Text>
                                    </TouchableOpacity>
                                </>
                            ) : activeTab === 'For you' && hasFeedPersonalization ? (
                                <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 22 }}>
                                    No articles match your interests yet. Try adding more categories or keywords, then pull to refresh.
                                </Text>
                            ) : (
                                <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                                    {activeTab === 'Bookmarks' ? 'No bookmarked articles yet.' : 'No articles to show.'}
                                </Text>
                            )}
                        </View>
                    ) : (
                        filteredNews.map((item, index) => (
                            <NewsCard
                                key={`${activeTab}-${item.id}`}
                                item={item}
                                onPress={() => handleArticlePress(item)}
                                votedItems={votedItems}
                                bookmarkedItems={bookmarkedItems}
                                onVote={handleVote}
                                onBookmark={handleBookmark}
                                index={index}
                                animateEntry={!skipEntryAnim && index < 6}
                            />
                        ))
                    )}
                    <View style={styles.endPadding} />
                </Animated.ScrollView>
            </View>
            <ChatBotWidget />
        </View>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    statusBarCover: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        elevation: 1000,
    },
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        ...Platform.select({
            ios: {
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
            android: {
                elevation: 6,
            },
        }),
    },
    feed: {
        flex: 1,
    },
    feedContent: {},
    endPadding: {
        height: 30,
    },
});

const skeletonStyles = StyleSheet.create({
    container: {
        marginBottom: 1,
    },
    card: {
        padding: 16,
        borderBottomWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    sourceIcon: {
        width: 42,
        height: 42,
        borderRadius: 4,
        marginRight: 12,
    },
    sourceInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    sourceName: {
        width: 120,
        height: 14,
        borderRadius: 4,
        marginBottom: 6,
    },
    timeText: {
        width: 80,
        height: 12,
        borderRadius: 4,
    },
    title: {
        width: '100%',
        height: 16,
        borderRadius: 4,
        marginBottom: 8,
    },
    titleShort: {
        width: '70%',
        height: 16,
        borderRadius: 4,
        marginBottom: 12,
    },
    excerpt: {
        width: '100%',
        height: 12,
        borderRadius: 4,
        marginBottom: 6,
    },
    excerptShort: {
        width: '85%',
        height: 12,
        borderRadius: 4,
        marginBottom: 14,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 8,
    },
    badge: {
        width: 70,
        height: 24,
        borderRadius: 4,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 14,
        borderTopWidth: 1,
    },
    actionsLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionsRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    actionCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    voteCount: {
        width: 32,
        height: 16,
        borderRadius: 4,
    },
});

export default NewsFeedScreen;
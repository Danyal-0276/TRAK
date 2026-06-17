// ============================================
// NewsFeedScreen.jsx - WITH SKELETON LOADING
// ============================================
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    RefreshControl,
    Animated,
    Platform,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { FeedHeader } from './components/FeedHeader';
import { TabBar } from './components/TabBar';
import ArticleFeedList from '../../components/ArticleFeedList';
import { FeedSkeleton } from '../../components/FeedSkeleton';
import { addBookmark, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { loadHomeBootstrap } from '../../utils/loadHomeBootstrap';
import { loadExplorePage, loadFeedPage, mergeUniqueById } from '../../utils/loadFeed';
import { useTheme } from '../../theme/ThemeContext';
import { getRefreshControlProps } from '../../theme/refreshControl';
import { useFilledActionColors } from '../../theme/buttonContrast';
import { useFeedback } from '../../components/ui/FeedbackProvider';
import { resetTabBarVisibility } from '../../navigation/tabBarVisibility';
import { useCollapsibleHeader } from '../../hooks/useCollapsibleHeader';
import { resolveTopInset } from '../../utils/screenSafeArea';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { resolveArticleSource } from '../../utils/articleSource';
import { buildArticleDetailParams } from '../../utils/articleNavigation';
import {
    getHomeFeedCache,
    isFeedCacheFresh,
    saveHomeFeedCache,
} from '../../utils/feedSessionCache';

const { width, height } = Dimensions.get('window');
const PAGER_LAYOUT = { width };

const HEADER_HEIGHT = 60;
const TAB_HEIGHT = 50;
const TOTAL_HEADER_HEIGHT = HEADER_HEIGHT + TAB_HEIGHT;

const FEED_TAB_ROUTES = [
    { key: 'For you', title: 'For you' },
    { key: 'Bookmarks', title: 'Bookmarks' },
    { key: 'Trending', title: 'Trending' },
];

function filterNewsForTab(tabKey, newsData, bookmarkedItems) {
    if (tabKey === 'Bookmarks') {
        return newsData.filter((n) => bookmarkedItems.has(String(n.id)) || bookmarkedItems.has(n.id));
    }
    if (tabKey === 'Trending') {
        return [...newsData].sort((a, b) => {
            const ak = (a.topic_keywords?.length || 0) + (a.trending ? 2 : 0);
            const bk = (b.topic_keywords?.length || 0) + (b.trending ? 2 : 0);
            return bk - ak;
        });
    }
    return newsData;
}

/** FlatList uses scrollToOffset; ScrollView uses scrollTo. */
function restoreScrollPosition(ref, scrollY) {
    if (!ref || scrollY == null || scrollY <= 0) return;
    if (typeof ref.scrollToOffset === 'function') {
        ref.scrollToOffset({ offset: scrollY, animated: false });
    } else if (typeof ref.scrollTo === 'function') {
        ref.scrollTo({ y: scrollY, animated: false });
    }
}

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
    const feedback = useFeedback();
    const actionColors = useFilledActionColors();
    const cachedHome = getHomeFeedCache();
    const hasCachedHome = isFeedCacheFresh(cachedHome) && Array.isArray(cachedHome?.newsData) && cachedHome.newsData.length > 0;

    const initialFeedTab = cachedHome?.activeTab || 'For you';
    const [tabIndex, setTabIndex] = useState(() => {
        const i = FEED_TAB_ROUTES.findIndex((r) => r.key === initialFeedTab);
        return i >= 0 ? i : 0;
    });
    const activeTab = FEED_TAB_ROUTES[tabIndex]?.key ?? 'For you';
    const setActiveTab = useCallback((tab) => {
        const i = FEED_TAB_ROUTES.findIndex((r) => r.key === tab);
        if (i >= 0) setTabIndex(i);
    }, []);
    const [bookmarkedItems, setBookmarkedItems] = useState(
        () => new Set((hasCachedHome ? cachedHome.bookmarkIds : []).map(String))
    );
    const [votedItems, setVotedItems] = useState(() => (hasCachedHome ? cachedHome.votedItems || {} : {}));
    const [newsData, setNewsData] = useState(() => (hasCachedHome ? cachedHome.newsData : []));
    const [nextCursor, setNextCursor] = useState(() => (hasCachedHome ? cachedHome.nextCursor || '' : ''));
    const [hasMore, setHasMore] = useState(() => (hasCachedHome ? Boolean(cachedHome.hasMore) : false));
    const [loadingMore, setLoadingMore] = useState(false);
    const [loading, setLoading] = useState(!hasCachedHome);
    const [refreshing, setRefreshing] = useState(false);
    const [feedKeywords, setFeedKeywords] = useState(() => (hasCachedHome ? cachedHome.feedKeywords || [] : []));
    const [skipEntryAnim, setSkipEntryAnim] = useState(false);
    const tabMounted = useRef(false);

    const insets = useSafeAreaInsets();
    const topInset = resolveTopInset(insets, 0);
    const [measuredHeaderHeight, setMeasuredHeaderHeight] = useState(
        TOTAL_HEADER_HEIGHT + topInset
    );

    useEffect(() => {
        if (!tabMounted.current) {
            tabMounted.current = true;
            return;
        }
        setSkipEntryAnim(true);
    }, [activeTab]);

    const { translateY: headerTranslateY, handleScroll, showHeader } = useCollapsibleHeader({
        hideOffset: measuredHeaderHeight,
        hideThreshold: 50,
    });

    const topChromeColor = colors.surface;

    const feedModeRef = useRef(hasCachedHome ? cachedHome.feedMode || 'explore' : 'explore');
    const initialLoadRef = useRef(hasCachedHome);
    const scrollRefs = useRef({});
    const scrollYByTab = useRef(
        hasCachedHome && cachedHome.scrollY
            ? { [initialFeedTab]: cachedHome.scrollY }
            : {}
    );

    const mapBootstrapItems = (items, reactionMap) =>
        (items || []).map((item, idx) => {
            const aid = item.id || item.canonical_url || String(idx);
            const likes = Number(item.like_count ?? item.upvotes ?? 0);
            const dislikes = Number(item.dislike_count ?? 0);
            return {
                ...item,
                id: aid,
                source: resolveArticleSource(item),
                time: item.published_at
                    ? new Date(item.published_at).toLocaleString()
                    : item.time || 'Recently',
                title: item.title || 'Untitled',
                excerpt: item.excerpt || item.summary || '',
                summary: item.summary || item.excerpt || '',
                content: item.content || item.full_content || '',
                fullContent: item.full_content || item.content || '',
                category: item.topic_keywords?.[0] || item.category || 'General',
                verified: item.credibility?.label === 'real',
                trending: Boolean(item.topic_keywords?.length),
                like_count: likes,
                dislike_count: dislikes,
                upvotes: likes,
                readTime: 4,
                userReaction: reactionMap[String(aid)] || null,
            };
        });

    const loadNews = useCallback(async ({ silent = false, force = false } = {}) => {
        const cached = getHomeFeedCache();
        if (!force && isFeedCacheFresh(cached) && Array.isArray(cached?.newsData) && cached.newsData.length) {
            feedModeRef.current = cached.feedMode || 'explore';
            setFeedKeywords(cached.feedKeywords || []);
            setNewsData(cached.newsData);
            setNextCursor(cached.nextCursor || '');
            setHasMore(Boolean(cached.hasMore));
            setVotedItems(cached.votedItems || {});
            setBookmarkedItems(new Set((cached.bookmarkIds || []).map(String)));
            const tabKey = cached.activeTab || 'For you';
            requestAnimationFrame(() => {
                restoreScrollPosition(scrollRefs.current[tabKey], cached.scrollY);
            });
            if (!silent) setLoading(false);
            return;
        }

        try {
            if (!silent) setLoading(true);
            const boot = await loadHomeBootstrap({ limit: 50 });
            feedModeRef.current = boot.feedMode;
            const keywords = boot.keywords || [];
            setFeedKeywords(keywords);

            if (!keywords.length && !boot.items.length) {
                setNewsData([]);
                setNextCursor('');
                setHasMore(false);
                setVotedItems(boot.reactionMap || {});
                setBookmarkedItems(boot.bookmarked || new Set());
                await setBookmarkIds(Array.from(boot.bookmarked || [])).catch(() => {});
                return;
            }

            const mapped = mapBootstrapItems(boot.items, boot.reactionMap || {});
            setNewsData(mapped);
            setNextCursor(boot.nextCursor || '');
            setHasMore(Boolean(boot.hasMore));
            setVotedItems(boot.reactionMap || {});
            setBookmarkedItems(boot.bookmarked || new Set());
            await setBookmarkIds(Array.from(boot.bookmarked || [])).catch(() => {});

            saveHomeFeedCache({
                newsData: mapped,
                votedItems: boot.reactionMap || {},
                bookmarkIds: Array.from(boot.bookmarked || []),
                feedKeywords: keywords,
                feedMode: boot.feedMode,
                nextCursor: boot.nextCursor || '',
                hasMore: Boolean(boot.hasMore),
                activeTab,
                scrollY: scrollYByTab.current[activeTab] || 0,
            });
        } catch (error) {
            console.error('Error loading news:', error);
            setNewsData([]);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [activeTab]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor || activeTab !== 'For you') return;
        setLoadingMore(true);
        try {
            const page =
                feedModeRef.current === 'feed'
                    ? await loadFeedPage({ limit: 50, cursor: nextCursor })
                    : await loadExplorePage({ limit: 50, cursor: nextCursor });
            const reactionMap = { ...getReactionMap(), ...votedItems };
            setNewsData((prev) =>
                mapBootstrapItems(mergeUniqueById(prev, page.items), reactionMap)
            );
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (error) {
            console.warn('Load more failed:', error?.message || error);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor, activeTab, votedItems]);

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
        const idSet = new Set(ids);
        setNewsData((prev) =>
            prev.map((n) => {
                const nid = String(n.id);
                const userReaction = reactionMap[nid] || null;
                const isBookmarked = idSet.has(nid);
                if (n.userReaction === userReaction && !!n.isBookmarked === isBookmarked) return n;
                return { ...n, userReaction, isBookmarked };
            })
        );
    }, []);

    const lastFeedLoadRef = useRef(hasCachedHome ? Date.now() : 0);
    const FEED_STALE_MS = 10 * 60 * 1000;

    useFocusEffect(
        useCallback(() => {
            syncInteractionsFromServer(false);
            const cached = getHomeFeedCache();
            if (isFeedCacheFresh(cached) && Array.isArray(cached?.newsData) && cached.newsData.length) {
                setNewsData(cached.newsData);
                setNextCursor(cached.nextCursor || '');
                setHasMore(Boolean(cached.hasMore));
                setVotedItems(cached.votedItems || {});
                setBookmarkedItems(new Set((cached.bookmarkIds || []).map(String)));
                setFeedKeywords(cached.feedKeywords || []);
                feedModeRef.current = cached.feedMode || 'explore';
                setLoading(false);
                const tabKey = cached.activeTab || 'For you';
                if (cached.scrollY) {
                    requestAnimationFrame(() => {
                        restoreScrollPosition(scrollRefs.current[tabKey], cached.scrollY);
                    });
                }
                return;
            }

            const now = Date.now();
            if (!initialLoadRef.current) {
                initialLoadRef.current = true;
                lastFeedLoadRef.current = now;
                loadNews();
                return;
            }
            if (now - lastFeedLoadRef.current > FEED_STALE_MS) {
                lastFeedLoadRef.current = now;
                loadNews({ silent: true, force: true });
            }
        }, [syncInteractionsFromServer, loadNews])
    );

    const cacheSaveTimerRef = useRef(null);
    useEffect(() => {
        if (!newsData.length) return;
        if (cacheSaveTimerRef.current) clearTimeout(cacheSaveTimerRef.current);
        cacheSaveTimerRef.current = setTimeout(() => {
            saveHomeFeedCache({
                newsData,
                votedItems,
                bookmarkIds: Array.from(bookmarkedItems),
                feedKeywords,
                feedMode: feedModeRef.current,
                nextCursor,
                hasMore,
                activeTab,
                scrollY: scrollYByTab.current[activeTab] || 0,
            });
        }, 450);
        return () => {
            if (cacheSaveTimerRef.current) clearTimeout(cacheSaveTimerRef.current);
        };
    }, [newsData, votedItems, bookmarkedItems, feedKeywords, activeTab, nextCursor, hasMore]);

    useEffect(() => {
        resetTabBarVisibility();
        return () => resetTabBarVisibility();
    }, []);

    useEffect(() => {
        if (!hasCachedHome || !cachedHome?.scrollY) return;
        const tabKey = cachedHome.activeTab || 'For you';
        const timer = setTimeout(() => {
            restoreScrollPosition(scrollRefs.current[tabKey], cachedHome.scrollY);
        }, 0);
        return () => clearTimeout(timer);
    }, [hasCachedHome, cachedHome]);

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
        showHeader();
        lastFeedLoadRef.current = Date.now();
        await loadNews({ silent: true, force: true });
        await syncInteractionsFromServer(true);
        setRefreshing(false);
    };

    const handleArticlePress = (article) => {
        navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId || '').trim();
        if (!id) return;
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
                const isBm =
                    bookmarkedItems.has(id) ||
                    bookmarkedItems.has(n.id) ||
                    (n.canonical_url && bookmarkedItems.has(n.canonical_url));
                return {
                    ...n,
                    like_count: Math.max(0, likes),
                    dislike_count: Math.max(0, dislikes),
                    upvotes: Math.max(0, likes),
                    userReaction: newVote,
                    isBookmarked: isBm,
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
            } catch (err) {
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null).catch(() => {});
                feedback?.error?.(err?.message || 'Could not save reaction');
            }
        }, 0);
    };

    const handleBookmark = async (itemId) => {
        const id = String(itemId || '').trim();
        if (!id) return;
        const wasBookmarked = bookmarkedItems.has(id);
        setBookmarkedItems(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setBookmarkIds(Array.from(next)).catch(() => {});
            return next;
        });
        setNewsData((prev) =>
            prev.map((n) => {
                if (String(n.id) !== id) return n;
                const nextBm = !n.isBookmarked;
                return { ...n, isBookmarked: nextBm };
            })
        );

        try {
            const article = newsData.find((n) => String(n.id) === id);
            if (wasBookmarked) {
                await removeBookmark(id);
            } else {
                await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
            feedback?.error?.(error?.message || 'Could not update bookmark');
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

    const newsByTab = useMemo(() => {
        const out = {};
        FEED_TAB_ROUTES.forEach((route) => {
            out[route.key] = filterNewsForTab(route.key, newsData, bookmarkedItems);
        });
        return out;
    }, [newsData, bookmarkedItems]);

    const renderFeedScene = useCallback(
        ({ route }) => {
            const tabKey = route.key;
            const tabNews = newsByTab[tabKey] || [];
            const onFeedScroll = (event) => {
                scrollYByTab.current[tabKey] = event.nativeEvent.contentOffset.y;
                if (tabKey === activeTab) {
                    handleScroll(event);
                }
            };

            const listHeader = (
                <View style={{ height: measuredHeaderHeight + 8 }} />
            );

            const listEmpty = loading ? (
                <FeedSkeleton colors={colors} count={5} />
            ) : (
                <View style={{ paddingHorizontal: 24, paddingTop: 24, alignItems: 'center' }}>
                    {tabKey === 'For you' && !hasFeedPersonalization ? (
                        <>
                            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                                Choose your interests
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
                                Select news categories to see a personalized For You feed.
                            </Text>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('TagSelection', { fromSettings: true })}
                                style={{ backgroundColor: actionColors.background, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 }}
                                activeOpacity={0.85}
                            >
                                <Text style={{ color: actionColors.foreground, fontWeight: '700', fontSize: 15 }}>Pick categories</Text>
                            </TouchableOpacity>
                        </>
                    ) : tabKey === 'For you' && hasFeedPersonalization ? (
                        <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center', lineHeight: 22 }}>
                            No articles match your interests yet. Try adding more categories or keywords, then pull to refresh.
                        </Text>
                    ) : (
                        <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
                            {tabKey === 'Bookmarks' ? 'No bookmarked articles yet.' : 'No articles to show.'}
                        </Text>
                    )}
                </View>
            );

            return (
                <View style={styles.feedScene}>
                <ArticleFeedList
                    animated
                    listRef={(r) => {
                        scrollRefs.current[tabKey] = r;
                    }}
                    keyPrefix={tabKey}
                    style={[styles.feed, { backgroundColor: 'transparent' }]}
                    contentContainerStyle={[styles.feedContent, { backgroundColor: 'transparent', paddingTop: 8 }]}
                    data={loading || tabNews.length === 0 ? [] : tabNews}
                    onArticlePress={handleArticlePress}
                    onVote={handleVote}
                    onBookmark={handleBookmark}
                    ListHeaderComponent={listHeader}
                    ListEmptyComponent={listEmpty}
                    ListFooterComponent={
                        loadingMore ? (
                            <Text style={{ textAlign: 'center', color: colors.textSecondary, padding: 16 }}>
                                Loading more…
                            </Text>
                        ) : (
                            <View style={styles.endPadding} />
                        )
                    }
                    onEndReached={tabKey === 'For you' ? loadMore : undefined}
                    onEndReachedThreshold={0.4}
                    onScroll={onFeedScroll}
                    scrollEventThrottle={16}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            {...getRefreshControlProps(colors, theme.mode, {
                                progressViewOffset: measuredHeaderHeight,
                            })}
                        />
                    }
                />
                </View>
            );
        },
        [
            activeTab,
            actionColors,
            colors,
            handleArticlePress,
            handleBookmark,
            handleRefresh,
            handleScroll,
            handleVote,
            hasFeedPersonalization,
            topInset,
            measuredHeaderHeight,
            loading,
            loadingMore,
            loadMore,
            navigation,
            newsByTab,
            refreshing,
        ]
    );

    return (
        <View style={[styles.outerContainer, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={topChromeColor}
                translucent
            />
            
            {/* Enhanced gradient background */}
            <LinearGradient
                colors={theme.mode === 'dark' 
                    ? [colors.background, colors.backgroundSecondary, colors.background]
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
                        height: topInset,
                        backgroundColor: topChromeColor,
                    },
                ]}
            />

            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <Animated.View
                    style={[
                        styles.headerContainer,
                        { 
                            paddingTop: topInset,
                            transform: [{ translateY: headerTranslateY }],
                            backgroundColor: topChromeColor,
                            shadowColor: colors.shadowDark || '#000',
                        },
                    ]}
                    onLayout={(e) => {
                        const h = Math.max(0, Math.round(e?.nativeEvent?.layout?.height || 0));
                        if (h > 0 && h !== measuredHeaderHeight) setMeasuredHeaderHeight(h);
                    }}
                >
                    <FeedHeader navigation={navigation} />
                    <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
                </Animated.View>

                <TabView
                    navigationState={{ index: tabIndex, routes: FEED_TAB_ROUTES }}
                    renderScene={renderFeedScene}
                    onIndexChange={setTabIndex}
                    initialLayout={PAGER_LAYOUT}
                    renderTabBar={() => null}
                    swipeEnabled
                    animationEnabled
                    lazy
                    lazyPreloadDistance={0}
                    sceneContainerStyle={styles.feedSceneContainer}
                    style={styles.feedPager}
                />
            </View>
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
    feedPager: {
        flex: 1,
    },
    feedSceneContainer: {
        flex: 1,
    },
    feedScene: {
        flex: 1,
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
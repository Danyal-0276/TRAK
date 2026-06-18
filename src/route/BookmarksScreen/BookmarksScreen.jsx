import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveTopInset } from '../../utils/screenSafeArea';
import { ChevronLeft } from 'lucide-react-native';
import ArticleFeedList from '../../components/ArticleFeedList';
import { useTheme } from '../../theme/ThemeContext';
import { getRefreshControlProps } from '../../theme/refreshControl';
import { getUserArticleDetail, listBookmarks, setReaction } from '../../utils/Service/api';
import Text from '../../components/ui/Text';
import { navigateToArticleDetail } from '../../utils/articleNavigation';
import { mapApiItem } from '../../utils/loadFeed';
import { filterRealFeedItems } from '../../utils/feedRealOnly';
import { patchArticleVoteRow } from '../../utils/reactionVote';
import {
    subscribeArticleInteractionChange,
    applyArticleInteractionPatch,
    applyBookmarkListPatch,
} from '../../utils/articleInteractionEvents';
import {
    toggleVoteRegistered,
    scheduleVotePersist,
    setRegisteredVote,
} from '../../utils/articleVoteController';
import {
    applyOptimisticBookmarkToggle,
    queueBookmarkApi,
    rollbackBookmarkToggle,
} from '../../utils/articleBookmarkController';

const BookmarksScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const topInset = resolveTopInset(insets, 0);
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNews = useCallback(async () => {
        try {
            const response = await listBookmarks();
            const rows = response.results || [];
            const detailed = await Promise.all(
                rows.map(async (r) => {
                    try {
                        const full = await getUserArticleDetail(r.article_id);
                        const mapped = mapApiItem(full);
                        return {
                            ...mapped,
                            id: mapped.id || r.article_id || r.id,
                            time: mapped.time || (r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently'),
                            category: mapped.category || 'Saved',
                        };
                    } catch {
                        return {
                            id: r.article_id || r.id,
                            title: r.title || 'Saved article',
                            source: 'TRAK',
                            excerpt: '',
                            description: '',
                            content: '',
                            canonical_url: r.url || '',
                            category: 'Saved',
                            time: r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently',
                            upvotes: 0,
                            votes: 0,
                        };
                    }
                })
            );
            const idSet = new Set((detailed || []).map((item) => String(item.id)));
            setBookmarkedItems(idSet);
            setNewsData(
                filterRealFeedItems(detailed || [])
                    .map((n) => ({ ...n, isBookmarked: true }))
            );
        } catch (e) {
            console.warn(e);
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    useEffect(() => {
        return subscribeArticleInteractionChange((patch) => {
            applyArticleInteractionPatch(patch, {
                setVotedItems,
                setBookmarkedItems,
                onArticlesPatch: setNewsData,
            });
            applyBookmarkListPatch(patch, {
                setBookmarkedItems,
                removeFromNewsData: (id) => {
                    setNewsData((prev) => prev.filter((n) => String(n.id) !== String(id)));
                },
            });
            if (patch.isBookmarked && patch.article) {
                setNewsData((prev) => {
                    const id = String(patch.articleId);
                    if (prev.some((n) => String(n.id) === id)) return prev;
                    return filterRealFeedItems([patch.article, ...prev]).map((n) => ({
                        ...n,
                        isBookmarked: true,
                    }));
                });
            }
            if (patch.userReaction !== undefined) {
                setRegisteredVote(patch.articleId, patch.userReaction);
            }
        });
    }, []);

    const handleArticlePress = (article) => {
        navigateToArticleDetail(navigation, article, { returnTab: 'Profile' });
    };

    const handleVote = (itemId, type) => {
        const id = String(itemId);
        const { previousVote, newVote } = toggleVoteRegistered(id, type);
        const articleRow = newsData.find((n) => String(n.id) === id) || {};
        const optimistic = patchArticleVoteRow(articleRow, previousVote, newVote);

        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) !== id ? n : optimistic))
        );

        scheduleVotePersist(id, {
            persist: (articleId, apiValue) => setReaction(articleId, apiValue),
            onReconcile: (data, vote) => {
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setNewsData((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: vote }
                    )
                );
            },
            onRollback: () => {
                setRegisteredVote(id, previousVote);
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setNewsData((prev) =>
                    prev.map((n) => (String(n.id) !== id ? n : patchArticleVoteRow(optimistic, newVote, previousVote)))
                );
            },
        });
    };

    const handleBookmark = (itemId) => {
        const id = String(itemId);
        const article = newsData.find((n) => String(n.id) === id);
        const { wasBookmarked } = applyOptimisticBookmarkToggle({
            articleId: id,
            article,
            setBookmarkedItems,
            setNewsData,
            removeFromListOnUnbookmark: true,
        });

        queueBookmarkApi(id, wasBookmarked ? 'remove' : 'add', article).catch(() => {
            rollbackBookmarkToggle({
                articleId: id,
                wasBookmarked,
                article,
                setBookmarkedItems,
                setNewsData,
            });
        });
    };

    return (
        <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: topInset }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { borderBottomColor: colors.borderLight, backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <ChevronLeft size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text variant="title" style={{ color: colors.textPrimary }}>
                        Bookmarks
                    </Text>
                    <Text variant="caption" color={colors.textSecondary}>
                        Saved articles synced with your account
                    </Text>
                </View>
            </View>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : (
                <ArticleFeedList
                    data={newsData}
                    contentContainerStyle={styles.list}
                    onArticlePress={handleArticlePress}
                    onVote={handleVote}
                    onBookmark={handleBookmark}
                    ListEmptyComponent={
                        <Text variant="body" color={colors.textSecondary} style={styles.empty}>
                            No bookmarks yet. Save articles from the feed to see them here.
                        </Text>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () => {
                                setRefreshing(true);
                                await loadNews();
                                setRefreshing(false);
                            }}
                            {...getRefreshControlProps(colors, theme.mode)}
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 4,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: { flex: 1, paddingRight: 12 },
    list: { paddingBottom: 120 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { textAlign: 'center', marginTop: 48, paddingHorizontal: 24 },
});

export default BookmarksScreen;

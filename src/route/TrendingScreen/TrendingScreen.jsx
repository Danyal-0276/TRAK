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
import ArticleFeedList from '../../components/ArticleFeedList';
import { useTheme } from '../../theme/ThemeContext';
import { getRefreshControlProps } from '../../theme/refreshControl';
import { loadFeedItems } from '../../utils/loadFeed';
import { addBookmark, removeBookmark, setReaction } from '../../utils/Service/api';
import { setBookmarkIds } from '../../utils/bookmarksStorage';
import { setReactionForArticle } from '../../utils/reactionsStorage';
import Text from '../../components/ui/Text';
import { navigateToArticleDetail, getCurrentMainTab } from '../../utils/articleNavigation';
import { patchArticleVoteRow, reactionApiValue } from '../../utils/reactionVote';
import { emitArticleInteractionChange } from '../../utils/articleInteractionEvents';
import { useSyncFeedInteractionsOnFocus } from '../../hooks/useSyncFeedInteractionsOnFocus';

const TrendingScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const topInset = resolveTopInset(insets, 0);
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useSyncFeedInteractionsOnFocus({ setVotedItems, setBookmarkedItems, setNewsData });

    const loadNews = useCallback(async () => {
        try {
            const items = await loadFeedItems({ mode: 'explore' });
            setNewsData(items.filter((item) => item.trending));
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

    const handleArticlePress = (article) => {
        navigateToArticleDetail(navigation, article, { returnTab: getCurrentMainTab(navigation) });
    };

    const handleVote = (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id] ?? null;
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) !== id ? n : patchArticleVoteRow(n, previousVote, newVote)))
        );
        (async () => {
            try {
                const data = await setReaction(id, reactionApiValue(newVote));
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setNewsData((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: newVote }
                    )
                );
            } catch {
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setNewsData((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id ? n : patchArticleVoteRow(n, newVote, previousVote)
                    )
                );
            }
        })();
    };

    const handleBookmark = async (itemId) => {
        const id = String(itemId);
        const wasBookmarked = bookmarkedItems.has(id);
        const nextBm = !wasBookmarked;
        setBookmarkedItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            setBookmarkIds(Array.from(next)).catch(() => {});
            return next;
        });
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) === id ? { ...n, isBookmarked: nextBm } : n))
        );
        emitArticleInteractionChange({ articleId: id, isBookmarked: nextBm });
        try {
            const item = newsData.find((n) => String(n.id) === id);
            if (wasBookmarked) await removeBookmark(id);
            else await addBookmark(id, item?.title || '', item?.canonical_url || item?.url || '');
        } catch {
            setBookmarkedItems((prev) => {
                const next = new Set(prev);
                if (wasBookmarked) next.add(id);
                else next.delete(id);
                return next;
            });
            setNewsData((prev) =>
                prev.map((n) => (String(n.id) === id ? { ...n, isBookmarked: wasBookmarked } : n))
            );
        }
    };

    return (
        <View style={[styles.safe, { backgroundColor: colors.background, paddingTop: topInset }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { borderBottomColor: colors.borderLight, backgroundColor: colors.surface }]}>
                <View style={styles.headerText}>
                    <Text variant="title" style={{ color: colors.textPrimary }}>
                        Trending
                    </Text>
                    <Text variant="caption" color={colors.textSecondary}>
                        Popular and flagged stories
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
                            No trending articles right now.
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
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        gap: 8,
    },
    headerText: { flex: 1 },
    list: { paddingBottom: 120 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { textAlign: 'center', marginTop: 48, paddingHorizontal: 24 },
});

export default TrendingScreen;

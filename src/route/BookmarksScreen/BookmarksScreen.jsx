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
import { addBookmark, getUserArticleDetail, listBookmarks, removeBookmark, setReaction } from '../../utils/Service/api';
import Text from '../../components/ui/Text';
import { buildArticleDetailParams } from '../../utils/articleNavigation';
import { mapApiItem } from '../../utils/loadFeed';
import { filterRealFeedItems } from '../../utils/feedRealOnly';

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

    const handleArticlePress = (article) => {
        navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id];
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) === id ? { ...n, userReaction: newVote } : n))
        );
        try {
            await setReaction(id, newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none');
        } catch {
            setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
            setNewsData((prev) =>
                prev.map((n) => (String(n.id) === id ? { ...n, userReaction: previousVote } : n))
            );
        }
    };

    const handleBookmark = async (itemId) => {
        try {
            const exists = bookmarkedItems.has(itemId) || bookmarkedItems.has(String(itemId));
            const item = newsData.find((n) => String(n.id) === String(itemId));
            if (exists) await removeBookmark(itemId);
            else await addBookmark(itemId, item?.title || '', item?.canonical_url || item?.url || '');
            await loadNews();
        } catch {
            console.warn('bookmark update failed');
        }
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

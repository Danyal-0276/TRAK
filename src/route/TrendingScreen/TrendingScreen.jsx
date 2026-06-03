import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ArticleFeedList from '../../components/ArticleFeedList';
import { useTheme } from '../../theme/ThemeContext';
import { getRefreshControlProps } from '../../theme/refreshControl';
import { loadFeedItems } from '../../utils/loadFeed';
import { addBookmark, removeBookmark, setReaction } from '../../utils/Service/api';
import Text from '../../components/ui/Text';
import { buildArticleDetailParams } from '../../utils/articleNavigation';

const TrendingScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
        const id = String(itemId);
        const wasBookmarked = bookmarkedItems.has(id);
        setBookmarkedItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) === id ? { ...n, isBookmarked: !n.isBookmarked } : n))
        );
        try {
            const item = newsData.find((n) => String(n.id) === id);
            const exists = bookmarkedItems.has(id);
            if (exists) await removeBookmark(id);
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
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
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
        </SafeAreaView>
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

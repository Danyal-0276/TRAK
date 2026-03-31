import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    RefreshControl,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { NewsCard } from '../../components/NewsCard';
import { useTheme } from '../../theme/ThemeContext';
import { loadFeedItems } from '../../utils/loadFeed';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import Text from '../../components/ui/Text';

const BookmarksScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadNews = useCallback(async () => {
        try {
            const stored = await getBookmarkIds();
            const idSet = new Set(stored);
            setBookmarkedItems(idSet);

            const items = await loadFeedItems();
            setNewsData(items.filter((item) => idSet.has(String(item.id))));
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
        navigation.navigate('ArticleDetail', { article });
    };

    const handleVote = async (itemId, type) => {
        const previousVote = votedItems[itemId];
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [itemId]: newVote }));
        try {
            await mockApi.voteArticle(itemId, newVote);
        } catch {
            setVotedItems((prev) => ({ ...prev, [itemId]: previousVote }));
        }
    };

    const handleBookmark = async (itemId) => {
        const nextSet = new Set(bookmarkedItems);
        if (nextSet.has(itemId)) nextSet.delete(itemId);
        else nextSet.add(itemId);
        setBookmarkedItems(nextSet);
        await setBookmarkIds(Array.from(nextSet));
        setNewsData((rows) => rows.filter((r) => nextSet.has(String(r.id))));
        try {
            await mockApi.bookmarkArticle(itemId);
        } catch {
            /* ignore */
        }
    };

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { borderBottomColor: colors.borderLight, backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
                    <ArrowLeft size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text variant="title" style={{ color: colors.textPrimary }}>
                        Bookmarks
                    </Text>
                    <Text variant="caption" color={colors.textSecondary}>
                        Saved articles (synced on device)
                    </Text>
                </View>
            </View>
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={async () => {
                                setRefreshing(true);
                                await loadNews();
                                setRefreshing(false);
                            }}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {newsData.length === 0 ? (
                        <Text variant="body" color={colors.textSecondary} style={styles.empty}>
                            No bookmarks yet. Save articles from the feed to see them here.
                        </Text>
                    ) : (
                        newsData.map((item, index) => (
                            <NewsCard
                                key={item.id}
                                item={item}
                                onPress={() => handleArticlePress(item)}
                                votedItems={votedItems}
                                bookmarkedItems={bookmarkedItems}
                                onVote={handleVote}
                                onBookmark={handleBookmark}
                                index={index}
                            />
                        ))
                    )}
                </ScrollView>
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
    backBtn: { padding: 8 },
    headerText: { flex: 1 },
    list: { paddingBottom: 120 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { textAlign: 'center', marginTop: 48, paddingHorizontal: 24 },
});

export default BookmarksScreen;

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
import { addBookmark, getUserArticleDetail, listBookmarks, removeBookmark, setReaction } from '../../utils/Service/api';
import Text from '../../components/ui/Text';
import { buildArticleDetailParams } from '../../utils/articleNavigation';

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
            const response = await listBookmarks();
            const rows = response.results || [];
            const detailed = await Promise.all(
                rows.map(async (r) => {
                    try {
                        const full = await getUserArticleDetail(r.article_id);
                        return {
                            ...full,
                            id: full.id || r.article_id || r.id,
                            time: full.time || (r.created_at ? new Date(r.created_at).toLocaleString() : 'Recently'),
                            category: full.category || 'Saved',
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
            setNewsData((detailed || []).filter(Boolean));
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
        const previousVote = votedItems[itemId];
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [itemId]: newVote }));
        try {
            await setReaction(itemId, newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none');
        } catch {
            setVotedItems((prev) => ({ ...prev, [itemId]: previousVote }));
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
                        Saved articles (synced with backend)
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

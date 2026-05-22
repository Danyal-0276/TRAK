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
import { NewsCard } from '../../components/NewsCard';
import { useTheme } from '../../theme/ThemeContext';
import { loadFeedItems } from '../../utils/loadFeed';
import Text from '../../components/ui/Text';
import { buildArticleDetailParams } from '../../utils/articleNavigation';

/** Higher = more recent (for descending sort). */
function recencySortKey(timeStr) {
    if (timeStr == null) return 0;
    const s = String(timeStr);
    const ms = Date.parse(s);
    if (!Number.isNaN(ms)) return ms;
    const m = s.match(/^(\d+)\s*(h|d|m)/i);
    if (!m) return 0;
    const n = parseInt(m[1], 10) || 0;
    const u = m[2].toLowerCase();
    const mult = u === 'd' ? 86400000 : u === 'm' ? 60000 : 3600000;
    return Date.now() - n * mult;
}

const RecentScreen = ({ navigation }) => {
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
            const sorted = [...items].sort(
                (a, b) => recencySortKey(b.time) - recencySortKey(a.time)
            );
            setNewsData(sorted);
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
            await mockApi.voteArticle(itemId, newVote);
        } catch {
            setVotedItems((prev) => ({ ...prev, [itemId]: previousVote }));
        }
    };

    const handleBookmark = async (itemId) => {
        setBookmarkedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) next.delete(itemId);
            else next.add(itemId);
            return next;
        });
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
                <View style={styles.headerText}>
                    <Text variant="title" style={{ color: colors.textPrimary }}>
                        Recent
                    </Text>
                    <Text variant="caption" color={colors.textSecondary}>
                        Newest articles first
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
                    {newsData.map((item, index) => (
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
                    ))}
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
    headerText: { flex: 1 },
    list: { paddingBottom: 120 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default RecentScreen;

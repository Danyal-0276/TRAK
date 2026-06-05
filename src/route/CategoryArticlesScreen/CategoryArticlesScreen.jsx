import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    StatusBar,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import Text from '../../components/ui/Text';
import { useTheme } from '../../theme/ThemeContext';
import { resolveTopInset } from '../../utils/screenSafeArea';
import { loadCategoryPage } from '../../utils/loadFeed';
import { getCategoryIcon } from '../../utils/categoryMatch';
import { useArticleInteractions } from '../../hooks/useArticleInteractions';
import ArticleFeedList from '../../components/ArticleFeedList';
import { buildArticleDetailParams } from '../../utils/articleNavigation';

const CategoryArticlesScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const topInset = resolveTopInset(insets, 0);
    const categorySlug = String(route?.params?.categorySlug || '').trim().toLowerCase();
    const categoryName = String(route?.params?.categoryName || categorySlug).trim();

    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const {
        handleVote,
        handleBookmark,
        syncFromServer,
    } = useArticleInteractions({ articles: newsData, onArticlesPatch: setNewsData });

    const loadNews = useCallback(async () => {
        if (!categorySlug) return;
        try {
            setLoading(true);
            const page = await loadCategoryPage({ category: categorySlug, limit: 40, cursor: '' });
            setNewsData(page.items || []);
            setNextCursor(page.nextCursor || null);
            setHasMore(Boolean(page.hasMore));
            await syncFromServer(true);
        } catch (e) {
            console.warn(e);
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    }, [categorySlug, syncFromServer]);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor || !categorySlug) return;
        setLoadingMore(true);
        try {
            const page = await loadCategoryPage({ category: categorySlug, limit: 40, cursor: nextCursor });
            setNewsData((prev) => {
                const seen = new Set(prev.map((x) => String(x.id)));
                const merged = [...prev];
                for (const item of page.items || []) {
                    const id = String(item.id);
                    if (seen.has(id)) continue;
                    seen.add(id);
                    merged.push(item);
                }
                return merged;
            });
            setNextCursor(page.nextCursor || null);
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn(e);
        } finally {
            setLoadingMore(false);
        }
    }, [categorySlug, hasMore, loadingMore, nextCursor]);

    const handleArticlePress = (article) => {
        navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { paddingTop: topInset, borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.8}
                >
                    <ArrowLeft size={20} color={colors.textSecondary} />
                    <Text variant="body" color={colors.textSecondary}>Back</Text>
                </TouchableOpacity>
                <View style={styles.titleRow}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(categoryName)}</Text>
                    <View style={styles.titleText}>
                        <Text variant="title" style={{ color: colors.textPrimary }}>{categoryName}</Text>
                        <Text variant="caption" color={colors.textSecondary}>
                            All articles in this category
                        </Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : newsData.length === 0 ? (
                <View style={styles.centered}>
                    <Text variant="body" color={colors.textSecondary}>No articles found in this category yet.</Text>
                </View>
            ) : (
                <ArticleFeedList
                    data={newsData}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    onArticlePress={handleArticlePress}
                    onVote={handleVote}
                    onBookmark={handleBookmark}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.4}
                    ListFooterComponent={
                        loadingMore ? (
                            <ActivityIndicator color={colors.primary} style={{ paddingVertical: 16 }} />
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    categoryIcon: { fontSize: 30 },
    titleText: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    list: { flex: 1 },
    listContent: { paddingBottom: 24 },
});

export default CategoryArticlesScreen;

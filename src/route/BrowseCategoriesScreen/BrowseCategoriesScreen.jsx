import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, Search } from 'lucide-react-native';
import Text from '../../components/ui/Text';
import { useTheme } from '../../theme/ThemeContext';
import { resolveTopInset } from '../../utils/screenSafeArea';
import { loadExplorePage } from '../../utils/loadFeed';
import { fetchPlatformCategories } from '../../api/newsApi';
import {
    articleMatchesCategory,
    buildCategoryList,
    getCategoryIcon,
} from '../../utils/categoryMatch';
import { useArticleInteractions } from '../../hooks/useArticleInteractions';
import ArticleFeedList from '../../components/ArticleFeedList';
import { buildArticleDetailParams } from '../../utils/articleNavigation';

const POPULAR_CATEGORY_NAMES = [
    'Technology', 'Politics', 'Business', 'Sports', 'Health',
    'Science', 'Entertainment', 'World', 'Finance', 'Education',
];
const ARTICLES_PREVIEW_COUNT = 6;
const INITIAL_VISIBLE_COUNT = 8;

function articleSortTime(item) {
    const raw = item.published_at || item.time || item.fetched_at || '';
    const ts = new Date(raw).getTime();
    return Number.isFinite(ts) ? ts : 0;
}

const BrowseCategoriesScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const topInset = resolveTopInset(insets, 0);
    const [allNews, setAllNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categorySearch, setCategorySearch] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [showMoreCategories, setShowMoreCategories] = useState(false);

    const {
        handleVote,
        handleBookmark,
        syncFromServer,
    } = useArticleInteractions({ articles: allNews, onArticlesPatch: setAllNews });

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            const [plat, page] = await Promise.all([
                fetchPlatformCategories().catch(() => ({ categories: [], connections: [] })),
                loadExplorePage({ limit: 50, cursor: '' }),
            ]);
            const newsData = page.items || [];
            setAllNews(newsData);
            const adminNames = (plat.categories || []).map((c) =>
                typeof c === 'string' ? c : c?.name || c?.id || ''
            );
            setCategories(buildCategoryList(newsData, adminNames));
            await syncFromServer(true);
        } catch (error) {
            console.error('Error loading categories:', error);
            setAllNews([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [syncFromServer]);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const articlesByCategory = useMemo(() => {
        const map = {};
        for (const cat of categories) {
            map[cat.name] = allNews.filter((item) => articleMatchesCategory(item, cat.name));
        }
        return map;
    }, [categories, allNews]);

    const searchedCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
    );

    const popularCategories = useMemo(() => {
        if (categorySearch.trim()) return searchedCategories;
        const popNames = new Set(POPULAR_CATEGORY_NAMES.map((n) => n.toLowerCase()));
        const popular = categories.filter((c) => popNames.has(c.name.toLowerCase()) && c.count > 0);
        if (popular.length === 0) {
            return categories.filter((c) => c.count > 0).slice(0, INITIAL_VISIBLE_COUNT);
        }
        return popular;
    }, [categories, categorySearch, searchedCategories]);

    const moreCategories = useMemo(() => {
        if (categorySearch.trim()) return [];
        const popularNames = new Set(popularCategories.map((c) => c.name));
        return categories.filter((c) => !popularNames.has(c.name) && c.count > 0);
    }, [categories, popularCategories, categorySearch]);

    const categoriesToRender = categorySearch.trim()
        ? searchedCategories
        : [...popularCategories, ...(showMoreCategories ? moreCategories : [])];

    const handleArticlePress = (article) => {
        navigation.navigate('ArticleDetail', buildArticleDetailParams(article));
    };

    const openCategory = (category) => {
        navigation.navigate('CategoryArticles', {
            categorySlug: category.key,
            categoryName: category.name,
        });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.header, { paddingTop: topInset, borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                <Text variant="title" style={{ color: colors.textPrimary }}>Categories</Text>
                <Text variant="caption" color={colors.textSecondary}>Browse articles by category</Text>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator color={colors.primary} size="large" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={[styles.searchRow, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                        <Search size={18} color={colors.textSecondary} />
                        <TextInput
                            value={categorySearch}
                            onChangeText={setCategorySearch}
                            placeholder="Search categories…"
                            placeholderTextColor={colors.textTertiary}
                            style={[styles.searchInput, { color: colors.textPrimary }]}
                        />
                    </View>

                    {categoriesToRender.length === 0 ? (
                        <Text variant="body" color={colors.textSecondary} style={styles.emptyText}>
                            No categories with articles yet.
                        </Text>
                    ) : (
                        categoriesToRender.map((category) => {
                            const isExpanded = expandedCategory === category.name;
                            const catArticles = articlesByCategory[category.name] || [];
                            const sortedArticles = [...catArticles].sort(
                                (a, b) => articleSortTime(b) - articleSortTime(a)
                            );
                            const visibleArticles = sortedArticles.slice(0, ARTICLES_PREVIEW_COUNT);
                            const hiddenCount = sortedArticles.length - ARTICLES_PREVIEW_COUNT;

                            return (
                                <View
                                    key={category.key}
                                    style={[
                                        styles.categoryCard,
                                        {
                                            borderColor: isExpanded ? colors.primary : colors.border,
                                            backgroundColor: colors.surface,
                                        },
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={styles.categoryHeader}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            setExpandedCategory((prev) =>
                                                prev === category.name ? null : category.name
                                            )
                                        }
                                    >
                                        <Text style={styles.categoryIcon}>{getCategoryIcon(category.name)}</Text>
                                        <Text variant="body" style={[styles.categoryName, { color: colors.textPrimary }]}>
                                            {category.name}
                                        </Text>
                                        <View style={[styles.countBadge, { backgroundColor: colors.backgroundSecondary }]}>
                                            <Text variant="caption" color={colors.textSecondary}>
                                                {category.count}
                                            </Text>
                                        </View>
                                        {isExpanded ? (
                                            <ChevronUp size={18} color={colors.textSecondary} />
                                        ) : (
                                            <ChevronDown size={18} color={colors.textSecondary} />
                                        )}
                                    </TouchableOpacity>

                                    {isExpanded ? (
                                        <View style={[styles.expandedBody, { borderTopColor: colors.border }]}>
                                            {catArticles.length === 0 ? (
                                                <Text variant="caption" color={colors.textSecondary}>
                                                    No articles found in this category.
                                                </Text>
                                            ) : (
                                                <>
                                                    <ArticleFeedList
                                                        data={visibleArticles}
                                                        onArticlePress={handleArticlePress}
                                                        onVote={handleVote}
                                                        onBookmark={handleBookmark}
                                                        scrollEnabled={false}
                                                    />
                                                    {hiddenCount > 0 ? (
                                                        <TouchableOpacity
                                                            style={[styles.showMoreBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                                            onPress={() => openCategory(category)}
                                                            activeOpacity={0.85}
                                                        >
                                                            <Text variant="body" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                                                                Show more
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ) : null}
                                                </>
                                            )}
                                        </View>
                                    ) : null}
                                </View>
                            );
                        })
                    )}

                    {!categorySearch.trim() && moreCategories.length > 0 ? (
                        <TouchableOpacity
                            style={[styles.moreCategoriesBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                            onPress={() => setShowMoreCategories((v) => !v)}
                            activeOpacity={0.85}
                        >
                            {showMoreCategories ? (
                                <ChevronUp size={16} color={colors.textPrimary} />
                            ) : (
                                <ChevronDown size={16} color={colors.textPrimary} />
                            )}
                            <Text variant="body" style={{ color: colors.textPrimary, fontWeight: '600' }}>
                                {showMoreCategories ? 'Show fewer categories' : 'Show more categories'}
                            </Text>
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 16, paddingBottom: 32 },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
    emptyText: { textAlign: 'center', marginTop: 24 },
    categoryCard: {
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    categoryIcon: { fontSize: 22 },
    categoryName: { flex: 1, fontWeight: '600', fontSize: 16 },
    countBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginRight: 4 },
    expandedBody: { borderTopWidth: 1, padding: 12 },
    showMoreBtn: {
        marginTop: 12,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    moreCategoriesBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginTop: 8,
    },
});

export default BrowseCategoriesScreen;

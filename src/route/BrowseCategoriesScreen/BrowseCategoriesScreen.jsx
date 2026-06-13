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
import { loadCategoryPage } from '../../utils/loadFeed';
import { fetchPlatformCategories } from '../../api/newsApi';
import {
    buildCategoryList,
    getCategoryIcon,
} from '../../utils/categoryMatch';
import { useArticleInteractions } from '../../hooks/useArticleInteractions';
import ArticleFeedList from '../../components/ArticleFeedList';
import { buildArticleDetailParams } from '../../utils/articleNavigation';

const POPULAR_CATEGORY_KEYS = new Set([
    'technology', 'politics', 'business', 'sports', 'health',
    'science', 'entertainment', 'world-news', 'finance', 'education',
]);
const ARTICLES_PREVIEW_COUNT = 6;
const INITIAL_VISIBLE_COUNT = 8;

const BrowseCategoriesScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const insets = useSafeAreaInsets();
    const topInset = resolveTopInset(insets, 0);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categorySearch, setCategorySearch] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [showMoreCategories, setShowMoreCategories] = useState(false);
    const [previewByKey, setPreviewByKey] = useState({});
    const [previewLoadingKey, setPreviewLoadingKey] = useState('');

    const {
        handleVote,
        handleBookmark,
        syncFromServer,
    } = useArticleInteractions({ articles: Object.values(previewByKey).flat(), onArticlesPatch: () => {} });

    const loadCategories = useCallback(async () => {
        try {
            setLoading(true);
            const plat = await fetchPlatformCategories().catch(() => ({
                categories: [],
                connections: [],
                category_counts: {},
            }));
            setCategories(buildCategoryList(plat.categories || [], plat.category_counts ?? {}));
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    const loadCategoryPreview = useCallback(async (categoryKey) => {
        if (!categoryKey || previewByKey[categoryKey]) return;
        setPreviewLoadingKey(categoryKey);
        try {
            const page = await loadCategoryPage({ category: categoryKey, limit: ARTICLES_PREVIEW_COUNT, cursor: '' });
            setPreviewByKey((prev) => ({ ...prev, [categoryKey]: page.items || [] }));
            await syncFromServer(true);
        } catch (e) {
            console.warn('Category preview failed:', e?.message);
            setPreviewByKey((prev) => ({ ...prev, [categoryKey]: [] }));
        } finally {
            setPreviewLoadingKey('');
        }
    }, [previewByKey, syncFromServer]);

    const searchedCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
    );

    const popularCategories = useMemo(() => {
        if (categorySearch.trim()) return searchedCategories;
        const popular = categories.filter((c) => POPULAR_CATEGORY_KEYS.has(c.key));
        if (popular.length === 0) {
            return categories.slice(0, INITIAL_VISIBLE_COUNT);
        }
        return popular;
    }, [categories, categorySearch, searchedCategories]);

    const moreCategories = useMemo(() => {
        if (categorySearch.trim()) return [];
        const popularKeys = new Set(popularCategories.map((c) => c.key));
        return categories.filter((c) => !popularKeys.has(c.key));
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
            categoryCount: category.count,
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
                            const previewArticles = previewByKey[category.key] || [];
                            const previewLoading = previewLoadingKey === category.key;
                            const showMoreLink = category.count > ARTICLES_PREVIEW_COUNT;

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
                                        onPress={() => {
                                            const opening = expandedCategory !== category.name;
                                            setExpandedCategory(opening ? category.name : null);
                                            if (opening) loadCategoryPreview(category.key);
                                        }}
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
                                            {previewLoading ? (
                                                <ActivityIndicator color={colors.primary} size="small" />
                                            ) : category.count === 0 ? (
                                                <Text variant="caption" color={colors.textSecondary}>
                                                    No articles in this category yet.
                                                </Text>
                                            ) : previewArticles.length === 0 ? (
                                                <Text variant="caption" color={colors.textSecondary}>
                                                    Could not load preview.
                                                </Text>
                                            ) : (
                                                <>
                                                    <ArticleFeedList
                                                        data={previewArticles}
                                                        onArticlePress={handleArticlePress}
                                                        onVote={handleVote}
                                                        onBookmark={handleBookmark}
                                                        scrollEnabled={false}
                                                    />
                                                    {showMoreLink ? (
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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { loadCategoryPage } from '../../utils/loadFeed';
import { fetchPlatformCategoriesCached, loadExploreCategoryTabsProgressive } from '../../utils/platformTaxonomy';
import { removeBookmark, setReaction, addBookmark } from '../../utils/Service/api';
import { setReactionForArticle } from '../../utils/reactionsStorage';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed } from '../../components/MasonryFeed';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { SkeletonCategoryAccordion } from '../../components/skeletons/SkeletonLayouts';
import {
    buildCategoryList,
    getCategoryIcon,
} from '../../utils/categoryMatch';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { patchArticleVoteRow, reactionApiValue } from '../../utils/reactionVote';

const POPULAR_CATEGORY_KEYS = new Set([
    'technology', 'politics', 'business', 'sports', 'health',
    'science', 'entertainment', 'world-news', 'finance', 'education',
]);

const ARTICLES_PREVIEW_COUNT = 6;
const INITIAL_VISIBLE_COUNT = 8;
const PREVIEW_TIMEOUT_MS = 45000;

function loadCategoryPreviewPage(categoryKey) {
    return Promise.race([
        loadCategoryPage({ category: categoryKey, limit: ARTICLES_PREVIEW_COUNT }),
        new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Category preview timed out')), PREVIEW_TIMEOUT_MS);
        }),
    ]);
}

const CategoriesScreen = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [categorySearch, setCategorySearch] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const [previewByKey, setPreviewByKey] = useState({});
    const [previewStatusByKey, setPreviewStatusByKey] = useState({});
    const [countsLoading, setCountsLoading] = useState(true);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setCountsLoading(true);
            const applyList = (plat) => {
                const categoryList = buildCategoryList(plat.categories || [], plat.category_counts ?? {});
                setCategories(categoryList);
            };

            await loadExploreCategoryTabsProgressive(({ categories: platformCats, categoryCounts }) => {
                applyList({ categories: platformCats, category_counts: categoryCounts });
                setLoading(false);
            }).then(({ categories: platformCats, categoryCounts }) => {
                applyList({ categories: platformCats, category_counts: categoryCounts });
            }).catch(async () => {
                const plat = await fetchPlatformCategoriesCached({ includeCounts: false }).catch(() => ({
                    categories: [],
                    category_counts: {},
                }));
                applyList(plat);
            });
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
            setCountsLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategoryPreview = useCallback(async (categoryKey, { force = false } = {}) => {
        if (!categoryKey) return;
        const status = previewStatusByKey[categoryKey];
        if (!force && (status === 'loading' || status === 'loaded')) return;

        setPreviewStatusByKey((prev) => ({ ...prev, [categoryKey]: 'loading' }));
        try {
            const page = await loadCategoryPreviewPage(categoryKey);
            const items = page.items || [];
            const total = page.categoryTotal != null ? Number(page.categoryTotal) : null;
            setPreviewByKey((prev) => ({ ...prev, [categoryKey]: items }));
            setPreviewStatusByKey((prev) => ({
                ...prev,
                [categoryKey]: 'loaded',
            }));
            if (total != null && total >= 0) {
                setCategories((prev) => prev.map((row) => (
                    row.key === categoryKey ? { ...row, count: total } : row
                )));
            } else if (items.length > 0) {
                setCategories((prev) => prev.map((row) => (
                    row.key === categoryKey ? { ...row, count: Math.max(row.count, items.length) } : row
                )));
            }
        } catch (e) {
            console.warn('Category preview failed:', e?.message);
            setPreviewByKey((prev) => ({ ...prev, [categoryKey]: [] }));
            setPreviewStatusByKey((prev) => ({ ...prev, [categoryKey]: 'error' }));
        }
    }, [previewStatusByKey]);

    const retryCounts = () => {
        setCountsLoading(true);
        fetchPlatformCategoriesCached({ includeCounts: true })
            .then((plat) => {
                const categoryList = buildCategoryList(plat.categories || [], plat.category_counts ?? {});
                setCategories(categoryList);
            })
            .catch(() => {})
            .finally(() => setCountsLoading(false));
    };

    const retryPreview = (category) => {
        if (!category?.key) return;
        setPreviewStatusByKey((prev) => {
            const next = { ...prev };
            delete next[category.key];
            return next;
        });
        loadCategoryPreview(category.key, { force: true });
    };

    const handleCategoryClick = (category) => {
        const opening = expandedCategory !== category.name;
        setExpandedCategory(opening ? category.name : null);
        if (opening && category.key) {
            loadCategoryPreview(category.key);
        }
    };

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id] ?? null;
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);

        (async () => {
            try {
                await setReaction(id, reactionApiValue(newVote));
            } catch {
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null);
            }
        })();
    };

    const handleBookmark = async (itemId, article) => {
        const id = String(itemId);
        const wasBookmarked = bookmarkedItems.has(id);
        setBookmarkedItems((prev) => {
            const next = new Set([...prev].map(String));
            if (wasBookmarked) next.delete(id);
            else next.add(id);
            return next;
        });
        try {
            if (wasBookmarked) await removeBookmark(id);
            else await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
        } catch {
            setBookmarkedItems((prev) => {
                const next = new Set([...prev].map(String));
                if (wasBookmarked) next.add(id);
                else next.delete(id);
                return next;
            });
        }
    };

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const borderColor = colors.border;
    const accentColor = colors.primary;

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
        : [...popularCategories, ...(showMore ? moreCategories : [])];

    return (
        <div style={{ minHeight: '100vh', backgroundColor, paddingTop: 0 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 24px 24px' }}>
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: textPrimary, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                        {t('pages.categoriesTitle')}
                    </h1>
                    <p style={{ fontSize: 15, color: textSecondary, margin: 0, lineHeight: 1.5 }}>
                        {t('pages.categoriesSubtitle')}
                    </p>
                </div>

                {loading ? (
                    <div>
                        <div style={{
                            display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20,
                        }}>
                            <div className="trak-sk-pulse" style={{
                                flex: '1 1 220px', height: 44, borderRadius: 10,
                                background: isDark ? colors.surface : '#ffffff',
                                border: `1px solid ${borderColor}`,
                            }} />
                        </div>
                        <SkeletonCategoryAccordion count={6} isDark={isDark} colors={colors} />
                    </div>
                ) : categories.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '48px 24px', marginBottom: 40,
                        borderRadius: 12, border: `1px solid ${borderColor}`, backgroundColor: cardBackground,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textPrimary }}>No categories yet</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                            <div style={{
                                flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 10,
                                padding: '10px 14px', borderRadius: 10,
                                border: `1px solid ${borderColor}`, backgroundColor: cardBackground,
                            }}>
                                <Search size={18} color={textSecondary} strokeWidth={2} />
                                <input
                                    type="search"
                                    placeholder="Search categories…"
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: textPrimary }}
                                />
                            </div>
                            <span style={{ fontSize: 13, color: textSecondary }}>
                                {countsLoading
                                    ? 'Loading article counts…'
                                    : `${categories.filter((c) => c.count > 0).length} categories with articles`}
                                {!countsLoading && categories.every((c) => c.count === 0) ? (
                                    <button
                                        type="button"
                                        onClick={retryCounts}
                                        style={{
                                            marginLeft: 8,
                                            border: 'none',
                                            background: 'transparent',
                                            color: accentColor,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Retry counts
                                    </button>
                                ) : null}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                            {categoriesToRender.map((category) => {
                                const isExpanded = expandedCategory === category.name;
                                const previewArticles = previewByKey[category.key] || [];
                                const previewStatus = previewStatusByKey[category.key];
                                const previewLoading = previewStatus === 'loading';
                                const previewFailed = previewStatus === 'error';
                                const showMoreLink = category.count > ARTICLES_PREVIEW_COUNT;

                                return (
                                    <div
                                        key={category.key}
                                        style={{
                                            border: `1px solid ${isExpanded ? accentColor : borderColor}`,
                                            borderRadius: 12,
                                            overflow: 'hidden',
                                            backgroundColor: cardBackground,
                                            transition: 'border-color 0.2s',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryClick(category)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center',
                                                gap: 12, padding: '16px 20px', background: 'transparent',
                                                border: 'none', cursor: 'pointer', textAlign: 'left',
                                            }}
                                        >
                                            <span style={{ fontSize: 22 }}>{getCategoryIcon(category.name)}</span>
                                            <span style={{ flex: 1, fontSize: 16, fontWeight: 600, color: textPrimary }}>
                                                {category.name}
                                            </span>
                                            <span style={{
                                                fontSize: 12, fontWeight: 700, color: textSecondary,
                                                background: colors.backgroundSecondary,
                                                padding: '3px 10px', borderRadius: 999, marginRight: 8,
                                            }}>
                                                {countsLoading && category.count === 0 ? '…' : category.count} {category.count === 1 ? 'article' : 'articles'}
                                            </span>
                                            {isExpanded
                                                ? <ChevronUp size={18} color={textSecondary} />
                                                : <ChevronDown size={18} color={textSecondary} />}
                                        </button>

                                        {isExpanded && (
                                            <div style={{
                                                borderTop: `1px solid ${borderColor}`,
                                                padding: '20px',
                                                animation: 'trak-cat-expand 0.2s ease',
                                            }}>
                                                {previewLoading ? (
                                                    <p style={{ margin: 0, fontSize: 14, color: textSecondary }}>Loading articles…</p>
                                                ) : previewStatus === 'loaded' && previewArticles.length === 0 ? (
                                                    <p style={{ margin: 0, fontSize: 14, color: textSecondary }}>
                                                        No articles in this category yet.
                                                    </p>
                                                ) : previewStatus === 'error' ? (
                                                    <div>
                                                        <p style={{ margin: '0 0 12px', fontSize: 14, color: textSecondary }}>
                                                            Could not load preview. Open the full category page.
                                                        </p>
                                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => retryPreview(category)}
                                                                style={{
                                                                    padding: '10px 18px',
                                                                    borderRadius: 8,
                                                                    border: `1px solid ${borderColor}`,
                                                                    background: colors.backgroundSecondary,
                                                                    color: textPrimary,
                                                                    fontWeight: 600,
                                                                    fontSize: 14,
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                Retry
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/categories/${encodeURIComponent(category.key)}`, {
                                                                    state: { categoryCount: category.count },
                                                                })}
                                                                style={{
                                                                    padding: '10px 18px',
                                                                    borderRadius: 8,
                                                                    border: `1px solid ${accentColor}`,
                                                                    background: `${accentColor}12`,
                                                                    color: accentColor,
                                                                    fontWeight: 600,
                                                                    fontSize: 14,
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                View all
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p style={{ margin: '0 0 8px', fontSize: 13, color: textSecondary }}>
                                                            Showing {Math.min(previewArticles.length, category.count)} of {category.count} articles
                                                        </p>
                                                        <MasonryFeed gap={16}>
                                                            {previewArticles.map((item) => (
                                                                <NewsCard
                                                                    key={item.id}
                                                                    item={item}
                                                                    layout="masonry"
                                                                    onPress={() => handleArticlePress(item)}
                                                                    votedItems={votedItems}
                                                                    bookmarkedItems={bookmarkedItems}
                                                                    onVote={handleVote}
                                                                    onBookmark={(id) => handleBookmark(id, item)}
                                                                />
                                                            ))}
                                                        </MasonryFeed>
                                                        {showMoreLink ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/categories/${encodeURIComponent(category.key)}`, {
                                                                    state: { categoryCount: category.count },
                                                                })}
                                                                style={{
                                                                    marginTop: 16,
                                                                    padding: '10px 18px',
                                                                    borderRadius: 8,
                                                                    border: `1px solid ${borderColor}`,
                                                                    background: colors.backgroundSecondary,
                                                                    color: textPrimary,
                                                                    fontWeight: 600,
                                                                    fontSize: 14,
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                {t('pages.showMore')}
                                                            </button>
                                                        ) : null}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {!categorySearch.trim() && moreCategories.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowMore((v) => !v)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 20px', borderRadius: 10,
                                    border: `1px solid ${borderColor}`, backgroundColor: cardBackground,
                                    cursor: 'pointer', fontSize: 14, fontWeight: 600, color: textPrimary,
                                    marginBottom: 32,
                                }}
                            >
                                {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                {showMore ? t('pages.showFewer') : t('pages.showMore')}
                            </button>
                        )}
                    </>
                )}
            </div>
            <style>{`
                @keyframes trak-cat-expand {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                h1 { margin-top: 0 !important; padding-top: 0 !important; }
            `}</style>
        </div>
    );
};

export default CategoriesScreen;

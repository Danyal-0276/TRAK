import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { loadExplorePage, mergeUniqueById } from '../../utils/loadFeed';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { addBookmark, fetchPlatformCategories, removeBookmark, setReaction } from '../../utils/Service/api';
import { setReactionForArticle } from '../../utils/reactionsStorage';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed } from '../../components/MasonryFeed';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { SkeletonCategoryAccordion } from '../../components/skeletons/SkeletonLayouts';
import {
    buildCategoryList,
    articleMatchesCategory,
    getCategoryIcon,
} from '../../utils/categoryMatch';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { patchArticleVoteRow, reactionApiValue } from '../../utils/reactionVote';
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

const CategoriesScreen = () => {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const navigate = useNavigate();
    const [allNews, setAllNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [categorySearch, setCategorySearch] = useState('');
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    // expandedCategory: name of the currently open accordion item (one at a time)
    const [expandedCategory, setExpandedCategory] = useState(null);
    // whether the "More categories" section is open
    const [showMore, setShowMore] = useState(false);

    const loadNews = async () => {
        try {
            setLoading(true);
            setNextCursor('');
            setHasMore(false);
            const [plat, page] = await Promise.all([
                fetchPlatformCategories().catch(() => ({ categories: [], connections: [] })),
                loadExplorePage({ limit: 50, cursor: '' }),
            ]);
            const newsData = page.items || [];
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
            setAllNews(newsData);

            const adminNames = (plat.categories || []).map((c) =>
                typeof c === 'string' ? c : c?.name || c?.id || ''
            );
            const categoryList = buildCategoryList(newsData, adminNames);
            setCategories(categoryList);
        } catch (error) {
            console.error('Error loading categories:', error);
            setAllNews([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await loadExplorePage({ limit: 50, cursor: nextCursor });
            setAllNews((prev) => mergeUniqueById(prev, page.items || []));
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn('Load more failed:', e?.message);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor]);

    const scrollSentinelRef = useInfiniteScroll({
        onLoadMore: loadMore,
        hasMore,
        loading: loading || loadingMore,
    });

    const handleCategoryClick = (categoryName) => {
        setExpandedCategory((prev) => (prev === categoryName ? null : categoryName));
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
        setAllNews((prev) =>
            prev.map((n) => (String(n.id) !== id ? n : patchArticleVoteRow(n, previousVote, newVote)))
        );

        (async () => {
            try {
                const data = await setReaction(id, reactionApiValue(newVote));
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setAllNews((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: newVote }
                    )
                );
            } catch {
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null);
                setAllNews((prev) =>
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
        setBookmarkedItems((prev) => {
            const next = new Set([...prev].map(String));
            if (wasBookmarked) next.delete(id);
            else next.add(id);
            return next;
        });
        try {
            const article = allNews.find((n) => String(n.id) === id);
            if (wasBookmarked) await removeBookmark(id);
            else await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
        } catch (error) {
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

    // Pre-compute articles per category once (memoized)
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

    // Split into popular and "more" groups (only when not searching)
    const popularCategories = useMemo(() => {
        if (categorySearch.trim()) return searchedCategories;
        const popNames = new Set(POPULAR_CATEGORY_NAMES.map((n) => n.toLowerCase()));
        const popular = categories.filter((c) => popNames.has(c.name.toLowerCase()) && c.count > 0);
        // if none match by name, fall back to top-by-count
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
        : [...popularCategories, ...(showMore ? moreCategories : [])];

    return (
        <div style={{ minHeight: '100vh', backgroundColor, paddingTop: 0 }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '0 24px 24px' }}>
                {/* Header */}
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
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textPrimary }}>No categories with articles yet</p>
                        <p style={{ margin: '8px 0 0', fontSize: 14, color: textSecondary }}>Check back after more stories are indexed.</p>
                    </div>
                ) : (
                    <>
                        {/* Search bar */}
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
                                {categories.filter((c) => c.count > 0).length} categories
                            </span>
                        </div>

                        {/* Category accordion list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                            {categoriesToRender.map((category) => {
                                const isExpanded = expandedCategory === category.name;
                                const catArticles = articlesByCategory[category.name] || [];
                                const sortedArticles = [...catArticles].sort(
                                    (a, b) => articleSortTime(b) - articleSortTime(a)
                                );
                                const visibleArticles = sortedArticles.slice(0, ARTICLES_PREVIEW_COUNT);
                                const hiddenCount = sortedArticles.length - ARTICLES_PREVIEW_COUNT;

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
                                        {/* Category header row */}
                                        <button
                                            type="button"
                                            onClick={() => handleCategoryClick(category.name)}
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
                                                {category.count} {category.count === 1 ? 'article' : 'articles'}
                                            </span>
                                            {isExpanded
                                                ? <ChevronUp size={18} color={textSecondary} />
                                                : <ChevronDown size={18} color={textSecondary} />}
                                        </button>

                                        {/* Expanded article list */}
                                        {isExpanded && (
                                            <div style={{
                                                borderTop: `1px solid ${borderColor}`,
                                                padding: '20px',
                                                animation: 'trak-cat-expand 0.2s ease',
                                            }}>
                                                {catArticles.length === 0 ? (
                                                    <p style={{ margin: 0, fontSize: 14, color: textSecondary }}>
                                                        No articles found in this category.
                                                    </p>
                                                ) : (
                                                    <>
                                                        <MasonryFeed gap={16}>
                                                            {visibleArticles.map((item) => (
                                                                <NewsCard
                                                                    key={item.id}
                                                                    item={item}
                                                                    layout="masonry"
                                                                    onPress={() => handleArticlePress(item)}
                                                                    votedItems={votedItems}
                                                                    bookmarkedItems={bookmarkedItems}
                                                                    onVote={handleVote}
                                                                    onBookmark={handleBookmark}
                                                                />
                                                            ))}
                                                        </MasonryFeed>
                                                        {hiddenCount > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/categories/${encodeURIComponent(category.key)}`)}
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

                        {/* More categories toggle */}
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

                        <div ref={scrollSentinelRef} style={{ height: 1 }} aria-hidden />
                        {loadingMore && (
                            <p style={{ textAlign: 'center', color: textSecondary, padding: 16, fontSize: 14 }}>
                                Loading more…
                            </p>
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

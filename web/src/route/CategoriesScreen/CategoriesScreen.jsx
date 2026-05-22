import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { loadExplorePage, mergeUniqueById } from '../../utils/loadFeed';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { addBookmark, fetchPlatformCategories, removeBookmark, setReaction } from '../../utils/Service/api';
import { setReactionForArticle } from '../../utils/reactionsStorage';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { TrendingUp } from 'lucide-react';
import { SkeletonCategoryGrid, getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import {
    buildCategoryList,
    articleMatchesCategory,
    getCategoryIcon,
} from '../../utils/categoryMatch';
import { Search } from 'lucide-react';

const CategoriesScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const navigate = useNavigate();
    const [allNews, setAllNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [categorySearch, setCategorySearch] = useState('');
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

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
            setFilteredNews(newsData);
        } catch (error) {
            console.error("Error loading categories:", error);
            setAllNews([]);
            setCategories([]);
            setFilteredNews([]);
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

    useEffect(() => {
        if (selectedCategory) {
            setFilteredNews(allNews.filter((item) => articleMatchesCategory(item, selectedCategory)));
        } else {
            setFilteredNews(allNews);
        }
    }, [selectedCategory, allNews]);

    const visibleCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
    );
    const topCategories = categories.filter((c) => c.count > 0).slice(0, 10);

    const handleCategoryClick = (categoryName) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(categoryName);
        }
    };

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id];
        const newVote = previousVote === type ? null : type;

        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);

        try {
            await setReaction(
                id,
                newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none'
            );
        } catch (error) {
            setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
            setReactionForArticle(id, previousVote || null);
        }
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
            console.error('Error bookmarking:', error);
            setBookmarkedItems((prev) => {
                const next = new Set([...prev].map(String));
                if (wasBookmarked) next.add(id);
                else next.delete(id);
                return next;
            });
        }
    };

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '0 24px 24px 24px',
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        Categories
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Browse articles by category
                    </p>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div>
                        <SkeletonCategoryGrid count={8} isDark={isDark} colors={colors} />
                        <div style={{ marginTop: 28 }}>
                            <MasonryFeedSkeleton count={6} gap={24} {...getSkeletonFeedProps(isDark, colors)} />
                        </div>
                    </div>
                ) : categories.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px 24px',
                        marginBottom: 40,
                        borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: cardBackground,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textPrimary }}>
                            No categories with articles yet
                        </p>
                        <p style={{ margin: '8px 0 0', fontSize: 14, color: textSecondary }}>
                            Check back after more stories are indexed.
                        </p>
                    </div>
                ) : (
                    <div style={{ marginBottom: 40 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                            <div style={{
                                flex: '1 1 220px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: cardBackground,
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
                                {visibleCategories.length} of {categories.length} with articles
                            </span>
                        </div>
                        {topCategories.length > 0 && !categorySearch.trim() ? (
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Popular</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {topCategories.map((category) => {
                                        const isSelected = selectedCategory === category.name;
                                        return (
                                            <button key={`pill-${category.key}`} type="button" onClick={() => handleCategoryClick(category.name)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999,
                                                    border: isSelected ? `2px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}` : `1px solid ${borderColor}`,
                                                    background: isSelected ? (isDark ? colors.surfaceElevated || '#334155' : '#f1f5f9') : cardBackground,
                                                    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: textPrimary,
                                                }}>
                                                <span>{getCategoryIcon(category.name)}</span>
                                                <span>{category.name}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: textSecondary, background: isDark ? colors.background || '#0F172A' : '#e2e8f0', padding: '2px 8px', borderRadius: 999 }}>{category.count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                        {visibleCategories.length === 0 ? (
                            <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>No categories match &ldquo;{categorySearch}&rdquo;.</p>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '16px',
                            }}>
                                {visibleCategories.map((category) => {
                                    const isSelected = selectedCategory === category.name;
                                    return (
                                        <button
                                            key={category.key}
                                            type="button"
                                            onClick={() => handleCategoryClick(category.name)}
                                            style={{
                                                padding: '20px',
                                                border: isSelected
                                                    ? `2px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`
                                                    : `1px solid ${borderColor}`,
                                                background: isSelected
                                                    ? (isDark ? colors.surfaceElevated || '#334155' : '#f9fafb')
                                                    : cardBackground,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'left',
                                                boxShadow: isSelected
                                                    ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)')
                                                    : (isDark ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'),
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = borderColor;
                                                }
                                            }}
                                        >
                                            <div style={{ fontSize: 24, marginBottom: 12 }}>{getCategoryIcon(category.name)}</div>
                                            <div style={{ fontSize: 16, fontWeight: isSelected ? 700 : 600, color: textPrimary, marginBottom: 6 }}>
                                                {category.name}
                                            </div>
                                            <div style={{ fontSize: 13, color: textSecondary }}>
                                                {category.count} {category.count === 1 ? 'article' : 'articles'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Selected Category Articles */}
                {selectedCategory && (
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px',
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color: textPrimary,
                                    margin: '0 0 4px 0',
                                }}>
                                    {selectedCategory} Articles
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: textSecondary,
                                    margin: '0',
                                }}>
                                    {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'} found
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                style={{
                                    padding: '8px 16px',
                                    border: `1px solid ${borderColor}`,
                                    background: cardBackground,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                    e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = borderColor;
                                    e.currentTarget.style.backgroundColor = cardBackground;
                                }}
                            >
                                Clear Filter
                            </button>
                        </div>

                        {filteredNews.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 20px',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    margin: '0 0 8px 0',
                                }}>
                                    No articles in this category
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: textSecondary,
                                    margin: '0',
                                }}>
                                    Try selecting a different category
                                </p>
                            </div>
                        ) : (
                            <MasonryFeed gap={24}>
                                {filteredNews.map((item) => (
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
                        )}
                    </div>
                )}

                {/* Show all articles when no category selected */}
                {!selectedCategory && (
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0 0 24px 0',
                        }}>
                            All Articles
                        </h2>
                        <MasonryFeed gap={24}>
                            {allNews.map((item) => (
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
                        <div ref={scrollSentinelRef} style={{ height: 1 }} aria-hidden />
                        {loadingMore ? (
                            <p style={{ textAlign: 'center', color: textSecondary, padding: 16, fontSize: 14 }}>
                                Loading more…
                            </p>
                        ) : null}
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default CategoriesScreen;

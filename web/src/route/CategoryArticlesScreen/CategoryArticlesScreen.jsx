import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { loadCategoryPage, mergePageWithPaginationGuard } from '../../utils/loadFeed';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { addBookmark, removeBookmark, setReaction } from '../../utils/Service/api';
import { setReactionForArticle } from '../../utils/reactionsStorage';
import { getCategoryIcon, normalizeCategoryName } from '../../utils/categoryMatch';
import { patchArticleVoteRow, reactionApiValue } from '../../utils/reactionVote';

function slugToCategoryName(slug) {
    return normalizeCategoryName(String(slug || '').replace(/-/g, ' '));
}

const CategoryArticlesScreen = () => {
    const { categorySlug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile } = useResponsive();
    const categoryName = useMemo(() => slugToCategoryName(categorySlug), [categorySlug]);
    const categoryKey = String(categorySlug || '').trim().toLowerCase();

    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const newsDataRef = useRef(newsData);
    newsDataRef.current = newsData;
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [categoryTotal, setCategoryTotal] = useState(
        () => (location.state?.categoryCount != null ? Number(location.state.categoryCount) : null)
    );
    const emptyStreakRef = useRef(0);

    const loadNews = useCallback(async () => {
        if (!categoryKey) return;
        try {
            setLoading(true);
            setLoadError('');
            emptyStreakRef.current = 0;
            const page = await loadCategoryPage({ category: categoryKey, limit: 50, cursor: '' });
            setNewsData(page.items || []);
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
            if (page.categoryTotal != null) setCategoryTotal(Number(page.categoryTotal));
        } catch (error) {
            console.error('Error loading category articles:', error);
            setLoadError(error?.message || 'Could not load articles for this category.');
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    }, [categoryKey]);

    useEffect(() => {
        setCategoryTotal(location.state?.categoryCount != null ? Number(location.state.categoryCount) : null);
    }, [categoryKey, location.state?.categoryCount]);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor || !categoryKey) return;
        setLoadingMore(true);
        try {
            const page = await loadCategoryPage({ category: categoryKey, limit: 50, cursor: nextCursor });
            const { items, hasMore: more } = mergePageWithPaginationGuard(
                newsDataRef.current,
                page.items,
                Boolean(page.hasMore),
                emptyStreakRef,
            );
            setNewsData(items);
            setNextCursor(page.nextCursor || '');
            setHasMore(more);
        } catch (e) {
            console.warn('Load more failed:', e?.message);
        } finally {
            setLoadingMore(false);
        }
    }, [categoryKey, hasMore, loadingMore, nextCursor]);

    const scrollSentinelRef = useInfiniteScroll({
        onLoadMore: loadMore,
        hasMore,
        loading: loading || loadingMore,
    });

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id] ?? null;
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) !== id ? n : patchArticleVoteRow(n, previousVote, newVote)))
        );
        (async () => {
            try {
                const data = await setReaction(id, reactionApiValue(newVote));
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setNewsData((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: newVote }
                    )
                );
            } catch {
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null);
                setNewsData((prev) =>
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
            const article = newsData.find((n) => String(n.id) === id);
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

    return (
        <div style={{ minHeight: '100vh', backgroundColor: colors.background }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '0 16px 24px' : '0 24px 24px' }}>
                <button
                    type="button"
                    onClick={() => navigate('/categories')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 0',
                        border: 'none',
                        background: 'transparent',
                        color: colors.textSecondary,
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: 'pointer',
                        marginBottom: 16,
                    }}
                >
                    <ArrowLeft size={18} />
                    Back to categories
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <span style={{ fontSize: 32 }}>{getCategoryIcon(categoryName)}</span>
                    <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
                        {categoryName}
                    </h1>
                </div>
                <p style={{ fontSize: 14, color: colors.textSecondary, margin: '0 0 24px' }}>
                    {categoryTotal != null
                        ? `${categoryTotal} ${categoryTotal === 1 ? 'article' : 'articles'} in this category`
                        : `All articles related to ${categoryName}.`}
                </p>
                {loading ? (
                    <MasonryFeedSkeleton count={isMobile ? 4 : 6} gap={24} {...getSkeletonFeedProps(isDark, colors)} />
                ) : loadError ? (
                    <p style={{ color: colors.textSecondary, fontSize: 14 }}>{loadError}</p>
                ) : newsData.length === 0 ? (
                    <p style={{ color: colors.textSecondary, fontSize: 14 }}>No articles found in this category yet.</p>
                ) : (
                    <>
                        <MasonryFeed gap={24}>
                            {newsData.map((item) => (
                                <NewsCard
                                    key={String(item.id)}
                                    item={item}
                                    onPress={() => handleArticlePress(item)}
                                    votedItems={votedItems}
                                    bookmarkedItems={bookmarkedItems}
                                    onVote={handleVote}
                                    onBookmark={handleBookmark}
                                    layout="masonry"
                                />
                            ))}
                        </MasonryFeed>
                        <div ref={scrollSentinelRef} style={{ height: 1 }} aria-hidden />
                        {loadingMore && (
                            <p style={{ textAlign: 'center', color: colors.textSecondary, padding: 16, fontSize: 14 }}>
                                Loading more…
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CategoryArticlesScreen;

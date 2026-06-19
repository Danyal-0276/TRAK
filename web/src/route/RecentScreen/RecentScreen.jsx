import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { useTheme } from '../../theme/ThemeContext';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { loadExplorePage, mergePageWithPaginationGuard } from '../../utils/loadFeed';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { setReaction, addBookmark, removeBookmark } from '../../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, setReactionForArticle } from '../../utils/reactionsStorage';
import { patchArticleVoteRow, reactionApiValue } from '../../utils/reactionVote';
import { emitArticleInteractionChange } from '../../utils/articleInteractionEvents';
import { useSyncFeedInteractionsOnNavigate } from '../../hooks/useSyncFeedInteractionsOnNavigate';

function recencySortKey(item) {
    const s = item?.time || item?.published_at || '';
    const ms = Date.parse(String(s));
    return Number.isNaN(ms) ? 0 : ms;
}

const RecentScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme.mode === 'dark';
    const { colors } = theme;
    const pageBg = colors.background;
    const headingColor = colors.textPrimary;
    const subColor = colors.textSecondary;
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const emptyStreakRef = useRef(0);
    const newsDataRef = useRef(newsData);
    newsDataRef.current = newsData;

    useSyncFeedInteractionsOnNavigate({ setVotedItems, setBookmarkedItems, setNewsData });

    const sortRecent = (items) =>
        [...(items || [])].sort((a, b) => recencySortKey(b) - recencySortKey(a));

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError('');
            emptyStreakRef.current = 0;
            const page = await loadExplorePage({ limit: 50, cursor: '' });
            setNewsData(sortRecent(page.items));
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (error) {
            console.error('Error loading recent news:', error);
            setLoadError(error?.message || 'Could not load recent articles.');
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
        setBookmarkedItems(new Set(getBookmarkIds().map(String)));
        setVotedItems(getReactionMap());
    }, [loadNews]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await loadExplorePage({ limit: 50, cursor: nextCursor });
            const { items, hasMore: more } = mergePageWithPaginationGuard(
                newsDataRef.current,
                page.items,
                Boolean(page.hasMore),
                emptyStreakRef,
            );
            setNewsData(sortRecent(items));
            setNextCursor(page.nextCursor || '');
            setHasMore(more);
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
        const nextBm = !wasBookmarked;
        const newSet = new Set(bookmarkedItems);
        if (nextBm) newSet.add(id);
        else newSet.delete(id);
        setBookmarkedItems(newSet);
        setBookmarkIds(Array.from(newSet));
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) === id ? { ...n, isBookmarked: nextBm } : n))
        );
        emitArticleInteractionChange({ articleId: id, isBookmarked: nextBm });
        try {
            const article = newsData.find((n) => String(n.id) === id);
            if (wasBookmarked) await removeBookmark(id);
            else await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
        } catch (error) {
            console.error('Error bookmarking:', error);
            const rollback = new Set(bookmarkedItems);
            setBookmarkedItems(rollback);
            setBookmarkIds(Array.from(rollback));
            emitArticleInteractionChange({ articleId: id, isBookmarked: wasBookmarked });
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: pageBg,
        }}>
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: headingColor }}>Recent</h1>
            <p style={{ color: subColor, marginBottom: '24px' }}>Latest processed articles</p>

            {loading ? (
                <MasonryFeedSkeleton count={6} gap={24} {...getSkeletonFeedProps(isDark, colors)} />
            ) : loadError ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                    <p style={{ color: subColor, marginBottom: 16 }}>{loadError}</p>
                    <button
                        type="button"
                        onClick={loadNews}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            borderRadius: 8,
                            border: `1px solid ${colors.border}`,
                            background: colors.surface,
                            color: headingColor,
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : newsData.length === 0 ? (
                <p style={{ textAlign: 'center', color: subColor, padding: 48 }}>No recent articles yet.</p>
            ) : (
                <>
                    <MasonryFeed gap={24}>
                        {newsData.map((item) => (
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
                        <p style={{ textAlign: 'center', color: subColor, padding: 16 }}>Loading more…</p>
                    ) : null}
                </>
            )}
        </div>
        </div>
    );
};

export default RecentScreen;

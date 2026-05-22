import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { useTheme } from '../../theme/ThemeContext';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { loadExplorePage, mergeUniqueById } from '../../utils/loadFeed';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

const TrendingScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError('');
            const page = await loadExplorePage({ limit: 50, cursor: '' });
            const trending = (page.items || []).filter((item) => item.trending);
            setNewsData(trending);
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (error) {
            console.error('Error loading trending news:', error);
            setLoadError(error?.message || 'Could not load trending articles.');
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await loadExplorePage({ limit: 50, cursor: nextCursor });
            const trending = (page.items || []).filter((item) => item.trending);
            setNewsData((prev) => mergeUniqueById(prev, trending));
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

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = async (itemId, type) => {
        const previousVote = votedItems[itemId];
        const newVote = previousVote === type ? null : type;
        setVotedItems((prev) => ({ ...prev, [itemId]: newVote }));
    };

    const handleBookmark = async (itemId) => {
        const newSet = new Set(bookmarkedItems);
        if (newSet.has(itemId)) newSet.delete(itemId);
        else newSet.add(itemId);
        setBookmarkedItems(newSet);
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Trending</h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>Articles flagged as trending or high-interest</p>

            {loading ? (
                <MasonryFeedSkeleton count={6} gap={24} {...getSkeletonFeedProps(theme.mode === 'dark', theme.colors)} />
            ) : loadError ? (
                <div style={{ textAlign: 'center', padding: 48 }}>
                    <p style={{ color: '#64748b', marginBottom: 16 }}>{loadError}</p>
                    <button type="button" onClick={loadNews} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                        Retry
                    </button>
                </div>
            ) : newsData.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: 48 }}>No trending articles right now.</p>
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
                        <p style={{ textAlign: 'center', color: '#64748b', padding: 16 }}>Loading more…</p>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default TrendingScreen;

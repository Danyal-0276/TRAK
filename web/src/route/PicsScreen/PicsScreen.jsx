import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { useTheme } from '../../theme/ThemeContext';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { loadPicsPage, mergeUniqueById } from '../../utils/loadFeed';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';

const PicsScreen = () => {
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

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError('');
            const page = await loadPicsPage({ limit: 50, cursor: '' });
            setNewsData(page.items || []);
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (error) {
            console.error('Error loading pics feed:', error);
            setLoadError(error?.message || 'Could not load visual stories.');
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
            const page = await loadPicsPage({ limit: 50, cursor: nextCursor });
            setNewsData((prev) => mergeUniqueById(prev, page.items || []));
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
        <div style={{ minHeight: '100vh', backgroundColor: pageBg }}>
            <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: headingColor }}>
                    Pics
                </h1>
                <p style={{ color: subColor, marginBottom: '24px' }}>
                    Visual stories from TRAK — articles with hero images
                </p>

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
                    <p style={{ textAlign: 'center', color: subColor, padding: 48 }}>
                        No image stories available right now.
                    </p>
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

export default PicsScreen;

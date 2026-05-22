import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { addBookmark, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { useUserKeywords } from '../../context/UserKeywordsContext';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { loadExplorePage, loadFeedPage, mergeUniqueById } from '../../utils/loadFeed';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { mapApiItem } from '../../utils/loadFeed';
import { getCardSummaryText } from '../../utils/articleNavigation';
import { openArticleDetail } from '../../utils/openArticleDetail';

const NewsFeedScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const rawTab = searchParams.get('tab');
    const normalizedTab =
        rawTab === 'Following' || rawTab === 'Recent' ? 'For you' : rawTab || 'For you';
    const [activeTab, setActiveTab] = useState(
        ['For you', 'Bookmarks', 'Trending'].includes(normalizedTab) ? normalizedTab : 'For you'
    );
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedError, setFeedError] = useState('');
    const { keywords: feedKeywords } = useUserKeywords();
    const personalizedFeed = useMemo(
        () => (feedKeywords || []).length > 0,
        [(feedKeywords || []).join('\x1f')]
    );
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const mapFeedResults = (rawItems, reactionMap) =>
        (rawItems || []).map((item, idx) => {
                const aid = item.id || item.canonical_url || String(idx);
                const likes = Number(item.like_count ?? item.upvotes ?? 0);
                const dislikes = Number(item.dislike_count ?? 0);
                const summaryText = getCardSummaryText(item);
                return {
                    ...item,
                    id: aid,
                    description: summaryText,
                    excerpt: item.excerpt || item.summary || summaryText,
                    summary: item.summary || item.excerpt || summaryText,
                    content: item.content || item.full_content || '',
                    fullContent: item.full_content || item.content || '',
                    category: (item.topic_keywords?.[0] || item.category || 'General').toString().toUpperCase(),
                    source: item.source || item.source_key || '',
                    time: item.published_at ? new Date(item.published_at).toLocaleString() : 'Recently',
                    like_count: likes,
                    dislike_count: dislikes,
                    upvotes: likes,
                    verified: item.credibility?.label === 'real' || Boolean(item.verified),
                    trending: Boolean(item.topic_keywords?.length),
                    userReaction: reactionMap[String(aid)] || null,
                };
        });

    const fetchFeedPage = useCallback(
        async (cursor = '') => {
            if (personalizedFeed) {
                return loadFeedPage({ limit: 50, cursor });
            }
            return loadExplorePage({ limit: 50, cursor });
        },
        [personalizedFeed]
    );

    const loadNews = useCallback(async () => {
        try {
            setLoading(true);
            setFeedError('');
            setNextCursor('');
            setHasMore(false);

            const cachedBookmarks = new Set(getBookmarkIds());
            if (cachedBookmarks.size) setBookmarkedItems(cachedBookmarks);
            const cachedReactions = getReactionMap();
            if (Object.keys(cachedReactions).length) setVotedItems(cachedReactions);

            let loadErr = '';
            let page = { items: [], nextCursor: '', hasMore: false };
            try {
                page = await fetchFeedPage('');
            } catch (e) {
                loadErr = e?.message || 'Could not load articles from the API.';
                console.warn('Feed failed:', loadErr);
            }

            const [bookmarks, reactions] = await Promise.all([
                listBookmarks().catch(() => ({ results: [] })),
                listReactions().catch(() => ({ results: [] })),
            ]);
            const bookmarked = new Set((bookmarks.results || []).map((b) => String(b.article_id)));
            const reactionMap = mergeReactionRows(reactions.results || [], { replace: false });

            if (!page.items.length && !loadErr) {
                loadErr =
                    'No articles in the database yet. Run the news pipeline on your local backend, or set VITE_API_URL to the deployed API in .env.';
            }
            if (loadErr) setFeedError(loadErr);

            setNewsData(mapFeedResults(page.items, reactionMap));
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
            setBookmarkedItems(bookmarked);
            setBookmarkIds(Array.from(bookmarked));
            setVotedItems(reactionMap);
        } catch (error) {
            console.error('Error loading news:', error);
            setFeedError(error?.message || 'Failed to load the feed.');
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    }, [fetchFeedPage]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await fetchFeedPage(nextCursor);
            const reactionMap = { ...votedItems, ...getReactionMap() };
            setNewsData((prev) => mapFeedResults(mergeUniqueById(prev, page.items), reactionMap));
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn('Load more failed:', e?.message);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor, fetchFeedPage, votedItems]);

    const scrollSentinelRef = useInfiniteScroll({
        onLoadMore: loadMore,
        hasMore,
        loading: loading || loadingMore,
    });

    useEffect(() => {
        loadNews();
    }, [loadNews]);

    useEffect(() => {
        if (rawTab) {
            const t =
                rawTab === 'Following' || rawTab === 'Recent' ? 'For you' : rawTab;
            if (['For you', 'Bookmarks', 'Trending'].includes(t)) setActiveTab(t);
        }
    }, [rawTab]);

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id];
        const newVote = previousVote === type ? null : type;

        setVotedItems((prev) => ({
            ...prev,
            [id]: newVote,
        }));
        setReactionForArticle(id, newVote);

        try {
            const data = await setReaction(
                id,
                newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none'
            );
            const likes = Number(data.like_count ?? 0);
            const dislikes = Number(data.dislike_count ?? 0);
            setNewsData((prev) =>
                prev.map((n) =>
                    String(n.id) !== id
                        ? n
                        : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes }
                )
            );
            setSelectedArticle((prev) =>
                prev && String(prev.id) === id
                    ? { ...prev, like_count: likes, dislike_count: dislikes, upvotes: likes }
                    : prev
            );
        } catch (error) {
            setVotedItems((prev) => ({
                ...prev,
                [id]: previousVote,
            }));
            setReactionForArticle(id, previousVote || null);
        }
    };

    const handleBookmark = async (itemId) => {
        const id = String(itemId);
        const article = newsData.find((n) => String(n.id) === id);
        const wasBookmarked = bookmarkedItems.has(id);
        setBookmarkedItems((prev) => {
            const newSet = new Set([...prev].map(String));
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            setBookmarkIds(Array.from(newSet));
            return newSet;
        });

        try {
            if (wasBookmarked) {
                await removeBookmark(id);
            } else {
                await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
            setBookmarkedItems((prev) => {
                const rollback = new Set([...prev].map(String));
                if (rollback.has(id)) rollback.delete(id);
                else rollback.add(id);
                setBookmarkIds(Array.from(rollback));
                return rollback;
            });
        }
    };

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    const visibleNews = useMemo(() => {
        if (activeTab === 'Bookmarks') {
            return newsData.filter((n) => bookmarkedItems.has(String(n.id)) || bookmarkedItems.has(n.id));
        }
        if (activeTab === 'Trending') {
            return [...newsData].sort((a, b) => {
                const ak = (a.topic_keywords?.length || 0) + (a.trending ? 2 : 0);
                const bk = (b.topic_keywords?.length || 0) + (b.trending ? 2 : 0);
                return bk - ak;
            });
        }
        if (activeTab === 'For you') {
            return newsData;
        }
        return newsData;
    }, [newsData, activeTab, bookmarkedItems]);

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
                padding: isMobile ? '0 16px 16px 16px' : isTablet ? '0 20px 20px 20px' : '0 24px 24px 24px',
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: isMobile ? '16px' : '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: isMobile ? '22px' : isTablet ? '24px' : '28px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        Latest News & Articles
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Discover trending stories, insights, and updates from around the world
                    </p>
                </div>

                {/* Tab Bar */}
                <div style={{
                    display: 'flex',
                    gap: isMobile ? '4px' : '8px',
                    marginBottom: isMobile ? '20px' : '32px',
                    borderBottom: `1px solid ${borderColor}`,
                    paddingBottom: '0',
                    overflowX: isMobile ? 'auto' : 'visible',
                    WebkitOverflowScrolling: 'touch',
                }}>
                    {['For you', 'Bookmarks', 'Trending'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: isMobile ? '8px 12px' : '10px 16px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                borderBottom: activeTab === tab 
                                    ? `2px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}` 
                                    : '2px solid transparent',
                                marginBottom: '-1px',
                                borderRadius: '0',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab) {
                                    e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{
                                fontSize: '14px',
                                fontWeight: activeTab === tab ? '600' : '500',
                                color: activeTab === tab 
                                    ? (isDark ? colors.primary || '#818CF8' : '#0f172a')
                                    : textSecondary,
                            }}>
                                {tab}
                            </span>
                        </button>
                    ))}
                </div>

                {/* News Cards Grid */}
                {loading ? (
                    <MasonryFeedSkeleton
                        count={isMobile ? 6 : 12}
                        gap={isMobile ? 16 : isTablet ? 20 : 24}
                        {...getSkeletonFeedProps(isDark, colors)}
                    />
                ) : visibleNews.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '32px 16px' : '48px 24px',
                        maxWidth: '520px',
                        margin: '0 auto',
                    }}>
                        {feedError ? (
                            <>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, marginBottom: '8px' }}>
                                    Could not load the feed
                                </h2>
                                <p style={{ fontSize: '15px', color: textSecondary, lineHeight: 1.5, marginBottom: '16px' }}>
                                    {feedError}
                                </p>
                                <p style={{ fontSize: '13px', color: textSecondary, lineHeight: 1.5, marginBottom: '20px' }}>
                                    Log in, ensure Django is running at {import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}, and that processed articles exist in MongoDB. To match Netlify data locally, use the Render URL in <code style={{ fontSize: '12px' }}>TRAK/web/.env</code>.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => loadNews()}
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                    }}
                                >
                                    Retry
                                </button>
                            </>
                        ) : activeTab === 'For you' && !hasFeedPersonalization ? (
                            <>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, marginBottom: '8px' }}>
                                    Choose your interests
                                </h2>
                                <p style={{ fontSize: '15px', color: textSecondary, lineHeight: 1.5, marginBottom: '20px' }}>
                                    Select news categories to see a personalized For You feed.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/tag-selection', { state: { fromSettings: true } })}
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                    }}
                                >
                                    Pick categories
                                </button>
                            </>
                        ) : activeTab === 'For you' && hasFeedPersonalization ? (
                            <p style={{ fontSize: '16px', color: textSecondary, lineHeight: 1.5 }}>
                                No articles match your interests yet. Try adding more categories or keywords, then refresh.
                            </p>
                        ) : (
                            <p style={{ fontSize: '16px', color: textSecondary }}>
                                {activeTab === 'Bookmarks' ? 'No bookmarked articles yet.' : 'No articles to show.'}
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <MasonryFeed gap={isMobile ? 16 : isTablet ? 20 : 24}>
                            {visibleNews.map((item) => (
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
                        <div ref={scrollSentinelRef} style={{ height: 1, width: '100%' }} aria-hidden />
                        {loadingMore ? (
                            <p style={{ textAlign: 'center', color: textSecondary, padding: '16px 0', fontSize: 14 }}>
                                Loading more…
                            </p>
                        ) : null}
                    </>
                )}
            </div>


            <style>{`
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default NewsFeedScreen;

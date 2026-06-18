import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { setReaction } from '../../utils/Service/api';
import { useUserKeywords } from '../../context/UserKeywordsContext';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { loadExplorePage, loadFeedPage, mergeUniqueById } from '../../utils/loadFeed';
import { loadHomeBootstrap } from '../../utils/loadHomeBootstrap';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, setReactionForArticle } from '../../utils/reactionsStorage';
import { getCardSummaryText } from '../../utils/articleNavigation';
import { openArticleDetail } from '../../utils/openArticleDetail';
import { useFeedCache } from '../../context/FeedCacheContext';
import { filterFeedByUserKeywords } from '../../utils/feedKeywordMatch';
import { resolveArticleImageUrl } from '../../utils/articleMedia';
import { useLanguage } from '../../context/LanguageContext';
import { patchArticleVoteRow } from '../../utils/reactionVote';
import { useArticleInteractionListener, emitArticleInteractionChange } from '../../utils/articleInteractionEvents';
import {
    toggleVoteRegistered,
    scheduleVotePersist,
    seedVoteRegistry,
    setRegisteredVote,
} from '../../utils/articleVoteController';
import {
    applyOptimisticBookmarkToggle,
    queueBookmarkApi,
    rollbackBookmarkToggle,
} from '../../utils/articleBookmarkController';
import { API_BASE, API_ORIGIN } from '../../config/api';
import { syncFeedInteractionsFromStorage } from '../../utils/syncFeedInteractions';
import { loadBookmarkFeedItems } from '../../utils/loadBookmarkFeedItems';
import { buildBookmarksTabNews, patchBookmarkTabItems } from '../../utils/buildBookmarksTabNews';

const FEED_TAB_KEYS = {
    'For you': 'feed.forYou',
    Bookmarks: 'feed.bookmarks',
    Trending: 'feed.trending',
};

const NewsFeedScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const rawTab = searchParams.get('tab');
    const normalizedTab =
        rawTab === 'Following' || rawTab === 'Recent' ? 'For you' : rawTab || 'For you';
    const [activeTab, setActiveTab] = useState(
        ['For you', 'Bookmarks', 'Trending'].includes(normalizedTab) ? normalizedTab : 'For you'
    );
    const { getHomeFeed, saveHomeFeed, isFresh } = useFeedCache();
    const restoredRef = useRef(false);

    const cachedHome = getHomeFeed();
    const hasCachedHome = isFresh(cachedHome) && Array.isArray(cachedHome?.newsData) && cachedHome.newsData.length > 0;

    const [bookmarkedItems, setBookmarkedItems] = useState(
        () => (hasCachedHome ? new Set(cachedHome.bookmarkIds || []) : new Set())
    );
    const [votedItems, setVotedItems] = useState(() => (hasCachedHome ? cachedHome.votedItems || {} : {}));
    const [newsData, setNewsData] = useState(() => (hasCachedHome ? cachedHome.newsData : []));
    const newsDataRef = useRef(newsData);
    newsDataRef.current = newsData;
    const [loading, setLoading] = useState(!hasCachedHome);
    const [feedError, setFeedError] = useState(() => (hasCachedHome ? cachedHome.feedError || '' : ''));
    const { keywords: feedKeywords } = useUserKeywords();
    const hasFeedPersonalization = useMemo(
        () => (feedKeywords || []).length > 0,
        [(feedKeywords || []).join('\x1f')]
    );
    const [nextCursor, setNextCursor] = useState(() => (hasCachedHome ? cachedHome.nextCursor || '' : ''));
    const [hasMore, setHasMore] = useState(() => (hasCachedHome ? Boolean(cachedHome.hasMore) : false));
    const [loadingMore, setLoadingMore] = useState(false);
    const [bookmarkTabItems, setBookmarkTabItems] = useState([]);
    const [bookmarksTabLoading, setBookmarksTabLoading] = useState(false);

    const feedModeRef = useRef(hasCachedHome ? cachedHome.feedMode || 'explore' : 'explore');
    const loadAbortRef = useRef(null);

    const mapFeedResults = (rawItems, reactionMap) =>
        (rawItems || []).map((item, idx) => {
            const aid = item.id || item.canonical_url || String(idx);
            const likes = Number(item.like_count ?? item.upvotes ?? 0);
            const dislikes = Number(item.dislike_count ?? 0);
            const summaryText = getCardSummaryText(item);
            const imageUrl = resolveArticleImageUrl(item);
            return {
                ...item,
                id: aid,
                image_url: item.image_url || imageUrl || null,
                image: imageUrl || undefined,
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

    const fetchFeedPage = useCallback(async (cursor = '') => {
        if (feedModeRef.current === 'feed') {
            return loadFeedPage({ limit: 50, cursor });
        }
        return loadExplorePage({ limit: 50, cursor });
    }, []);

    const loadNews = useCallback(async ({ force = false } = {}) => {
        const cached = getHomeFeed();
        if (!force && isFresh(cached) && Array.isArray(cached?.newsData) && cached.newsData.length) {
            setNewsData(cached.newsData);
            setNextCursor(cached.nextCursor || '');
            setHasMore(Boolean(cached.hasMore));
            setVotedItems(cached.votedItems || {});
            setBookmarkedItems(new Set(cached.bookmarkIds || []));
            setBookmarkIds(cached.bookmarkIds || []);
            feedModeRef.current = cached.feedMode || 'explore';
            setFeedError(cached.feedError || '');
            setLoading(false);
            if (cached.scrollY) {
                requestAnimationFrame(() => window.scrollTo(0, cached.scrollY));
            }
            return;
        }

        if (loadAbortRef.current) {
            loadAbortRef.current.abort();
        }
        const ac = new AbortController();
        loadAbortRef.current = ac;

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
            let reactionMap = cachedReactions;
            let bookmarked = cachedBookmarks;

            try {
                const boot = await loadHomeBootstrap({ limit: 50 });
                if (ac.signal.aborted) return;

                feedModeRef.current = boot.feedMode;
                page = {
                    items: boot.items,
                    nextCursor: boot.nextCursor,
                    hasMore: boot.hasMore,
                };
                reactionMap = boot.reactionMap;
                bookmarked = boot.bookmarked;
            } catch (e) {
                loadErr = e?.message || 'Could not load articles from the API.';
                console.warn('Feed failed:', loadErr);
            }

            if (ac.signal.aborted) return;

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
            seedVoteRegistry(reactionMap);
        } catch (error) {
            if (!ac.signal.aborted) {
                console.error('Error loading news:', error);
                setFeedError(error?.message || 'Failed to load the feed.');
                setNewsData([]);
            }
        } finally {
            if (!ac.signal.aborted) {
                setLoading(false);
            }
        }
    }, [getHomeFeed, isFresh]);

    const persistHomeFeed = useCallback(() => {
        if (!newsData.length) return;
        saveHomeFeed({
            newsData,
            nextCursor,
            hasMore,
            votedItems,
            bookmarkIds: Array.from(bookmarkedItems),
            feedMode: feedModeRef.current,
            feedError,
            scrollY: window.scrollY,
            activeTab,
        });
    }, [newsData, nextCursor, hasMore, votedItems, bookmarkedItems, feedError, activeTab, saveHomeFeed]);

    useEffect(() => {
        persistHomeFeed();
    }, [persistHomeFeed]);

    useEffect(() => {
        return () => {
            if (newsData.length) {
                saveHomeFeed({
                    newsData,
                    nextCursor,
                    hasMore,
                    votedItems,
                    bookmarkIds: Array.from(bookmarkedItems),
                    feedMode: feedModeRef.current,
                    feedError,
                    scrollY: window.scrollY,
                    activeTab,
                });
            }
        };
    }, [newsData, nextCursor, hasMore, votedItems, bookmarkedItems, feedError, activeTab, saveHomeFeed]);

    useEffect(() => {
        if (restoredRef.current || !hasCachedHome) return;
        restoredRef.current = true;
        if (cachedHome.scrollY) {
            requestAnimationFrame(() => window.scrollTo(0, cachedHome.scrollY));
        }
    }, [hasCachedHome, cachedHome]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await fetchFeedPage(nextCursor);
            const reactionMap = getReactionMap();
            setNewsData((prev) => mapFeedResults(mergeUniqueById(prev, page.items), reactionMap));
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn('Load more failed:', e?.message);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor, fetchFeedPage]);

    const scrollSentinelRef = useInfiniteScroll({
        onLoadMore: loadMore,
        hasMore,
        loading: loading || loadingMore,
    });

    useEffect(() => {
        if (hasCachedHome) return;
        loadNews();
        return () => {
            loadAbortRef.current?.abort();
        };
    }, [loadNews, hasCachedHome]);

    useEffect(() => {
        const t =
            rawTab === 'Following' || rawTab === 'Recent'
                ? 'For you'
                : rawTab || 'For you';
        if (['For you', 'Bookmarks', 'Trending'].includes(t)) {
            setActiveTab(t);
        }
    }, [rawTab]);

    const handleTabChange = useCallback(
        (tab) => {
            setActiveTab(tab);
            if (tab === 'For you') {
                setSearchParams({}, { replace: true });
            } else {
                setSearchParams({ tab }, { replace: true });
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        [setSearchParams]
    );

    useArticleInteractionListener({
        setVotedItems,
        setBookmarkedItems,
        onArticlesPatch: setNewsData,
        setBookmarkTabItems,
    });

    useEffect(() => {
        syncFeedInteractionsFromStorage({
            setVotedItems,
            setBookmarkedItems,
            setNewsData,
        });
    }, [location.key]);

    useEffect(() => {
        if (activeTab !== 'Bookmarks') return undefined;
        let cancelled = false;
        setBookmarksTabLoading(true);
        (async () => {
            try {
                const items = await loadBookmarkFeedItems();
                if (cancelled) return;
                setBookmarkTabItems(items);
                const storedSet = new Set(getBookmarkIds().map(String));
                setBookmarkedItems(storedSet);
                setBookmarkTabItems(items.filter((item) => storedSet.has(String(item.id))));
            } catch (e) {
                console.warn('Bookmark tab load failed:', e?.message || e);
            } finally {
                if (!cancelled) setBookmarksTabLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [activeTab]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState !== 'visible') return;
            syncFeedInteractionsFromStorage({
                setVotedItems,
                setBookmarkedItems,
                setNewsData,
            });
        };
        document.addEventListener('visibilitychange', onVisible);
        return () => document.removeEventListener('visibilitychange', onVisible);
    }, []);

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = (itemId, type) => {
        const id = String(itemId || '').trim();
        if (!id) return;

        const { previousVote, newVote, changed } = toggleVoteRegistered(id, type);
        if (!changed) return;
        const articleRow = newsDataRef.current.find((n) => String(n.id) === id) || {};
        const optimistic = patchArticleVoteRow(articleRow, previousVote, newVote);

        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);
        setNewsData((prev) =>
            prev.map((n) => (String(n.id) !== id ? n : optimistic))
        );
        emitArticleInteractionChange({
            articleId: id,
            userReaction: newVote,
            like_count: optimistic.like_count,
            dislike_count: optimistic.dislike_count,
        });

        scheduleVotePersist(id, {
            persist: (articleId, apiValue) => setReaction(articleId, apiValue),
            onReconcile: (data, vote) => {
                const likes = Number(data.like_count ?? 0);
                const dislikes = Number(data.dislike_count ?? 0);
                setNewsData((prev) =>
                    prev.map((n) =>
                        String(n.id) !== id
                            ? n
                            : { ...n, like_count: likes, dislike_count: dislikes, upvotes: likes, userReaction: vote }
                    )
                );
                emitArticleInteractionChange({
                    articleId: id,
                    userReaction: vote,
                    like_count: likes,
                    dislike_count: dislikes,
                });
            },
            onRollback: () => {
                setRegisteredVote(id, previousVote);
                setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
                setReactionForArticle(id, previousVote || null);
                const rollback = patchArticleVoteRow(optimistic, newVote, previousVote);
                setNewsData((prev) =>
                    prev.map((n) => (String(n.id) !== id ? n : rollback))
                );
                emitArticleInteractionChange({
                    articleId: id,
                    userReaction: previousVote,
                    like_count: rollback.like_count,
                    dislike_count: rollback.dislike_count,
                });
            },
        });
    };

    const handleBookmark = (itemId) => {
        const id = String(itemId || '').trim();
        if (!id) return;
        const article =
            newsDataRef.current.find((n) => String(n.id) === id) ||
            bookmarkTabItems.find((n) => String(n.id) === id);
        const { wasBookmarked, isBookmarked } = applyOptimisticBookmarkToggle({
            articleId: id,
            article,
            setBookmarkedItems,
            setNewsData,
            removeFromListOnUnbookmark: activeTab === 'Bookmarks',
        });
        patchBookmarkTabItems(setBookmarkTabItems, {
            articleId: id,
            isBookmarked,
            article,
        });

        queueBookmarkApi(id, wasBookmarked ? 'remove' : 'add', article).catch((error) => {
            console.error('Error bookmarking:', error);
            rollbackBookmarkToggle({
                articleId: id,
                wasBookmarked,
                article,
                setBookmarkedItems,
                setNewsData,
            });
            patchBookmarkTabItems(setBookmarkTabItems, {
                articleId: id,
                isBookmarked: wasBookmarked,
                article,
            });
        });
    };

    const backgroundColor = colors.background;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const borderColor = colors.border;

    const visibleNews = useMemo(() => {
        if (activeTab === 'Bookmarks') {
            return buildBookmarksTabNews(newsData, bookmarkedItems, bookmarkTabItems, votedItems);
        }
        if (activeTab === 'Trending') {
            return [...newsData].sort((a, b) => {
                const ak = (a.topic_keywords?.length || 0) + (a.trending ? 2 : 0);
                const bk = (b.topic_keywords?.length || 0) + (b.trending ? 2 : 0);
                return bk - ak;
            });
        }
        // "For you" tab: filter to user's selected topics/keywords when available
        if (hasFeedPersonalization && feedKeywords?.length) {
            const filtered = filterFeedByUserKeywords(newsData, feedKeywords);
            // Fall back to all articles if none match (avoids empty feed surprise)
            return filtered.length > 0 ? filtered : newsData;
        }
        return newsData;
    }, [newsData, activeTab, bookmarkedItems, bookmarkTabItems, votedItems, hasFeedPersonalization, feedKeywords]);

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
                        Discover real news, insights, and updates from around the world
                    </p>
                </div>

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
                            onClick={() => handleTabChange(tab)}
                            style={{
                                padding: isMobile ? '8px 12px' : '10px 16px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                borderBottom: activeTab === tab
                                    ? `2px solid ${colors.primary}`
                                    : '2px solid transparent',
                                marginBottom: '-1px',
                                borderRadius: '0',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                        >
                            <span style={{
                                fontSize: '14px',
                                fontWeight: activeTab === tab ? '600' : '500',
                                color: activeTab === tab
                                    ? (colors.primary)
                                    : textSecondary,
                            }}>
                                {t(FEED_TAB_KEYS[tab] || tab)}
                            </span>
                        </button>
                    ))}
                </div>

                {loading || (activeTab === 'Bookmarks' && bookmarksTabLoading && !visibleNews.length) ? (
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
                                    {t('feed.couldNotLoad')}
                                </h2>
                                <p style={{ fontSize: '15px', color: textSecondary, lineHeight: 1.5, marginBottom: '16px' }}>
                                    {feedError}
                                </p>
                                <p style={{ fontSize: '13px', color: textSecondary, lineHeight: 1.5, marginBottom: '20px' }}>
                                    Log in and ensure the API is reachable at {API_ORIGIN || API_BASE || 'this site'}/api. Processed articles must exist in MongoDB (run the pipeline on the VPS or locally).
                                </p>
                                <button
                                    type="button"
                                    onClick={() => loadNews({ force: true })}
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: colors.primary,
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                    }}
                                >
                                    {t('feed.retry')}
                                </button>
                            </>
                        ) : activeTab === 'For you' && !hasFeedPersonalization ? (
                            <>
                                <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, marginBottom: '8px' }}>
                                    {t('feed.chooseInterests')}
                                </h2>
                                <p style={{ fontSize: '15px', color: textSecondary, lineHeight: 1.5, marginBottom: '20px' }}>
                                    {t('feed.chooseInterestsDesc')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => navigate('/tag-selection', { state: { fromSettings: true } })}
                                    style={{
                                        padding: '12px 20px',
                                        backgroundColor: colors.primary,
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '15px',
                                    }}
                                >
                                    {t('feed.pickCategories')}
                                </button>
                            </>
                        ) : activeTab === 'For you' && hasFeedPersonalization ? (
                            <p style={{ fontSize: '16px', color: textSecondary, lineHeight: 1.5 }}>
                                {t('feed.noMatchYet')}
                            </p>
                        ) : (
                            <p style={{ fontSize: '16px', color: textSecondary }}>
                                {activeTab === 'Bookmarks' ? t('feed.noBookmarks') : t('feed.noArticles')}
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

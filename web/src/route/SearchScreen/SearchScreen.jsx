import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useResponsive } from "../../hooks/useResponsive";
import { useLanguage } from "../../context/LanguageContext";
import ExploreCategoryBar from "./components/ExploreCategoryBar";
import SearchBar from "./components/SearchBar";
import TrendingTopics from "./components/TrendingTopics";
import { NewsCard } from "../../components/NewsCard";
import { MasonryFeed, MasonryFeedSkeleton } from "../../components/MasonryFeed";
import { getSkeletonFeedProps } from "../../components/skeletons/SkeletonLayouts";
import { loadExplorePage, mergeUniqueById } from "../../utils/loadFeed";
import { loadExploreCategoryTabs, exploreTabToCategorySlug } from "../../utils/platformTaxonomy";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { openArticleDetail } from "../../utils/openArticleDetail";
import { addBookmark, listBookmarks, listReactions, removeBookmark, setReaction } from "../../utils/Service/api";
import { getBookmarkIds, setBookmarkIds } from "../../utils/bookmarksStorage";
import { getReactionMap, mergeReactionRows, setReactionForArticle } from "../../utils/reactionsStorage";
import { useFeedCache } from "../../context/FeedCacheContext";
import { patchArticleVoteRow, reactionApiValue } from "../../utils/reactionVote";

function filterExploreResults(allNews, searchQuery, activeTab, { apiSearch = false, apiCategory = false, platformCategories = [] } = {}) {
    let results = [...allNews];

    if (!apiCategory && activeTab && activeTab !== "All") {
        const slug = exploreTabToCategorySlug(activeTab, platformCategories);
        results = results.filter((item) => {
            const primary = String(item?.primary_category || "").trim().toLowerCase();
            if (slug && primary === slug) return true;
            if (Array.isArray(item?.categories) && item.categories.some((c) => String(c).trim().toLowerCase() === slug)) {
                return true;
            }
            const label = String(item?.category || "").trim().toLowerCase();
            return label === String(activeTab).trim().toLowerCase();
        });
    }

    if (apiSearch || !String(searchQuery || "").trim()) return results;

    const searchTerms = String(searchQuery || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    return results.filter((item) => {
        if (!item) return false;
        const matchesTerm = (text) => {
            if (!text) return false;
            const textLower = String(text).toLowerCase();
            return searchTerms.some((term) => textLower.includes(term));
        };
        if (matchesTerm(item.title)) return true;
        if (matchesTerm(item.excerpt)) return true;
        if (matchesTerm(item.description)) return true;
        if (matchesTerm(item.source)) return true;
        if (matchesTerm(item.category)) return true;
        if (Array.isArray(item.categories) && item.categories.some(matchesTerm)) return true;
        if (Array.isArray(item.topic_keywords) && item.topic_keywords.some(matchesTerm)) return true;
        return false;
    });
}

function deriveTrendingFromArticles(articles) {
  const counts = {};
  for (const a of articles) {
    for (const k of a.topic_keywords || []) {
      const key = String(k).toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count], i) => ({
      id: `${i}-${name}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count: `${count} in feed`,
      icon: "🔥",
      trending: count >= 2,
    }));
}
const SearchScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isMobile, isTablet } = useResponsive();
    const { t } = useLanguage();
    const [allNews, setAllNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [retryTick, setRetryTick] = useState(0);
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadSeqRef = useRef(0);
    const forceReloadRef = useRef(false);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
    const [activeTab, setActiveTab] = useState("All");
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const { getExploreFeed, saveExploreFeed, isFresh } = useFeedCache();

    const [categories, setCategories] = useState(["All"]);
    const [platformCategories, setPlatformCategories] = useState([]);

    const queryKey = searchQuery.trim().toLowerCase();
    const activeCategorySlug = exploreTabToCategorySlug(activeTab, platformCategories);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { tabs, categories: platformCats } = await loadExploreCategoryTabs();
            if (cancelled) return;
            setCategories(tabs);
            setPlatformCategories(platformCats);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const trendingTopics = useMemo(() => {
        if (searchQuery.trim()) return [];
        return deriveTrendingFromArticles(allNews);
    }, [allNews, searchQuery]);

    const categoryCounts = useMemo(() => {
        const counts = { All: allNews.length };
        for (const item of allNews) {
            const cat = item?.category;
            if (!cat) continue;
            counts[cat] = (counts[cat] || 0) + 1;
        }
        return counts;
    }, [allNews]);

    useEffect(() => {
        const urlQ = searchParams.get("q") || "";
        setSearchQuery((prev) => (prev === urlQ ? prev : urlQ));
    }, [searchParams]);

    const loadFirstPage = useCallback(async (q, tab = activeTab, { force = false } = {}) => {
        const key = String(q || "").trim().toLowerCase();
        const category = exploreTabToCategorySlug(tab, platformCategories);
        const cacheKey = `${key}|${category}`;
        const seq = ++loadSeqRef.current;

        const cached = getExploreFeed(cacheKey);
        if (!force && isFresh(cached) && Array.isArray(cached?.allNews) && cached.allNews.length) {
            setAllNews(cached.allNews);
            setFilteredNews(cached.filteredNews || cached.allNews);
            setNextCursor(cached.nextCursor || '');
            setHasMore(Boolean(cached.hasMore));
            setCategories(cached.categories || ['All']);
            setActiveTab(cached.activeTab || 'All');
            setVotedItems(cached.votedItems || {});
            setBookmarkedItems(new Set(cached.bookmarkIds || []));
            setLoadError(cached.loadError || '');
            setLoading(false);
            if (cached.scrollY) {
                requestAnimationFrame(() => window.scrollTo(0, cached.scrollY));
            }
            return;
        }

        setLoading(true);
        setLoadError('');
        const cachedBookmarks = new Set(getBookmarkIds());
        if (cachedBookmarks.size) setBookmarkedItems(cachedBookmarks);
        const cachedReactions = getReactionMap();
        if (Object.keys(cachedReactions).length) setVotedItems(cachedReactions);

        try {
            const page = await loadExplorePage({
                limit: 50,
                cursor: '',
                q: String(q || "").trim(),
                category,
            });
            if (seq !== loadSeqRef.current) return;

            const newsData = page.items || [];
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
            setAllNews(newsData);
            const categorySet = new Set();
            newsData.forEach((article) => {
                const label = article.primary_category || article.category;
                if (label && !categorySet.has(label)) {
                    categorySet.add(label);
                }
            });
            setCategories(["All", ...Array.from(categorySet).sort()]);
            setFilteredNews(
                filterExploreResults(newsData, q, tab, {
                    apiSearch: Boolean(String(q || "").trim()),
                    apiCategory: Boolean(category),
                    platformCategories,
                })
            );

            const [bookmarks, reactions] = await Promise.all([
                listBookmarks().catch(() => ({ results: [] })),
                listReactions().catch(() => ({ results: [] })),
            ]);
            if (seq !== loadSeqRef.current) return;

            const bookmarked = new Set((bookmarks.results || []).map((b) => String(b.article_id)));
            setBookmarkedItems(bookmarked);
            setBookmarkIds(Array.from(bookmarked));
            const serverReactions = mergeReactionRows(reactions.results || [], { replace: false });
            setVotedItems({ ...cachedReactions, ...serverReactions });
        } catch (error) {
            if (seq !== loadSeqRef.current) return;
            console.error("Error fetching data:", error);
            setAllNews([]);
            setFilteredNews([]);
            setLoadError(error?.message || 'Could not load articles. Is Django running?');
        } finally {
            if (seq === loadSeqRef.current) setLoading(false);
        }
    }, [activeTab, getExploreFeed, isFresh, platformCategories]);

    useEffect(() => {
        const q = searchQuery.trim();
        const delayMs = q ? 360 : 0;
        const timer = setTimeout(() => {
            const force = forceReloadRef.current;
            forceReloadRef.current = false;
            loadFirstPage(searchQuery, activeTab, { force });
        }, delayMs);
        return () => clearTimeout(timer);
    }, [searchQuery, activeTab, retryTick, loadFirstPage]);

    useEffect(() => {
        if (!allNews.length) return;
        saveExploreFeed(`${queryKey}|${exploreTabToCategorySlug(activeTab, platformCategories)}`, {
            allNews,
            filteredNews,
            nextCursor,
            hasMore,
            categories,
            activeTab,
            votedItems,
            bookmarkIds: Array.from(bookmarkedItems),
            loadError,
            scrollY: window.scrollY,
        });
    }, [allNews, filteredNews, nextCursor, hasMore, categories, activeTab, votedItems, bookmarkedItems, loadError, queryKey, saveExploreFeed]);

    useEffect(() => {
        return () => {
            if (!allNews.length) return;
            saveExploreFeed(`${queryKey}|${exploreTabToCategorySlug(activeTab, platformCategories)}`, {
                allNews,
                filteredNews,
                nextCursor,
                hasMore,
                categories,
                activeTab,
                votedItems,
                bookmarkIds: Array.from(bookmarkedItems),
                loadError,
                scrollY: window.scrollY,
            });
        };
    }, [allNews, filteredNews, nextCursor, hasMore, categories, activeTab, votedItems, bookmarkedItems, loadError, queryKey, saveExploreFeed]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await loadExplorePage({
                limit: 50,
                cursor: nextCursor,
                q: searchQuery.trim(),
                category: exploreTabToCategorySlug(activeTab, platformCategories),
            });
            setAllNews((prev) => mergeUniqueById(prev, page.items || []));
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn('Load more failed:', e?.message);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor, searchQuery, activeTab]);

    const scrollSentinelRef = useInfiniteScroll({
        onLoadMore: loadMore,
        hasMore,
        loading: loading || loadingMore,
    });

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        const trimmed = String(query || "").trim();
        if (trimmed) {
            setSearchParams({ q: trimmed }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    }, [setSearchParams]);

    const handleTopicPress = (topicName) => {
        setActiveTab("All");
        handleSearch(topicName);
    };

    const handleClearFilters = () => {
        setActiveTab("All");
        handleSearch("");
    };

    useEffect(() => {
        if (!allNews || allNews.length === 0) return;
        setFilteredNews(
            filterExploreResults(allNews, searchQuery, activeTab, {
                apiSearch: Boolean(searchQuery.trim()),
                apiCategory: Boolean(activeCategorySlug),
                platformCategories,
            })
        );
    }, [searchQuery, activeTab, allNews, activeCategorySlug, platformCategories]);

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
                const patch = { like_count: likes, dislike_count: dislikes, upvotes: likes, votes: likes, userReaction: newVote };
                setAllNews((prev) =>
                    prev.map((n) => (String(n.id) !== id ? n : { ...n, ...patch }))
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
            const article = allNews.find((n) => String(n.id) === id);
            if (wasBookmarked) {
                await removeBookmark(id);
            } else {
                await addBookmark(id, article?.title || "", article?.canonical_url || article?.url || "");
            }
        } catch (error) {
            console.error('Error bookmarking:', error);
        }
    };

    const backgroundColor = colors.background;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const borderColor = colors.border;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            paddingTop: isMobile ? '12px' : '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                padding: '0 clamp(16px, 4vw, 24px) 24px clamp(16px, 4vw, 24px)',
            }}>
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backgroundColor,
                    paddingTop: isMobile ? '8px' : '6px',
                    marginBottom: '12px',
                }}>
                    {/* Header Section */}
                    <div style={{
                        marginTop: '0',
                        marginBottom: '20px',
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
                            {t('pages.exploreTitle')}
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: textSecondary,
                            margin: '0 0 16px 0',
                            lineHeight: '1.5',
                        }}>
                            {t('pages.exploreSubtitle')}
                        </p>
                        <SearchBar
                            onSearch={handleSearch}
                            initialQuery={searchQuery}
                        />
                    </div>

                    <ExploreCategoryBar
                        categories={categories}
                        activeTab={activeTab}
                        onTabPress={setActiveTab}
                        counts={categoryCounts}
                    />
                </div>

                {/* Content Area */}
                {loading ? (
                    <MasonryFeedSkeleton count={8} gap={24} {...getSkeletonFeedProps(isDark, colors)} />
                ) : loadError ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        textAlign: 'center',
                    }}>
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: textPrimary, margin: '0 0 8px 0' }}>
                            Could not load articles
                        </h3>
                        <p style={{ fontSize: 14, color: textSecondary, margin: '0 0 20px 0', maxWidth: 420 }}>
                            {loadError}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                forceReloadRef.current = true;
                                setRetryTick((t) => t + 1);
                            }}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: 8,
                                background: colors.primary,
                                color: colors.textOnPrimary || '#fff',
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}
                        >
                            Retry
                        </button>
                    </div>
                ) : filteredNews.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '100px 20px',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 8px 0',
                        }}>
                            No articles found
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: colors.textSecondary,
                            margin: '0 0 24px 0',
                            textAlign: 'center',
                        }}>
                            {searchQuery.trim()
                                ? "Try a different search term or clear filters"
                                : activeTab !== "All"
                                    ? `No articles found in ${activeTab} category`
                                    : "No articles available"}
                        </p>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            {(searchQuery.trim() || (activeTab && activeTab !== "All")) && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                }}>
                                    {searchQuery.trim() && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: '#f3f4f6',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}>
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: colors.textPrimary,
                                            }}>
                                                Search:
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: colors.textPrimary,
                                                padding: '4px 10px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                            }}>
                                                "{searchQuery}"
                                            </span>
                                        </div>
                                    )}
                                    {activeTab && activeTab !== "All" && (
                                        <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 16px',
                                            backgroundColor: '#f3f4f6',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                        }}>
                                            <span style={{
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: colors.textPrimary,
                                            }}>
                                                Category:
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: colors.textPrimary,
                                                padding: '4px 10px',
                                                backgroundColor: '#ffffff',
                                                borderRadius: '6px',
                                                border: '1px solid #d1d5db',
                                            }}>
                                                {activeTab}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={handleClearFilters}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: colors.textPrimary,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = colors.primary;
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }}
                            >
                                {t('common.clearFilters')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            marginTop: 4,
                            paddingTop: 24,
                            borderTop: `1px solid ${borderColor}`,
                        }}
                    >
                        {!searchQuery.trim() && (
                            <TrendingTopics
                                topics={trendingTopics}
                                onTopicPress={handleTopicPress}
                                searchQuery={searchQuery}
                            />
                        )}

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                justifyContent: 'space-between',
                                gap: 12,
                                marginBottom: 18,
                                flexWrap: 'wrap',
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 15,
                                    fontWeight: 700,
                                    color: textPrimary,
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {searchQuery.trim()
                                    ? 'Search results'
                                    : activeTab !== 'All'
                                      ? `${activeTab} stories`
                                      : 'Discover stories'}
                            </h2>
                            <span style={{ fontSize: 13, fontWeight: 600, color: textSecondary }}>
                                {filteredNews.length} article{filteredNews.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile
                                    ? '1fr'
                                    : isTablet
                                      ? 'repeat(2, minmax(0, 1fr))'
                                      : 'repeat(3, minmax(0, 1fr))',
                                gap: isMobile ? 16 : 20,
                                alignItems: 'stretch',
                            }}
                        >
                            {filteredNews.map((item) => (
                                <NewsCard
                                    key={item.id}
                                    item={item}
                                    layout="grid"
                                    onPress={() => handleArticlePress(item)}
                                    votedItems={votedItems}
                                    bookmarkedItems={bookmarkedItems}
                                    onVote={handleVote}
                                    onBookmark={handleBookmark}
                                />
                            ))}
                        </div>
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
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default SearchScreen;

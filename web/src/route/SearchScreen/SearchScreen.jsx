import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";
import "./components/ExploreStickyToolbar.css";
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
import {
    loadExploreCategoryTabs,
    exploreTabToCategorySlug,
    buildExploreCountsFromArticles,
    exploreTabsFromCounts,
} from "../../utils/platformTaxonomy";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { openArticleDetail } from "../../utils/openArticleDetail";
import { listBookmarks, listReactions, setReaction } from "../../utils/Service/api";
import { getBookmarkIds, setBookmarkIds } from "../../utils/bookmarksStorage";
import { getReactionMap, mergeReactionRows, setReactionForArticle } from "../../utils/reactionsStorage";
import { useFeedCache } from "../../context/FeedCacheContext";
import { patchArticleVoteRow } from "../../utils/reactionVote";
import { useArticleInteractionListener, emitArticleInteractionChange } from "../../utils/articleInteractionEvents";
import {
    toggleVoteRegistered,
    scheduleVotePersist,
    setRegisteredVote,
} from '../../utils/articleVoteController';
import {
    applyOptimisticBookmarkToggle,
    queueBookmarkApi,
    rollbackBookmarkToggle,
} from '../../utils/articleBookmarkController';

function articleMatchesExploreTab(item, activeTab, platformCategories = []) {
    if (!activeTab || activeTab === "All") return true;
    const slug = exploreTabToCategorySlug(activeTab, platformCategories);
    const primary = String(item?.primary_category || "").trim().toLowerCase();
    if (slug && primary === slug) return true;
    if (Array.isArray(item?.categories) && item.categories.some((c) => String(c).trim().toLowerCase() === slug)) {
        return true;
    }
    const tabLower = String(activeTab).trim().toLowerCase();
    const label = String(item?.category || "").trim().toLowerCase();
    if (label === tabLower) return true;
    if (slug && label === slug.replace(/-/g, " ")) return true;
    const blob = [
        item?.title,
        item?.excerpt,
        item?.description,
        item?.content,
        item?.fullContent,
        item?.source,
        item?.primary_category,
        ...(Array.isArray(item?.categories) ? item.categories : []),
        ...(Array.isArray(item?.topic_keywords) ? item.topic_keywords : []),
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    if (blob.includes(tabLower)) return true;
    const synonyms = {
        sports: ["sport", "cricket", "football", "soccer", "nba", "olympic", "match", "league", "athlete"],
        technology: ["tech", "software", "ai", "apple", "google", "startup", "computer", "digital", "cyber"],
        environment: ["climate", "pollution", "carbon", "green", "energy", "renewable", "weather"],
        business: ["business", "economy", "market", "stock", "finance", "trade", "company", "tariff"],
        wildlife: ["wildlife", "animal", "species", "zoo", "nature", "forest", "marine", "bird"],
    };
    for (const word of synonyms[tabLower] || []) {
        if (blob.includes(word)) return true;
    }
    return false;
}

function matchesExploreSearch(item, searchQuery) {
    const terms = String(searchQuery || "").trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return true;

    const fields = [
        item?.title,
        item?.excerpt,
        item?.description,
        item?.source,
        item?.primary_category,
        item?.category,
        ...(Array.isArray(item?.categories) ? item.categories : []),
        ...(Array.isArray(item?.topic_keywords) ? item.topic_keywords : []),
    ]
        .map((v) => String(v || "").toLowerCase())
        .filter(Boolean);

    return terms.every((term) => fields.some((text) => text.includes(term)));
}

function filterExploreResults(allNews, searchQuery, activeTab, { platformCategories = [], apiCategory = false } = {}) {
    let results = [...allNews];

    if (!apiCategory && activeTab && activeTab !== "All") {
        results = results.filter((item) => articleMatchesExploreTab(item, activeTab, platformCategories));
    }

    if (String(searchQuery || "").trim()) {
        results = results.filter((item) => matchesExploreSearch(item, searchQuery));
    }

    return results;
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
    const { isMobile, isDesktop } = useResponsive();
    const { t } = useLanguage();
    const [allNews, setAllNews] = useState([]);
    const allNewsRef = useRef(allNews);
    allNewsRef.current = allNews;
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [retryTick, setRetryTick] = useState(0);
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadSeqRef = useRef(0);
    const forceReloadRef = useRef(false);
    const stickySentinelRef = useRef(null);
    const toolbarRef = useRef(null);
    const [toolbarPinned, setToolbarPinned] = useState(false);
    const [toolbarHeight, setToolbarHeight] = useState(0);
    const [headerOffset, setHeaderOffset] = useState(64);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");
    const [activeTab, setActiveTab] = useState("All");
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const { getExploreFeed, saveExploreFeed, isFresh } = useFeedCache();

    const [categories, setCategories] = useState(["All"]);
    const [platformCategories, setPlatformCategories] = useState([]);
    const [serverCountsByLabel, setServerCountsByLabel] = useState({ All: 0 });

    const queryKey = searchQuery.trim().toLowerCase();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const { tabs, categories: platformCats, countsByLabel } = await loadExploreCategoryTabs();
            if (cancelled) return;
            setCategories(tabs);
            setPlatformCategories(platformCats);
            setServerCountsByLabel(countsByLabel || { All: 0 });
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const trendingTopics = useMemo(() => {
        if (searchQuery.trim()) return [];
        return deriveTrendingFromArticles(allNews);
    }, [allNews, searchQuery]);

    const { visibleCategories, categoryCounts } = useMemo(() => {
        const searching = Boolean(searchQuery.trim());

        if (searching) {
            const searchResults = filterExploreResults(allNews, searchQuery, "All", { platformCategories });
            const counts = buildExploreCountsFromArticles(searchResults, platformCategories);
            return {
                visibleCategories: exploreTabsFromCounts(counts),
                categoryCounts: counts,
            };
        }

        return {
            visibleCategories: categories,
            categoryCounts: serverCountsByLabel,
        };
    }, [searchQuery, allNews, platformCategories, categories, serverCountsByLabel]);

    useEffect(() => {
        if (activeTab !== "All" && !visibleCategories.includes(activeTab)) {
            setActiveTab("All");
        }
    }, [visibleCategories, activeTab]);

    const filteredNews = useMemo(
        () =>
            filterExploreResults(allNews, searchQuery, activeTab, {
                platformCategories,
                apiCategory: Boolean(exploreTabToCategorySlug(activeTab, platformCategories)),
            }),
        [allNews, searchQuery, activeTab, platformCategories]
    );

    useEffect(() => {
        const urlQ = searchParams.get("q") || "";
        setSearchQuery((prev) => (prev === urlQ ? prev : urlQ));
    }, [searchParams]);

    const measureExploreToolbar = useCallback(() => {
        const header = document.querySelector('header');
        if (header) {
            setHeaderOffset(Math.round(header.getBoundingClientRect().height));
        }
        if (toolbarRef.current) {
            setToolbarHeight(Math.round(toolbarRef.current.offsetHeight));
        }
    }, []);

    useLayoutEffect(() => {
        measureExploreToolbar();
        window.addEventListener('resize', measureExploreToolbar);
        return () => window.removeEventListener('resize', measureExploreToolbar);
    }, [measureExploreToolbar, visibleCategories, activeTab, searchQuery, isMobile]);

    useEffect(() => {
        const sentinel = stickySentinelRef.current;
        if (!sentinel) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => setToolbarPinned(!entry.isIntersecting),
            {
                root: null,
                threshold: 0,
                rootMargin: `-${headerOffset}px 0px 0px 0px`,
            },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [headerOffset]);

    const loadFirstPage = useCallback(async (q, tab = activeTab, { force = false } = {}) => {
        const key = String(q || "").trim().toLowerCase();
        const category = exploreTabToCategorySlug(tab, platformCategories);
        const cacheKey = `${key}|${category}`;
        const seq = ++loadSeqRef.current;

        const cached = getExploreFeed(cacheKey);
        if (!force && isFresh(cached) && Array.isArray(cached?.allNews) && cached.allNews.length) {
            setAllNews(cached.allNews);
            setNextCursor(cached.nextCursor || '');
            setHasMore(Boolean(cached.hasMore));
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
    }, [allNews, filteredNews, nextCursor, hasMore, categories, activeTab, votedItems, bookmarkedItems, loadError, queryKey, saveExploreFeed, platformCategories]);

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
    }, [allNews, filteredNews, nextCursor, hasMore, categories, activeTab, votedItems, bookmarkedItems, loadError, queryKey, saveExploreFeed, platformCategories]);

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
    }, [hasMore, loadingMore, nextCursor, searchQuery, activeTab, platformCategories]);

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

    const handleTabPress = useCallback((tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleClearFilters = () => {
        setActiveTab("All");
        handleSearch("");
    };

    useArticleInteractionListener({
        setVotedItems,
        setBookmarkedItems,
        onArticlesPatch: setAllNews,
    });

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = (itemId, type) => {
        const id = String(itemId);
        const { previousVote, newVote, changed } = toggleVoteRegistered(id, type);
        if (!changed) return;
        const articleRow = allNewsRef.current.find((n) => String(n.id) === id) || {};
        const optimistic = patchArticleVoteRow(articleRow, previousVote, newVote);

        setVotedItems((prev) => ({ ...prev, [id]: newVote }));
        setReactionForArticle(id, newVote);
        setAllNews((prev) =>
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
                const patch = { like_count: likes, dislike_count: dislikes, upvotes: likes, votes: likes, userReaction: vote };
                setAllNews((prev) =>
                    prev.map((n) => (String(n.id) !== id ? n : { ...n, ...patch }))
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
                setAllNews((prev) =>
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
        const id = String(itemId);
        const article = allNewsRef.current.find((n) => String(n.id) === id);
        const { wasBookmarked } = applyOptimisticBookmarkToggle({
            articleId: id,
            article,
            setBookmarkedItems,
            setNewsData: setAllNews,
        });

        queueBookmarkApi(id, wasBookmarked ? 'remove' : 'add', article).catch((error) => {
            console.error('Error bookmarking:', error);
            rollbackBookmarkToggle({
                articleId: id,
                wasBookmarked,
                article,
                setBookmarkedItems,
                setNewsData: setAllNews,
            });
        });
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
                    marginTop: '0',
                    marginBottom: '16px',
                    paddingTop: isMobile ? '8px' : '6px',
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
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        {t('pages.exploreSubtitle')}
                    </p>
                </div>

                <div ref={stickySentinelRef} style={{ height: 1 }} aria-hidden />

                <div
                    className="explore-sticky-toolbar-slot"
                    style={toolbarPinned && toolbarHeight ? { height: toolbarHeight } : undefined}
                >
                    <div
                        ref={toolbarRef}
                        className={`explore-sticky-toolbar${toolbarPinned ? ' explore-sticky-toolbar--pinned' : ''}`}
                        style={toolbarPinned ? {
                            top: headerOffset,
                            right: isDesktop ? 280 : 0,
                        } : undefined}
                    >
                        <div className="explore-sticky-toolbar__inner">
                            <div style={{ marginBottom: 16 }}>
                                <SearchBar
                                    onSearch={handleSearch}
                                    initialQuery={searchQuery}
                                />
                            </div>

                            <ExploreCategoryBar
                                categories={visibleCategories}
                                activeTab={activeTab}
                                onTabPress={handleTabPress}
                                counts={categoryCounts}
                            />
                        </div>
                    </div>
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
                    <div>
                        {!searchQuery.trim() && (
                            <TrendingTopics
                                topics={trendingTopics}
                                onTopicPress={handleTopicPress}
                                searchQuery={searchQuery}
                            />
                        )}

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

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { MoreHorizontal } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import SearchBar from "./components/SearchBar";
import Tabs from "./components/tabs";
import TrendingTopics from "./components/TrendingTopics";
import { NewsCard } from "../../components/NewsCard";
import { MasonryFeed, MasonryFeedSkeleton } from "../../components/MasonryFeed";
import { getSkeletonFeedProps } from "../../components/skeletons/SkeletonLayouts";
import { loadExplorePage, mergeUniqueById } from "../../utils/loadFeed";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { openArticleDetail } from "../../utils/openArticleDetail";
import { useUIFeedback } from "../../components/ui/UIFeedback";
import { addBookmark, listBookmarks, listReactions, removeBookmark, setReaction, submitArticleReport } from "../../utils/Service/api";
import { getBookmarkIds, setBookmarkIds } from "../../utils/bookmarksStorage";
import { getReactionMap, mergeReactionRows, setReactionForArticle } from "../../utils/reactionsStorage";
import { useFeedCache } from "../../context/FeedCacheContext";

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
    const [allNews, setAllNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [retryTick, setRetryTick] = useState(0);
    const [nextCursor, setNextCursor] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const loadSeqRef = useRef(0);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
    const [debouncedQuery, setDebouncedQuery] = useState(searchParams.get('q') || "");
    const [activeTab, setActiveTab] = useState("All");
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const { success, error: showError } = useUIFeedback();
    const searchRef = useRef(null);
    const discoverMenuRef = useRef(null);
    const [discoverMenuOpen, setDiscoverMenuOpen] = useState(false);
    const lastScrollY = useRef(0);
    const [headerHidden, setHeaderHidden] = useState(false);
    const { getExploreFeed, saveExploreFeed, isFresh } = useFeedCache();

    const [categories, setCategories] = useState(["All"]);

    const trendingTopics = useMemo(() => {
        if (debouncedQuery.trim()) return [];
        return deriveTrendingFromArticles(allNews);
    }, [allNews, debouncedQuery]);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        const q = debouncedQuery.trim();
        const queryKey = q.toLowerCase();
        const seq = ++loadSeqRef.current;

        const cached = getExploreFeed(queryKey);
        if (isFresh(cached) && Array.isArray(cached?.allNews) && cached.allNews.length) {
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

        (async () => {
            setLoading(true);
            setLoadError('');
            const cachedBookmarks = new Set(getBookmarkIds());
            if (cachedBookmarks.size) setBookmarkedItems(cachedBookmarks);
            const cachedReactions = getReactionMap();
            if (Object.keys(cachedReactions).length) setVotedItems(cachedReactions);

            try {
                const page = await loadExplorePage({ q, limit: 50, cursor: '' });
                if (seq !== loadSeqRef.current) return;

                const newsData = page.items || [];
                setNextCursor(page.nextCursor || '');
                setHasMore(Boolean(page.hasMore));
                setAllNews(newsData);
                const categorySet = new Set();
                newsData.forEach((article) => {
                    if (article.category && !categorySet.has(article.category)) {
                        categorySet.add(article.category);
                    }
                });
                setCategories(["All", ...Array.from(categorySet).sort()]);
                setFilteredNews([...newsData]);

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
        })();
    }, [debouncedQuery, retryTick, getExploreFeed, isFresh]);

    useEffect(() => {
        if (!allNews.length) return;
        const queryKey = debouncedQuery.trim().toLowerCase();
        saveExploreFeed(queryKey, {
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
    }, [allNews, filteredNews, nextCursor, hasMore, categories, activeTab, votedItems, bookmarkedItems, loadError, debouncedQuery, saveExploreFeed]);

    useEffect(() => {
        const queryKey = debouncedQuery.trim().toLowerCase();
        return () => {
            if (!allNews.length) return;
            saveExploreFeed(queryKey, {
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
    }, [allNews, filteredNews, nextCursor, hasMore, categories, activeTab, votedItems, bookmarkedItems, loadError, debouncedQuery, saveExploreFeed]);

    const loadMore = useCallback(async () => {
        if (!hasMore || loadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await loadExplorePage({
                q: debouncedQuery.trim(),
                limit: 50,
                cursor: nextCursor,
            });
            setAllNews((prev) => mergeUniqueById(prev, page.items || []));
            setNextCursor(page.nextCursor || '');
            setHasMore(Boolean(page.hasMore));
        } catch (e) {
            console.warn('Load more failed:', e?.message);
        } finally {
            setLoadingMore(false);
        }
    }, [hasMore, loadingMore, nextCursor, debouncedQuery]);

    const scrollSentinelRef = useInfiniteScroll({
        onLoadMore: loadMore,
        hasMore,
        loading: loading || loadingMore,
    });

    useEffect(() => {
        if (!discoverMenuOpen) return;
        const close = (e) => {
            if (discoverMenuRef.current && !discoverMenuRef.current.contains(e.target)) {
                setDiscoverMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, [discoverMenuOpen]);

    const exportDiscoverResults = useCallback(() => {
        const rows = filteredNews.map((a) => ({
            id: a.id,
            title: a.title,
            source: a.source,
            category: a.category,
            url: a.canonical_url || a.url,
        }));
        const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trak-discover-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setDiscoverMenuOpen(false);
        success('Export downloaded.');
    }, [filteredNews, success]);

    const reportDiscoverContent = useCallback(async () => {
        const reason = typeof window !== 'undefined' ? window.prompt('Describe the issue (spam, misleading, etc.):', 'flag') : 'flag';
        if (reason === null) return;
        const first = filteredNews[0];
        try {
            await submitArticleReport({
                article_id: first?.id ? String(first.id) : '',
                url: first?.canonical_url || first?.url || '',
                reason: reason || 'flag',
            });
            success('Thanks — your report was sent.');
        } catch (e) {
            showError(e?.message || 'Could not submit report.');
        }
        setDiscoverMenuOpen(false);
    }, [filteredNews, success, showError]);

    // Read query parameter from URL on mount and when URL changes
    useEffect(() => {
        const urlQuery = searchParams.get('q') || '';
        if (urlQuery) {
            setSearchQuery(urlQuery);
        }
    }, [searchParams]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        // Update URL with search query
        if (query.trim()) {
            setSearchParams({ q: query.trim() });
        } else {
            setSearchParams({});
        }
    };

    const handleTopicPress = (topicName) => {
        setSearchQuery(topicName);
        setSearchParams({ q: topicName });
        setActiveTab("All"); // Reset to All tab when searching
        searchRef.current?.collapseKeepText();
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setActiveTab("All");
        setSearchParams({}); // Clear URL parameter
        if (searchRef.current) {
            searchRef.current.collapseKeepText();
        }
    };

    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY || 0;
            const diff = y - lastScrollY.current;
            if (Math.abs(diff) > 6) {
                if (diff > 0 && y > 80) setHeaderHidden(true);
                if (diff < 0) setHeaderHidden(false);
            }
            if (y < 24) setHeaderHidden(false);
            lastScrollY.current = y;
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        // Don't filter if news haven't loaded yet
        if (!allNews || allNews.length === 0) {
            return;
        }

        // Filter immediately without delay for better responsiveness
        let results = [...allNews];

        // Filter by category tab first
        if (activeTab && activeTab !== "All") {
            results = results.filter(item => {
                if (!item || !item.category) return false;
                // Exact match for category
                return item.category === activeTab;
            });
        }

        // Then filter by search query if present
        if (debouncedQuery && debouncedQuery.trim()) {
            const lower = debouncedQuery.toLowerCase().trim();
            const searchTerms = lower.split(/\s+/).filter(term => term.length > 0); // Split into individual words and filter empty
            
            if (searchTerms.length > 0) {
                results = results.filter((item) => {
                    if (!item) return false;
                    
                    // Combine all searchable text
                    const searchableText = [
                        item.title || '',
                        item.excerpt || '',
                        item.description || '',
                        item.source || '',
                        item.category || '',
                        (item.topic_keywords || []).join(' '),
                    ].join(' ').toLowerCase();
                    
                    // Check if all search terms are found in the searchable text
                    return searchTerms.every(term => searchableText.includes(term));
                });
            }
        }

        setFilteredNews(results);
    }, [debouncedQuery, activeTab, allNews]);

    const handleArticlePress = (article) => {
        openArticleDetail(navigate, article);
    };

    const handleVote = async (itemId, type) => {
        const id = String(itemId);
        const previousVote = votedItems[id];
        const newVote = previousVote === type ? null : type;

        setVotedItems(prev => ({
            ...prev,
            [id]: newVote
        }));
        setReactionForArticle(id, newVote);

        try {
            const data = await setReaction(
                id,
                newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none'
            );
            const likes = Number(data.like_count ?? 0);
            const dislikes = Number(data.dislike_count ?? 0);
            const patch = { like_count: likes, dislike_count: dislikes, upvotes: likes, votes: likes };
            setAllNews((prev) =>
                prev.map((n) => (String(n.id) !== id ? n : { ...n, ...patch }))
            );
        } catch (error) {
            setVotedItems(prev => ({
                ...prev,
                [id]: previousVote
            }));
            setReactionForArticle(id, previousVote || null);
        }
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
                padding: '0 clamp(16px, 4vw, 24px) 24px clamp(16px, 4vw, 24px)',
            }}>
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backgroundColor,
                    paddingTop: '6px',
                    marginBottom: '12px',
                    transform: headerHidden ? 'translateY(-118%)' : 'translateY(0)',
                    opacity: headerHidden ? 0 : 1,
                    transition: 'transform 240ms ease, opacity 220ms ease',
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
                            Explore Articles
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: textSecondary,
                            margin: '0',
                            lineHeight: '1.5',
                        }}>
                            Search and discover articles from all categories
                        </p>
                    </div>

                    {/* Search Bar + actions */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '18px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <SearchBar
                                ref={searchRef}
                                onSearch={handleSearch}
                                initialQuery={searchQuery}
                            />
                        </div>
                        <div ref={discoverMenuRef} style={{ position: 'relative', flexShrink: 0, paddingTop: '4px' }}>
                            <button
                                type="button"
                                aria-label="More actions"
                                onClick={() => setDiscoverMenuOpen((o) => !o)}
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 10,
                                    border: `1px solid ${borderColor}`,
                                    background: isDark ? colors.surface || '#1E293B' : '#ffffff',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: textPrimary,
                                }}
                            >
                                <MoreHorizontal size={20} />
                            </button>
                            {discoverMenuOpen ? (
                                <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 48,
                                    minWidth: 180,
                                    background: cardBackground,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: 10,
                                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(15,23,42,0.12)',
                                    zIndex: 50,
                                    overflow: 'hidden',
                                }}>
                                    <button
                                        type="button"
                                        onClick={exportDiscoverResults}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px 14px',
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: textPrimary,
                                        }}
                                    >
                                        Export results
                                    </button>
                                    <button
                                        type="button"
                                        onClick={reportDiscoverContent}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '12px 14px',
                                            border: 'none',
                                            borderTop: `1px solid ${borderColor}`,
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: textPrimary,
                                        }}
                                    >
                                        Report / Flag
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Tab Bar */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '8px',
                        borderBottom: '1px solid #e5e7eb',
                        paddingBottom: '0',
                        overflowX: 'auto',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}>
                    {categories.map((tab) => {
                        // Count articles for this category
                        const count = tab === "All" 
                            ? allNews.length 
                            : allNews.filter(item => item.category === tab).length;
                        
                        return (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    // Don't clear search when clicking tabs - allow filtering by both category and search
                                }}
                                style={{
                                    padding: '10px 16px',
                                    border: 'none',
                                    background: activeTab === tab ? '#f3f4f6' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    borderBottom: activeTab === tab ? '3px solid #0f172a' : '2px solid transparent',
                                    marginBottom: activeTab === tab ? '-2px' : '-1px',
                                    borderRadius: '0',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    position: 'relative',
                                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== tab) {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== tab) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    } else {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }
                                }}
                            >
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: activeTab === tab ? '700' : '500',
                                    color: activeTab === tab ? '#0f172a' : '#64748b',
                                    letterSpacing: activeTab === tab ? '-0.2px' : '0',
                                }}>
                                    {tab}
                                </span>
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: activeTab === tab ? '#0f172a' : '#9ca3af',
                                    backgroundColor: activeTab === tab ? '#e5e7eb' : '#f3f4f6',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    minWidth: '28px',
                                    textAlign: 'center',
                                }}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                    </div>
                </div>
                <style>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

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
                            onClick={() => setRetryTick((t) => t + 1)}
                            style={{
                                padding: '10px 20px',
                                border: 'none',
                                borderRadius: 8,
                                background: '#0f172a',
                                color: '#fff',
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
                            color: '#0f172a',
                            margin: '0 0 8px 0',
                        }}>
                            No articles found
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: '0 0 24px 0',
                            textAlign: 'center',
                        }}>
                            {searchQuery.trim() 
                                ? "Try searching with different keywords or clear the search" 
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
                                                color: '#0f172a',
                                            }}>
                                                Search:
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: '#0f172a',
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
                                                color: '#0f172a',
                                            }}>
                                                Category:
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: '#0f172a',
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
                                onClick={handleClearSearch}
                                style={{
                                    padding: '10px 20px',
                                    border: '1px solid #e5e7eb',
                                    background: '#ffffff',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#0f172a',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#0f172a';
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }}
                            >
                                Clear Filters & Show All
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {!searchQuery.trim() && (
                            <>
                                <TrendingTopics 
                                    topics={trendingTopics}
                                    onTopicPress={handleTopicPress}
                                    searchQuery={searchQuery}
                                />
                            </>
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

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import SearchBar from "./components/SearchBar";
import Tabs from "./components/tabs";
import TrendingTopics from "./components/TrendingTopics";
import RecentSearches from "./components/RecentSearches";
import { NewsCard } from "../../components/NewsCard";
import { loadFeedItems } from "../../utils/loadFeed";
import {
  getRecentSearches,
  addRecentSearch,
  deleteRecentSearch,
} from "../../utils/recentSearchesStorage";

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
import { 
    ChevronUp, 
    ChevronDown, 
    Bookmark, 
    Share2, 
    Clock, 
    CheckCircle,
    X
} from 'lucide-react';

const SearchScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [allNews, setAllNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || "");
    const [activeTab, setActiveTab] = useState("All");
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [articleLiked, setArticleLiked] = useState(false);
    const [articleDisliked, setArticleDisliked] = useState(false);
    const [articleBookmarked, setArticleBookmarked] = useState(false);
    const [articleLikeCount, setArticleLikeCount] = useState(0);
    const [articleDislikeCount, setArticleDislikeCount] = useState(0);
    const searchRef = useRef(null);

    const [categories, setCategories] = useState(["All"]);

    useEffect(() => {
        const q = searchQuery.trim();
        const delayMs = q ? 360 : 0;
        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const newsData = await loadFeedItems({ q });
                setAllNews(newsData);
                const categorySet = new Set();
                newsData.forEach((article) => {
                    if (article.category && !categorySet.has(article.category)) {
                        categorySet.add(article.category);
                    }
                });
                setCategories(["All", ...Array.from(categorySet).sort()]);
                if (!q) {
                    setTrendingTopics(deriveTrendingFromArticles(newsData));
                    setRecentSearches(await getRecentSearches());
                }
                setFilteredNews([...newsData]);
            } catch (error) {
                console.error("Error fetching data:", error);
                setAllNews([]);
                setFilteredNews([]);
            } finally {
                setLoading(false);
            }
        }, delayMs);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Read query parameter from URL on mount and when URL changes
    useEffect(() => {
        const urlQuery = searchParams.get('q') || '';
        if (urlQuery) {
            setSearchQuery(urlQuery);
        }
    }, [searchParams]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        setSelectedArticle(null); // Clear selected article when searching
        // Update URL with search query
        if (query.trim()) {
            setSearchParams({ q: query.trim() });
        } else {
            setSearchParams({});
        }
    };

    const handleTopicPress = (topicName) => {
        setSearchQuery(topicName);
        setActiveTab("All"); // Reset to All tab when searching
        searchRef.current?.collapseKeepText();
    };

    const handleSearchSelect = async (query) => {
        setSearchQuery(query);
        setActiveTab("All"); // Reset to All tab when searching
        searchRef.current?.collapseKeepText();
        
        try {
            const next = await addRecentSearch(query);
            setRecentSearches(next);
        } catch (error) {
            console.error("Error updating recent searches:", error);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setActiveTab("All");
        setSearchParams({}); // Clear URL parameter
        if (searchRef.current) {
            searchRef.current.collapseKeepText();
        }
    };

    const handleDeleteSearch = async (searchId) => {
        try {
            const next = await deleteRecentSearch(searchId);
            setRecentSearches(next);
        } catch (error) {
            console.error("Error deleting search:", error);
        }
    };

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
        if (searchQuery && searchQuery.trim()) {
            const lower = searchQuery.toLowerCase().trim();
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
    }, [searchQuery, activeTab, allNews]);

    const handleArticlePress = (article) => {
        setSelectedArticle(article);
        setArticleLikeCount(article.upvotes || article.votes || 0);
        setArticleDislikeCount(3);
        setArticleLiked(false);
        setArticleDisliked(false);
        setArticleBookmarked(bookmarkedItems.has(article.id));
        setTimeout(() => {
            const element = document.querySelector('[data-article-detail]');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    const handleCloseArticle = () => {
        setSelectedArticle(null);
    };

    const handleArticleLike = () => {
        if (articleDisliked) {
            setArticleDisliked(false);
            setArticleDislikeCount(articleDislikeCount - 1);
        }
        setArticleLiked(!articleLiked);
        setArticleLikeCount(articleLiked ? articleLikeCount - 1 : articleLikeCount + 1);
    };

    const handleArticleDislike = () => {
        if (articleLiked) {
            setArticleLiked(false);
            setArticleLikeCount(articleLikeCount - 1);
        }
        setArticleDisliked(!articleDisliked);
        setArticleDislikeCount(articleDisliked ? articleDislikeCount - 1 : articleDislikeCount + 1);
    };

    const handleArticleBookmark = () => {
        if (selectedArticle) {
            handleBookmark(selectedArticle.id);
            setArticleBookmarked(!articleBookmarked);
        }
    };

    const handleArticleShare = () => {
        if (navigator.share && selectedArticle) {
            navigator.share({
                title: selectedArticle.title,
                text: selectedArticle.excerpt || selectedArticle.description,
                url: window.location.href,
            });
        } else if (selectedArticle) {
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleVote = async (itemId, type) => {
        const previousVote = votedItems[itemId];
        const newVote = previousVote === type ? null : type;

        setVotedItems(prev => ({
            ...prev,
            [itemId]: newVote
        }));

        try {
            /* votes API TBD */
        } catch (error) {
            setVotedItems(prev => ({
                ...prev,
                [itemId]: previousVote
            }));
        }
    };

    const handleBookmark = async (itemId) => {
        setBookmarkedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });

        try {
            /* bookmarks API TBD */
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

                {/* Search Bar */}
                <div style={{ marginBottom: '24px' }}>
                    <SearchBar
                        ref={searchRef}
                        onSearch={handleSearch}
                        initialQuery={searchQuery}
                    />
                </div>

                {/* Tab Bar */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '32px',
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
                                    setSelectedArticle(null);
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
                <style>{`
                    div::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {/* Article Detail View */}
                {selectedArticle ? (
                    <div data-article-detail style={{
                        marginBottom: '32px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                    padding: '24px',
                    }}>
                        {/* Close Button */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginBottom: '20px',
                        }}>
                            <button
                                onClick={handleCloseArticle}
                                style={{
                                    padding: '6px',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        {/* Source Info */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#0f172a',
                            }}>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    letterSpacing: '0.5px',
                                }}>
                                    {selectedArticle.source?.substring(0, 2).toUpperCase() || 'N'}
                                </span>
                            </div>
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#0f172a',
                                    }}>
                                        {selectedArticle.source || 'Source'}
                                    </span>
                                    {selectedArticle.verified && (
                                        <CheckCircle size={14} color="#10b981" fill="#10b981" />
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '2px',
                                }}>
                                    <Clock size={12} color="#9ca3af" />
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                    }}>
                                        {selectedArticle.time || '2h ago'}
                                    </span>
                                    {selectedArticle.readTime && (
                                        <>
                                            <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#9ca3af',
                                            }}>
                                                {selectedArticle.readTime} min read
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Category Tag */}
                        {selectedArticle.category && (
                            <div style={{
                                marginBottom: '16px',
                            }}>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '4px 10px',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                }}>
                                    {selectedArticle.category}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            lineHeight: '1.3',
                            color: '#0f172a',
                            margin: '0 0 16px 0',
                            letterSpacing: '-0.5px',
                        }}>
                            {selectedArticle.title || 'Article Title'}
                        </h2>

                        {/* Article Content */}
                        <div style={{
                            fontSize: '16px',
                            lineHeight: '1.7',
                            color: '#374151',
                            marginBottom: '24px',
                        }}>
                            {(selectedArticle.fullContent || selectedArticle.content || selectedArticle.excerpt || selectedArticle.description || 'Article content goes here...').split('\n').map((paragraph, index) => (
                                <p key={index} style={{
                                    margin: '0 0 16px 0',
                                }}>
                                    {paragraph || '\u00A0'}
                                </p>
                            ))}
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb',
                        }}>
                            {/* Vote Buttons */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px',
                                backgroundColor: '#f9fafb',
                                borderRadius: '10px',
                            }}>
                                <button
                                    onClick={handleArticleLike}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: articleLiked ? '#ffffff' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: articleLiked ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!articleLiked) {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!articleLiked) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <ChevronUp 
                                        size={16} 
                                        color={articleLiked ? '#3b82f6' : '#64748b'} 
                                        strokeWidth={articleLiked ? 2.5 : 2}
                                    />
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: articleLiked ? '#3b82f6' : '#64748b',
                                    }}>
                                        {articleLikeCount}
                                    </span>
                                </button>

                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    backgroundColor: '#e5e7eb',
                                }} />

                                <button
                                    onClick={handleArticleDislike}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: articleDisliked ? '#ffffff' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: articleDisliked ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!articleDisliked) {
                                            e.currentTarget.style.backgroundColor = '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!articleDisliked) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <ChevronDown 
                                        size={16} 
                                        color={articleDisliked ? '#ef4444' : '#64748b'} 
                                        strokeWidth={articleDisliked ? 2.5 : 2}
                                    />
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: articleDisliked ? '#ef4444' : '#64748b',
                                    }}>
                                        {articleDislikeCount}
                                    </span>
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}>
                                <button
                                    onClick={handleArticleBookmark}
                                    style={{
                                        padding: '8px',
                                        border: 'none',
                                        background: articleBookmarked ? '#fef3c7' : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!articleBookmarked) {
                                            e.currentTarget.style.backgroundColor = '#f9fafb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!articleBookmarked) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Bookmark 
                                        size={18} 
                                        color={articleBookmarked ? '#f59e0b' : '#9ca3af'} 
                                        fill={articleBookmarked ? '#f59e0b' : 'none'}
                                        strokeWidth={2}
                                    />
                                </button>

                                <button
                                    onClick={handleArticleShare}
                                    style={{
                                        padding: '8px',
                                        border: 'none',
                                        background: 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <Share2 size={18} color="#9ca3af" strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* Content Area */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '500px',
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: '3px solid #e5e7eb',
                            borderTop: '3px solid #0f172a',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
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
                                
                                <RecentSearches 
                                    searches={recentSearches}
                                    onSearchSelect={handleSearchSelect}
                                    onDeleteSearch={handleDeleteSearch}
                                    searchQuery={searchQuery}
                                />
                            </>
                        )}
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '24px',
                        }}>
                            {filteredNews.map((item) => (
                                <NewsCard 
                                    key={item.id} 
                                    item={item}
                                    onPress={() => handleArticlePress(item)}
                                    votedItems={votedItems}
                                    bookmarkedItems={bookmarkedItems}
                                    onVote={handleVote}
                                    onBookmark={handleBookmark}
                                />
                            ))}
                        </div>
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

export default SearchScreen;

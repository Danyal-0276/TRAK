import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import { ArticleBodyParagraphs } from '../../components/ArticleBodyParagraphs';
import { addBookmark, getUserFeed, getUserKeywordsFromServer, listBookmarks, listReactions, removeBookmark, setReaction } from '../../utils/Service/api';
import { loadUserKeywords } from '../../utils/userKeywordsStorage';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { filterFeedByUserKeywords } from '../../utils/feedKeywordMatch';
import { 
    ArrowLeft, 
    ChevronUp, 
    ChevronDown, 
    Bookmark, 
    Share2, 
    Clock, 
    CheckCircle,
    MoreHorizontal,
    X
} from 'lucide-react';

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
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [feedKeywords, setFeedKeywords] = useState([]);
    const { success } = useUIFeedback();

    const refreshKeywords = useCallback(async () => {
        const kws = await loadUserKeywords(getUserKeywordsFromServer);
        setFeedKeywords(Array.isArray(kws) ? kws : []);
        return kws;
    }, []);

    const loadNews = async () => {
        try {
            setLoading(true);
            const keywords = await refreshKeywords();
            if (!keywords?.length) {
                setNewsData([]);
                return;
            }

            const cachedBookmarks = new Set(getBookmarkIds());
            if (cachedBookmarks.size) setBookmarkedItems(cachedBookmarks);
            const cachedReactions = getReactionMap();
            if (Object.keys(cachedReactions).length) setVotedItems(cachedReactions);
            const [response, bookmarks, reactions] = await Promise.all([
                getUserFeed(),
                listBookmarks().catch(() => ({ results: [] })),
                listReactions().catch(() => ({ results: [] })),
            ]);
            const bookmarked = new Set((bookmarks.results || []).map((b) => String(b.article_id)));
            const reactionMap = mergeReactionRows(reactions.results || [], { replace: false });
            const mapped = (response.results || []).map((item, idx) => {
                const aid = item.id || item.canonical_url || String(idx);
                const likes = Number(item.like_count ?? item.upvotes ?? 0);
                const dislikes = Number(item.dislike_count ?? 0);
                return {
                    ...item,
                    id: aid,
                    description: item.excerpt || item.summary || '',
                    excerpt: item.excerpt || item.summary || '',
                    summary: item.summary || item.excerpt || '',
                    content: item.content || item.full_content || '',
                    fullContent: item.full_content || item.content || '',
                    category: item.topic_keywords?.[0] || 'General',
                    time: item.published_at ? new Date(item.published_at).toLocaleString() : 'Recently',
                    like_count: likes,
                    dislike_count: dislikes,
                    upvotes: likes,
                    verified: item.credibility?.label === 'real',
                    trending: Boolean(item.topic_keywords?.length),
                    userReaction: reactionMap[String(aid)] || null,
                };
            });
            setNewsData(mapped);
            setBookmarkedItems(bookmarked);
            setBookmarkIds(Array.from(bookmarked));
            setVotedItems(reactionMap);
        } catch (error) {
            console.error('Error loading news:', error);
            setNewsData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    useEffect(() => {
        if (!feedKeywords.length) {
            setNewsData([]);
        }
    }, [feedKeywords]);

    useEffect(() => {
        if (rawTab) {
            const t =
                rawTab === 'Following' || rawTab === 'Recent' ? 'For you' : rawTab;
            if (['For you', 'Bookmarks', 'Trending'].includes(t)) setActiveTab(t);
        }
    }, [rawTab]);

    const handleArticlePress = (article) => {
        setSelectedArticle(article);
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

    const articleDetailReaction = selectedArticle
        ? votedItems[String(selectedArticle.id)] ?? null
        : null;
    const articleBookmarked = selectedArticle
        ? bookmarkedItems.has(String(selectedArticle.id)) || bookmarkedItems.has(selectedArticle.id)
        : false;

    const handleArticleBookmark = () => {
        if (selectedArticle) {
            handleBookmark(selectedArticle.id);
        }
    };

    const handleArticleShare = () => {
        if (!selectedArticle) return;
        const url = selectedArticle.canonical_url || selectedArticle.url || window.location.href;
        if (navigator.share) {
            navigator.share({
                title: selectedArticle.title,
                text: selectedArticle.excerpt || selectedArticle.description,
                url,
            });
        } else {
            navigator.clipboard.writeText(url);
            success('Link copied to clipboard!');
        }
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

    const hasFeedPersonalization = feedKeywords.length > 0;
    const visibleNews = useMemo(() => {
        if (activeTab === 'For you' && !hasFeedPersonalization) {
            return [];
        }
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
            return filterFeedByUserKeywords(newsData, feedKeywords);
        }
        return newsData;
    }, [newsData, activeTab, hasFeedPersonalization, bookmarkedItems, feedKeywords]);

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
                            onClick={() => {
                                setActiveTab(tab);
                                setSelectedArticle(null);
                            }}
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

                {/* Article Detail View */}
                {selectedArticle ? (
                    <div data-article-detail style={{
                        marginBottom: '32px',
                        backgroundColor: cardBackground,
                        border: `1px solid ${borderColor}`,
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
                                    e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <X size={18} color={textSecondary} />
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
                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
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
                                        color: textPrimary,
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
                                    <Clock size={12} color={textSecondary} />
                                    <span style={{
                                        fontSize: '12px',
                                        color: textSecondary,
                                    }}>
                                        {selectedArticle.time || '2h ago'}
                                    </span>
                                    {selectedArticle.readTime && (
                                        <>
                                            <span style={{ color: textSecondary, margin: '0 4px' }}>•</span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: textSecondary,
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
                                    color: textSecondary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '4px 10px',
                                    backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f3f4f6',
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
                            color: textPrimary,
                            margin: '0 0 16px 0',
                            letterSpacing: '-0.5px',
                        }}>
                            {selectedArticle.title || 'Article Title'}
                        </h2>

                        {/* Article Content */}
                        <div style={{
                            fontSize: '16px',
                            lineHeight: '1.7',
                            color: isDark ? colors.textSecondary || '#CBD5E1' : '#374151',
                            marginBottom: '24px',
                        }}>
                            <ArticleBodyParagraphs
                                content={selectedArticle.fullContent || selectedArticle.content || selectedArticle.full_content || ''}
                                paragraphStyle={{
                                    fontSize: '16px',
                                    lineHeight: '1.7',
                                    color: isDark ? colors.textSecondary || '#CBD5E1' : '#374151',
                                }}
                            />
                        </div>

                        {/* Actions */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '16px',
                            borderTop: `1px solid ${borderColor}`,
                        }}>
                            {/* Vote Buttons */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px',
                                backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                                borderRadius: '10px',
                            }}>
                                <button
                                    type="button"
                                    onClick={() => selectedArticle && handleVote(selectedArticle.id, 'up')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: articleDetailReaction === 'up' ? (isDark ? colors.surface || '#1E293B' : '#ffffff') : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: articleDetailReaction === 'up' ? (isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)') : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (articleDetailReaction !== 'up') {
                                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (articleDetailReaction !== 'up') {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <ChevronUp 
                                        size={16} 
                                        color={articleDetailReaction === 'up' ? '#3b82f6' : textSecondary} 
                                        strokeWidth={articleDetailReaction === 'up' ? 2.5 : 2}
                                    />
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: articleDetailReaction === 'up' ? '#3b82f6' : textSecondary,
                                    }}>
                                        Like ({Number(selectedArticle?.like_count ?? selectedArticle?.upvotes ?? 0)})
                                    </span>
                                </button>

                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    backgroundColor: borderColor,
                                }} />

                                <button
                                    type="button"
                                    onClick={() => selectedArticle && handleVote(selectedArticle.id, 'down')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: articleDetailReaction === 'down' ? (isDark ? colors.surface || '#1E293B' : '#ffffff') : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: articleDetailReaction === 'down' ? (isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)') : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (articleDetailReaction !== 'down') {
                                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#ffffff';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (articleDetailReaction !== 'down') {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <ChevronDown 
                                        size={16} 
                                        color={articleDetailReaction === 'down' ? '#ef4444' : textSecondary} 
                                        strokeWidth={articleDetailReaction === 'down' ? 2.5 : 2}
                                    />
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: articleDetailReaction === 'down' ? '#ef4444' : textSecondary,
                                    }}>
                                        Dislike ({Number(selectedArticle?.dislike_count ?? 0)})
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
                                        background: articleBookmarked ? (isDark ? '#78350F' : '#fef3c7') : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!articleBookmarked) {
                                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
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
                                        color={articleBookmarked ? '#f59e0b' : textSecondary} 
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
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <Share2 size={18} color={textSecondary} strokeWidth={2} />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* News Cards Grid */}
                {loading ? (
                    <MasonryFeedSkeleton
                        count={isMobile ? 4 : 6}
                        gap={isMobile ? 16 : isTablet ? 20 : 24}
                        {...getSkeletonFeedProps(isDark, colors)}
                    />
                ) : visibleNews.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: isMobile ? '32px 16px' : '48px 24px',
                        maxWidth: '420px',
                        margin: '0 auto',
                    }}>
                        {activeTab === 'For you' && !hasFeedPersonalization ? (
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { NewsCard } from '../../components/NewsCard';
import { mockApi } from '../../utils/Service/mockApi';
import Text from '../../components/ui/Text';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
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
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'For you');
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [votedItems, setVotedItems] = useState({});
    const [newsData, setNewsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [articleLiked, setArticleLiked] = useState(false);
    const [articleDisliked, setArticleDisliked] = useState(false);
    const [articleBookmarked, setArticleBookmarked] = useState(false);
    const [articleLikeCount, setArticleLikeCount] = useState(0);
    const [articleDislikeCount, setArticleDislikeCount] = useState(0);

    const loadNews = async () => {
        try {
            setLoading(true);
            const response = await mockApi.getNewsFeed();
            setNewsData(response.data);
        } catch (error) {
            console.error('Error loading news:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    useEffect(() => {
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const handleArticlePress = (article) => {
        setSelectedArticle(article);
        setArticleLikeCount(article.upvotes || article.votes || 0);
        setArticleDislikeCount(3);
        setArticleLiked(false);
        setArticleDisliked(false);
        setArticleBookmarked(bookmarkedItems.has(article.id));
        // Scroll to top of article detail
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
            await mockApi.voteArticle(itemId, newVote);
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
            await mockApi.bookmarkArticle(itemId);
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
                    {['For you', 'Following', 'Trending', 'Bookmarks'].map((tab) => (
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
                                    onClick={handleArticleLike}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: articleLiked ? (isDark ? colors.surface || '#1E293B' : '#ffffff') : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: articleLiked ? (isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)') : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!articleLiked) {
                                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#ffffff';
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
                                        color={articleLiked ? '#3b82f6' : textSecondary} 
                                        strokeWidth={articleLiked ? 2.5 : 2}
                                    />
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: articleLiked ? '#3b82f6' : textSecondary,
                                    }}>
                                        {articleLikeCount}
                                    </span>
                                </button>

                                <div style={{
                                    width: '1px',
                                    height: '20px',
                                    backgroundColor: borderColor,
                                }} />

                                <button
                                    onClick={handleArticleDislike}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        border: 'none',
                                        background: articleDisliked ? (isDark ? colors.surface || '#1E293B' : '#ffffff') : 'transparent',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: articleDisliked ? (isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)') : 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!articleDisliked) {
                                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#ffffff';
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
                                        color={articleDisliked ? '#ef4444' : textSecondary} 
                                        strokeWidth={articleDisliked ? 2.5 : 2}
                                    />
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: articleDisliked ? '#ef4444' : textSecondary,
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
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile 
                            ? '1fr' 
                            : isTablet 
                            ? 'repeat(auto-fill, minmax(280px, 1fr))' 
                            : 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: isMobile ? '16px' : isTablet ? '20px' : '24px',
                    }}>
                        {newsData.map((item) => (
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

export default NewsFeedScreen;

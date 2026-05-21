import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { loadExplorePage } from '../../utils/loadFeed';
import { fetchPlatformCategories } from '../../utils/Service/api';
import { NewsCard } from '../../components/NewsCard';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { ArticleBodyParagraphs } from '../../components/ArticleBodyParagraphs';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { 
    TrendingUp,
    Bookmark,
    Share2,
    Clock,
    CheckCircle,
    X
} from 'lucide-react';
import { SkeletonCategoryGrid, getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import {
    buildCategoryList,
    articleMatchesCategory,
    getCategoryIcon,
} from '../../utils/categoryMatch';
import { Search } from 'lucide-react';

const CategoriesScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const navigate = useNavigate();
    const [allNews, setAllNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredNews, setFilteredNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedItems, setVotedItems] = useState({});
    const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [articleLiked, setArticleLiked] = useState(false);
    const { success } = useUIFeedback();
    const [articleDisliked, setArticleDisliked] = useState(false);
    const [articleBookmarked, setArticleBookmarked] = useState(false);
    const [articleLikeCount, setArticleLikeCount] = useState(0);
    const [articleDislikeCount, setArticleDislikeCount] = useState(0);
    const [categorySearch, setCategorySearch] = useState('');

    const loadNews = async () => {
        try {
            setLoading(true);
            const [plat, page] = await Promise.all([
                fetchPlatformCategories().catch(() => ({ categories: [], connections: [] })),
                loadExplorePage({ limit: 200 }),
            ]);
            const newsData = page.items || [];
            setAllNews(newsData);

            const adminNames = (plat.categories || []).map((c) =>
                typeof c === 'string' ? c : c?.name || c?.id || ''
            );
            const categoryList = buildCategoryList(newsData, adminNames);
            setCategories(categoryList);
            setFilteredNews(newsData);
        } catch (error) {
            console.error("Error loading categories:", error);
            setAllNews([]);
            setCategories([]);
            setFilteredNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            setFilteredNews(allNews.filter((item) => articleMatchesCategory(item, selectedCategory)));
        } else {
            setFilteredNews(allNews);
        }
    }, [selectedCategory, allNews]);

    const visibleCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.trim().toLowerCase())
    );
    const topCategories = categories.filter((c) => c.count > 0).slice(0, 10);

    const handleCategoryClick = (categoryName) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(categoryName);
            setSelectedArticle(null);
        }
    };

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
            success('Link copied to clipboard!');
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
                        Categories
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Browse articles by category
                    </p>
                </div>

                {/* Categories Grid */}
                {loading ? (
                    <div>
                        <SkeletonCategoryGrid count={8} isDark={isDark} colors={colors} />
                        <div style={{ marginTop: 28 }}>
                            <MasonryFeedSkeleton count={6} gap={24} {...getSkeletonFeedProps(isDark, colors)} />
                        </div>
                    </div>
                ) : categories.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '48px 24px',
                        marginBottom: 40,
                        borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        backgroundColor: cardBackground,
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: textPrimary }}>
                            No categories with articles yet
                        </p>
                        <p style={{ margin: '8px 0 0', fontSize: 14, color: textSecondary }}>
                            Check back after more stories are indexed.
                        </p>
                    </div>
                ) : (
                    <div style={{ marginBottom: 40 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                            <div style={{
                                flex: '1 1 220px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '10px 14px',
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                backgroundColor: cardBackground,
                            }}>
                                <Search size={18} color={textSecondary} strokeWidth={2} />
                                <input
                                    type="search"
                                    placeholder="Search categories…"
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent', color: textPrimary }}
                                />
                            </div>
                            <span style={{ fontSize: 13, color: textSecondary }}>
                                {visibleCategories.length} of {categories.length} with articles
                            </span>
                        </div>
                        {topCategories.length > 0 && !categorySearch.trim() ? (
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Popular</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {topCategories.map((category) => {
                                        const isSelected = selectedCategory === category.name;
                                        return (
                                            <button key={`pill-${category.key}`} type="button" onClick={() => handleCategoryClick(category.name)}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 999,
                                                    border: isSelected ? `2px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}` : `1px solid ${borderColor}`,
                                                    background: isSelected ? (isDark ? colors.surfaceElevated || '#334155' : '#f1f5f9') : cardBackground,
                                                    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: textPrimary,
                                                }}>
                                                <span>{getCategoryIcon(category.name)}</span>
                                                <span>{category.name}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: textSecondary, background: isDark ? colors.background || '#0F172A' : '#e2e8f0', padding: '2px 8px', borderRadius: 999 }}>{category.count}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                        {visibleCategories.length === 0 ? (
                            <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>No categories match &ldquo;{categorySearch}&rdquo;.</p>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: '16px',
                            }}>
                                {visibleCategories.map((category) => {
                                    const isSelected = selectedCategory === category.name;
                                    return (
                                        <button
                                            key={category.key}
                                            type="button"
                                            onClick={() => handleCategoryClick(category.name)}
                                            style={{
                                                padding: '20px',
                                                border: isSelected
                                                    ? `2px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`
                                                    : `1px solid ${borderColor}`,
                                                background: isSelected
                                                    ? (isDark ? colors.surfaceElevated || '#334155' : '#f9fafb')
                                                    : cardBackground,
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'left',
                                                boxShadow: isSelected
                                                    ? (isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.08)')
                                                    : (isDark ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)'),
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = borderColor;
                                                }
                                            }}
                                        >
                                            <div style={{ fontSize: 24, marginBottom: 12 }}>{getCategoryIcon(category.name)}</div>
                                            <div style={{ fontSize: 16, fontWeight: isSelected ? 700 : 600, color: textPrimary, marginBottom: 6 }}>
                                                {category.name}
                                            </div>
                                            <div style={{ fontSize: 13, color: textSecondary }}>
                                                {category.count} {category.count === 1 ? 'article' : 'articles'}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

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
                                    <TrendingUp 
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
                                    <TrendingUp 
                                        size={16} 
                                        style={{ transform: 'rotate(180deg)' }}
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

                {/* Selected Category Articles */}
                {selectedCategory && (
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px',
                        }}>
                            <div>
                                <h2 style={{
                                    fontSize: '22px',
                                    fontWeight: '700',
                                    color: textPrimary,
                                    margin: '0 0 4px 0',
                                }}>
                                    {selectedCategory} Articles
                                </h2>
                                <p style={{
                                    fontSize: '14px',
                                    color: textSecondary,
                                    margin: '0',
                                }}>
                                    {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'} found
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                style={{
                                    padding: '8px 16px',
                                    border: `1px solid ${borderColor}`,
                                    background: cardBackground,
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                    e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = borderColor;
                                    e.currentTarget.style.backgroundColor = cardBackground;
                                }}
                            >
                                Clear Filter
                            </button>
                        </div>

                        {filteredNews.length === 0 ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '60px 20px',
                            }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    margin: '0 0 8px 0',
                                }}>
                                    No articles in this category
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: textSecondary,
                                    margin: '0',
                                }}>
                                    Try selecting a different category
                                </p>
                            </div>
                        ) : (
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
                        )}
                    </div>
                )}

                {/* Show all articles when no category selected */}
                {!selectedCategory && !selectedArticle && (
                    <div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0 0 24px 0',
                        }}>
                            All Articles
                        </h2>
                        <MasonryFeed gap={24}>
                            {allNews.map((item) => (
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

export default CategoriesScreen;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
    ChevronLeft, 
    ChevronUp, 
    ChevronDown, 
    Bookmark, 
    Share2, 
    Clock, 
    CheckCircle,
    MoreHorizontal,
    ArrowLeft
} from 'lucide-react';
import { useUIFeedback } from '../../components/ui/UIFeedback';

const ArticleDetailScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const article = location.state?.article || {
        id: id,
        title: 'Article Title',
        source: 'Source',
        time: '2h ago',
        category: 'News',
        fullContent: 'Article content goes here...',
        description: 'Article description...',
        excerpt: 'Article excerpt...',
        upvotes: 24,
        votes: 24,
        verified: true,
        trending: false,
        readTime: 5,
    };
    const { success } = useUIFeedback();
    
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(article.upvotes || article.votes || 24);
    const [dislikeCount, setDislikeCount] = useState(3);
    const [scrollY, setScrollY] = useState(0);

    const handleLike = () => {
        if (isDisliked) {
            setIsDisliked(false);
            setDislikeCount(dislikeCount - 1);
        }
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleDislike = () => {
        if (isLiked) {
            setIsLiked(false);
            setLikeCount(likeCount - 1);
        }
        setIsDisliked(!isDisliked);
        setDislikeCount(isDisliked ? dislikeCount - 1 : dislikeCount + 1);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt || article.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            success('Link copied to clipboard!');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const content = article.fullContent || article.content || article.excerpt || article.description || 'Article content goes here...';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#ffffff',
            paddingTop: '64px',
        }}>
            {/* Header */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e5e7eb',
                zIndex: 1000,
                padding: '12px 24px',
                boxShadow: scrollY > 10 ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                transform: 'translateY(0)',
                transition: 'box-shadow 0.2s ease',
            }}>
                <div style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
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
                        <ArrowLeft size={18} color="#0f172a" />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#0f172a',
                        }}>
                            Back
                        </span>
                    </button>
                    <button
                        style={{
                            padding: '8px',
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
                        <MoreHorizontal size={18} color="#64748b" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <article style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 24px 120px 24px',
            }}>
                {/* Source Info */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px',
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
                            {article.source?.substring(0, 2).toUpperCase() || 'N'}
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
                                {article.source || 'Source'}
                            </span>
                            {article.verified && (
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
                                {article.time || '2h ago'}
                            </span>
                            {article.readTime && (
                                <>
                                    <span style={{ color: '#9ca3af', margin: '0 4px' }}>•</span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                    }}>
                                        {article.readTime} min read
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Category Tag */}
                {article.category && (
                    <div style={{
                        marginBottom: '20px',
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
                            {article.category}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: '700',
                    lineHeight: '1.3',
                    color: '#0f172a',
                    margin: '0 0 20px 0',
                    letterSpacing: '-0.5px',
                }}>
                    {article.title || 'Article Title'}
                </h1>

                {/* Article Content */}
                <div style={{
                    fontSize: '17px',
                    lineHeight: '1.8',
                    color: '#374151',
                    marginBottom: '40px',
                }}>
                    {content.split('\n').map((paragraph, index) => (
                        <p key={index} style={{
                            margin: '0 0 20px 0',
                        }}>
                            {paragraph || '\u00A0'}
                        </p>
                    ))}
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    backgroundColor: '#e5e7eb',
                    margin: '40px 0',
                }} />
            </article>

            {/* Bottom Actions Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e5e7eb',
                padding: '16px 24px',
                zIndex: 1000,
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
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
                            onClick={handleLike}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                border: 'none',
                                background: isLiked ? '#ffffff' : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isLiked ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (!isLiked) {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLiked) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <ChevronUp 
                                size={16} 
                                color={isLiked ? '#3b82f6' : '#64748b'} 
                                strokeWidth={isLiked ? 2.5 : 2}
                            />
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: isLiked ? '#3b82f6' : '#64748b',
                            }}>
                                {likeCount}
                            </span>
                        </button>

                        <div style={{
                            width: '1px',
                            height: '20px',
                            backgroundColor: '#e5e7eb',
                        }} />

                        <button
                            onClick={handleDislike}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                border: 'none',
                                background: isDisliked ? '#ffffff' : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isDisliked ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (!isDisliked) {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isDisliked) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <ChevronDown 
                                size={16} 
                                color={isDisliked ? '#ef4444' : '#64748b'} 
                                strokeWidth={isDisliked ? 2.5 : 2}
                            />
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: isDisliked ? '#ef4444' : '#64748b',
                            }}>
                                {dislikeCount}
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
                            onClick={handleBookmark}
                            style={{
                                padding: '8px',
                                border: 'none',
                                background: isBookmarked ? '#fef3c7' : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!isBookmarked) {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isBookmarked) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <Bookmark 
                                size={18} 
                                color={isBookmarked ? '#f59e0b' : '#9ca3af'} 
                                fill={isBookmarked ? '#f59e0b' : 'none'}
                                strokeWidth={2}
                            />
                        </button>

                        <button
                            onClick={handleShare}
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
        </div>
    );
};

export default ArticleDetailScreen;

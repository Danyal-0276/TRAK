import React from 'react';
import { useTheme } from '../theme/ThemeContext';
import {
    ChevronUp,
    ChevronDown,
    Bookmark,
    Share2,
    MoreHorizontal,
    TrendingUp,
    CheckCircle,
    Clock,
    ArrowRight,
} from 'lucide-react';

export const NewsCard = ({ item, onPress, votedItems, bookmarkedItems, onVote, onBookmark }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const itemId = item?.id != null ? String(item.id) : '';
    const isBookmarked = bookmarkedItems?.has(itemId) || bookmarkedItems?.has(item.id);
    const voteType = votedItems?.[itemId] ?? votedItems?.[item.id];
    const likeCount = Number(item.like_count ?? item.upvotes ?? 0);
    const dislikeCount = Number(item.dislike_count ?? 0);

    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    return (
        <article
            onClick={onPress}
            style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div style={{
                backgroundColor: cardBackground,
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = isDark 
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = borderColor;
            }}
            >
                {/* Image */}
                {item.image && (
                    <div style={{
                        width: '100%',
                        height: '180px',
                        backgroundColor: '#f3f4f6',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <img 
                            src={item.image} 
                            alt={item.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                            }}
                        />
                        {item.trending && (
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                backgroundColor: isDark ? colors.surface || '#1E293B' : '#ffffff',
                                borderRadius: '4px',
                                boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                            }}>
                                <TrendingUp size={12} color="#f59e0b" />
                                <span style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#f59e0b',
                                }}>
                                    Trending
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flex: 1,
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: '#ffffff',
                                    letterSpacing: '0.5px',
                                }}>
                                    {item.source?.substring(0, 2).toUpperCase() || 'N'}
                                </span>
                            </div>
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                    }}>
                                        {item.source || 'Source'}
                                    </span>
                                    {item.verified && (
                                        <CheckCircle size={12} color="#10b981" fill="#10b981" />
                                    )}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginTop: '2px',
                                }}>
                                    <Clock size={10} color={textSecondary} />
                                    <span style={{
                                        fontSize: '11px',
                                        color: textSecondary,
                                    }}>
                                        {item.time || '2h ago'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            style={{
                                padding: '4px',
                                border: 'none',
                                background: 'transparent',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <MoreHorizontal size={16} color={textSecondary} />
                        </button>
                    </div>

                    {/* Category Tag */}
                    {item.category && (
                        <div style={{
                            marginBottom: '10px',
                        }}>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: textSecondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                padding: '3px 8px',
                                backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f3f4f6',
                                borderRadius: '4px',
                                display: 'inline-block',
                            }}>
                                {item.category}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        lineHeight: '1.4',
                        margin: '0 0 8px 0',
                        color: textPrimary,
                        letterSpacing: '-0.2px',
                    }}>
                        {item.title || 'News Title'}
                    </h3>

                    {/* Summary (full text, card height grows with content) */}
                    {(item.description || item.excerpt || item.summary) && (
                        <p style={{
                            fontSize: '13px',
                            lineHeight: '1.5',
                            margin: '0 0 16px 0',
                            color: textSecondary,
                            whiteSpace: 'pre-wrap',
                        }}>
                            {item.description || item.excerpt || item.summary}
                        </p>
                    )}

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: `1px solid ${borderColor}`,
                        marginTop: 'auto',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onVote?.(itemId || item.id, 'up');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    border: 'none',
                                    background: voteType === 'up' 
                                        ? (isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff')
                                        : 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (voteType !== 'up') {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (voteType !== 'up') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <ChevronUp 
                                    size={14} 
                                    color={voteType === 'up' ? '#3b82f6' : textSecondary} 
                                    strokeWidth={voteType === 'up' ? 2.5 : 2}
                                />
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: voteType === 'up' ? '#3b82f6' : textSecondary,
                                }}>
                                    {likeCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onVote?.(itemId || item.id, 'down');
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '4px 8px',
                                    border: 'none',
                                    background: voteType === 'down'
                                        ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2')
                                        : 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (voteType !== 'down') {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (voteType !== 'down') {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <ChevronDown
                                    size={14}
                                    color={voteType === 'down' ? '#ef4444' : textSecondary}
                                    strokeWidth={voteType === 'down' ? 2.5 : 2}
                                />
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: voteType === 'down' ? '#ef4444' : textSecondary,
                                }}>
                                    {dislikeCount}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onBookmark?.(itemId || item.id);
                                }}
                                style={{
                                    padding: '4px',
                                    border: 'none',
                                    background: isBookmarked 
                                        ? (isDark ? '#78350F' : '#fef3c7')
                                        : 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isBookmarked) {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isBookmarked) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <Bookmark 
                                    size={14} 
                                    color={isBookmarked ? '#f59e0b' : textSecondary} 
                                    fill={isBookmarked ? '#f59e0b' : 'none'}
                                    strokeWidth={2}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const url = item.canonical_url || item.url || (typeof window !== 'undefined' ? window.location.href : '');
                                    if (navigator.share) {
                                        navigator.share({
                                            title: item.title,
                                            text: item.excerpt || item.description || '',
                                            url,
                                        }).catch(() => {});
                                    } else if (url && navigator.clipboard?.writeText) {
                                        navigator.clipboard.writeText(url);
                                    }
                                }}
                                style={{
                                    padding: '4px',
                                    border: 'none',
                                    background: 'transparent',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <Share2 size={14} color={textSecondary} strokeWidth={2} />
                            </button>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onPress?.();
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                border: `1px solid ${borderColor}`,
                                background: isDark ? colors.surfaceElevated || '#334155' : '#ffffff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: textPrimary,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = borderColor;
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#ffffff';
                            }}
                        >
                            Read
                            <ArrowRight size={12} color={textPrimary} />
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { getCardSummaryText } from '../utils/articleNavigation';
import {
    ChevronUp,
    ChevronDown,
    Bookmark,
    Share2,
    MoreHorizontal,
    TrendingUp,
    CheckCircle,
    AlertTriangle,
    Clock,
    ArrowRight,
} from 'lucide-react';
import { getFeedItemCredibilityMeta, LABEL_STYLES } from '../utils/credibilityIndicator';
import { prefetchArticleDetail } from '../utils/articleDetailCache';
import { getUserArticleImageProxyUrl, resolveArticleImageUrl } from '../utils/articleMedia';
import ArticleCardImage from './ArticleCardImage';
import FeedbackModal from './FeedbackModal';
import { useUIFeedback } from './ui/UIFeedback';
import { downloadArticlePdf } from '../utils/articlePdfExport';
import { shareArticleLink } from '../utils/articleShare';

export const NewsCard = ({ item, onPress, votedItems, bookmarkedItems, onVote, onBookmark, layout = 'grid' }) => {
    const isMasonry = layout === 'masonry';
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const [showMenu, setShowMenu] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const { success } = useUIFeedback();
    const menuRef = useRef(null);
    const itemId = item?.id != null ? String(item.id) : '';
    const isBookmarked = bookmarkedItems?.has(itemId) || bookmarkedItems?.has(item.id);
    const voteType = votedItems?.[itemId] ?? votedItems?.[item.id] ?? item?.userReaction ?? null;
    const likeCount = Number(item.like_count ?? item.upvotes ?? 0);
    const dislikeCount = Number(item.dislike_count ?? 0);
    const cardSummary = getCardSummaryText(item);
    const credMeta = getFeedItemCredibilityMeta(item);
    const itemUrl = item?.canonical_url || item?.url || '';
    const credLabel = String(item.credibilityLabel || credMeta.labelKey || '').toLowerCase();
    const isFake = !!item.isFake || credMeta.labelKey === 'fake';
    const isSuspicious =
        !!item.isLowCredibility ||
        credMeta.labelKey === 'suspicious' ||
        credLabel === 'suspicious';
    const credPalette = isFake
        ? LABEL_STYLES.fake
        : isSuspicious
            ? LABEL_STYLES.suspicious
            : credMeta.labelKey === 'real'
                ? LABEL_STYLES.real
                : LABEL_STYLES.unknown;
    const credBg = credPalette.bg;
    const credFg = credPalette.color;
    const credText = isFake
        ? 'Fake / Low credibility'
        : credLabel === 'suspicious'
          ? 'Suspicious'
          : credLabel === 'real'
            ? 'Verified / Higher credibility'
            : credMeta.labelName || 'Credibility';
    const cardImage = resolveArticleImageUrl(item);
    const imagePlaceholderBg = isDark ? colors.surfaceElevated || colors.backgroundSecondary : '#f3f4f6';

    useEffect(() => {
        if (!showMenu) return undefined;
        const onDocClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showMenu]);

    const cardBackground = isDark ? colors.surface : '#ffffff';
    const textPrimary = colors.textPrimary;
    const textSecondary = isDark ? colors.textSecondary : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    return (
        <>
        <article
            onClick={onPress}
            style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                height: isMasonry ? 'auto' : '100%',
                display: isMasonry ? 'block' : 'flex',
                flexDirection: isMasonry ? undefined : 'column',
                breakInside: isMasonry ? 'avoid' : undefined,
                WebkitColumnBreakInside: isMasonry ? 'avoid' : undefined,
                width: '100%',
            }}
        >
            <div style={{
                backgroundColor: cardBackground,
                borderRadius: isMasonry ? '16px' : '8px',
                border: `1px solid ${borderColor}`,
                overflow: 'hidden',
                height: isMasonry ? 'auto' : '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
                if (itemId) prefetchArticleDetail(itemId);
                e.currentTarget.style.boxShadow = isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = isDark ? colors.borderLight : '#d1d5db';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = borderColor;
            }}
            >
                {/* Hero image (same pattern as admin article cards) */}
                {cardImage ? (
                    <div style={{
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        backgroundColor: imagePlaceholderBg,
                    }}>
                        <ArticleCardImage
                            src={cardImage}
                            alt={item.title || 'Article'}
                            maxHeight={isMasonry ? 280 : 220}
                            borderRadius={0}
                            dynamicAspect
                            backgroundColor={imagePlaceholderBg}
                            getProxyUrl={getUserArticleImageProxyUrl}
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
                                backgroundColor: isDark ? colors.surface : '#ffffff',
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
                ) : null}

                <div style={{
                    padding: isMasonry ? '16px' : '20px',
                    flex: isMasonry ? '0 0 auto' : 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
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
                            minWidth: 0,
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: colors.primary,
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: colors.textOnPrimary || (isDark ? '#0a0a0a' : '#ffffff'),
                                    letterSpacing: '0.5px',
                                }}>
                                    {item.source?.substring(0, 2).toUpperCase() || 'N'}
                                </span>
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    minWidth: 0,
                                }}>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {item.source || 'Source'}
                                    </span>
                                    {credMeta.show && credMeta.labelKey === 'fake' ? (
                                        <AlertTriangle
                                            size={12}
                                            color={credMeta.style.color}
                                            strokeWidth={2.5}
                                            title={credMeta.labelName}
                                        />
                                    ) : credMeta.show ? (
                                        <CheckCircle
                                            size={12}
                                            color={credMeta.style.color}
                                            fill={credMeta.style.color}
                                            title={credMeta.labelName}
                                        />
                                    ) : item.verified ? (
                                        <CheckCircle size={12} color="#10b981" fill="#10b981" />
                                    ) : null}
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
                        <div ref={menuRef} style={{ position: 'relative' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu((v) => !v);
                            }}
                            aria-label="Article options"
                            style={{
                                padding: '4px',
                                border: 'none',
                                background: 'transparent',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <MoreHorizontal size={16} color={textSecondary} />
                        </button>
                        {showMenu ? (
                            <div
                                role="menu"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: 'calc(100% + 4px)',
                                    zIndex: 20,
                                    minWidth: 180,
                                    background: colors.surface,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: 10,
                                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(0,0,0,0.12)',
                                    overflow: 'hidden',
                                }}
                            >
                                {[
                                    {
                                        label: 'Share TRAK link',
                                        onClick: async () => {
                                            setShowMenu(false);
                                            const result = await shareArticleLink(item, itemId);
                                            if (result?.method === 'clipboard') {
                                                success('TRAK link copied to clipboard!');
                                            }
                                        },
                                    },
                                    ...(itemUrl
                                        ? [{
                                            label: 'Open original',
                                            onClick: () => {
                                                setShowMenu(false);
                                                window.open(itemUrl, '_blank', 'noopener,noreferrer');
                                            },
                                        }]
                                        : []),
                                    {
                                        label: 'Export PDF',
                                        onClick: () => {
                                            setShowMenu(false);
                                            downloadArticlePdf(item);
                                            success('PDF export downloaded.');
                                        },
                                    },
                                    {
                                        label: 'Report or give feedback',
                                        danger: true,
                                        onClick: () => {
                                            setShowMenu(false);
                                            setFeedbackOpen(true);
                                        },
                                    },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        type="button"
                                        role="menuitem"
                                        onClick={action.onClick}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: 'transparent',
                                            textAlign: 'left',
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: action.danger ? colors.error : textPrimary,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                        </div>
                    </div>

                    {/* Category, credibility & trending */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                        {item.category ? (
                            <span style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: textSecondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                padding: '5px 10px',
                                backgroundColor: isDark ? colors.surfaceElevated : '#f3f4f6',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${colors.primary}`,
                            }}>
                                {item.category}
                            </span>
                        ) : null}
                        <span style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            padding: '5px 10px',
                            borderRadius: '4px',
                            borderLeft: `3px solid ${credFg}`,
                            backgroundColor: credBg,
                            color: credFg,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                        }}>
                            {isFake || isSuspicious ? (
                                <AlertTriangle size={11} color={credFg} />
                            ) : (
                                <CheckCircle size={11} color={credFg} />
                            )}
                            {credText}
                        </span>
                        {item.trending ? (
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                color: colors.error || '#dc2626',
                                backgroundColor: isDark ? '#450a0a' : colors.errorBg || '#FEE2E2',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                borderLeft: `3px solid ${colors.error || '#dc2626'}`,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                            }}>
                                <TrendingUp size={11} color={colors.error || '#dc2626'} />
                                Trending
                            </span>
                        ) : null}
                    </div>

                    {/* Title */}
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

                    {/* Summary (full pipeline summary; body snippet if summary missing) */}
                    {cardSummary ? (
                        <p style={{
                            fontSize: '13px',
                            lineHeight: '1.5',
                            margin: '0 0 16px 0',
                            color: textSecondary,
                            whiteSpace: 'pre-wrap',
                        }}>
                            {cardSummary}
                        </p>
                    ) : null}

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '12px',
                        borderTop: `1px solid ${borderColor}`,
                        marginTop: isMasonry ? '12px' : 'auto',
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
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#f9fafb';
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
                                    color={voteType === 'up' ? colors.primary : textSecondary} 
                                    strokeWidth={voteType === 'up' ? 2.5 : 2}
                                />
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: voteType === 'up' ? colors.primary : textSecondary,
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
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#f9fafb';
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
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#f9fafb';
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
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const result = await shareArticleLink(item, itemId);
                                    if (result?.method === 'clipboard') {
                                        success('TRAK link copied to clipboard!');
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
                                    e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#f9fafb';
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
                                background: isDark ? colors.surfaceElevated : '#ffffff',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: textPrimary,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = colors.primary;
                                e.currentTarget.style.backgroundColor = isDark ? colors.surface : '#f9fafb';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = borderColor;
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#ffffff';
                            }}
                        >
                            Read
                            <ArrowRight size={12} color={textPrimary} />
                        </button>
                    </div>
                </div>
            </div>
        </article>
        <FeedbackModal
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            item={item}
            type="article_report"
        />
        </>
    );
};

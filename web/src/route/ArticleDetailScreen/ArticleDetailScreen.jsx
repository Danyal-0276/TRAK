import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
    ChevronLeft, 
    ChevronUp, 
    ChevronDown, 
    Bookmark, 
    Share2, 
    Clock, 
    CheckCircle,
    AlertTriangle,
    MoreHorizontal,
    ArrowLeft
} from 'lucide-react';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { addBookmark, getUserArticleDetail, listBookmarks, listReactions, removeBookmark, setReaction, submitArticleReport } from '../../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { mapApiItem } from '../../utils/loadFeed';
import { getFeedItemCredibilityMeta } from '../../utils/credibilityIndicator';
import { normalizeArticleForDetail, getArticleListenText } from '../../utils/articleNavigation';
import { buildHighlightLinesFromContent } from '../../utils/ttsHighlight';
import { ArticleBodyParagraphs } from '../../components/ArticleBodyParagraphs';
import ArticleTtsPlayer from '../../components/ArticleTtsPlayer';
import TrakLogo from '../../components/TrakLogo';
import { useTheme } from '../../theme/ThemeContext';

const ArticleDetailScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { colors } = theme;
    const location = useLocation();
    const { id: routeArticleId } = useParams();

    const initialArticle = normalizeArticleForDetail(
        location.state?.article || { id: routeArticleId }
    );
    const [article, setArticle] = useState(initialArticle);
    const [detailLoading, setDetailLoading] = useState(
        !initialArticle.fullContent && !initialArticle.content && !location.state?.fetchError
    );
    const [fetchError, setFetchError] = useState(location.state?.fetchError || '');

    const articleKey = String(article.id || routeArticleId || '').trim();
    const credMeta = getFeedItemCredibilityMeta(article);
    const { success, error: notifyError, confirm } = useUIFeedback();
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const [reaction, setReactionState] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [dislikeCount, setDislikeCount] = useState(0);
    const [reactionPending, setReactionPending] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    const submitReaction = async (next) => {
        if (reactionPending || !articleKey) return;
        const previous = reaction;
        setReactionPending(true);
        setReactionState(next);
        setReactionForArticle(articleKey, next);
        try {
            const data = await setReaction(
                articleKey,
                next === 'up' ? 'like' : next === 'down' ? 'dislike' : 'none'
            );
            setLikeCount(Number(data.like_count ?? 0));
            setDislikeCount(Number(data.dislike_count ?? 0));
        } catch {
            setReactionState(previous);
            setReactionForArticle(articleKey, previous || null);
        } finally {
            setReactionPending(false);
        }
    };

    const handleLike = () => submitReaction(reaction === 'up' ? null : 'up');
    const handleDislike = () => submitReaction(reaction === 'down' ? null : 'down');

    const handleBookmark = async () => {
        if (!articleKey) return;
        const previous = isBookmarked;
        const next = !previous;
        setIsBookmarked(next);
        const ids = new Set(getBookmarkIds());
        if (next) ids.add(articleKey);
        else ids.delete(articleKey);
        setBookmarkIds(Array.from(ids));
        try {
            if (previous) await removeBookmark(articleKey);
            else await addBookmark(articleKey, article?.title || '', article?.canonical_url || article?.url || '');
        } catch {
            setIsBookmarked(previous);
            const rollback = new Set(getBookmarkIds());
            if (previous) rollback.add(articleKey);
            else rollback.delete(articleKey);
            setBookmarkIds(Array.from(rollback));
        }
    };

    const handleShare = () => {
        const url = article.canonical_url || article.url || window.location.href;
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.excerpt || article.description,
                url,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            success('Link copied to clipboard!');
        }
        setShowMoreMenu(false);
    };

    const handleOpenOriginal = () => {
        const url = article.canonical_url || article.url;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        setShowMoreMenu(false);
    };

    const handleReport = async () => {
        setShowMoreMenu(false);
        const ok = await confirm({
            title: 'Report this article?',
            message: 'Our team will review this content.',
            confirmText: 'Report',
            danger: true,
        });
        if (!ok) return;
        try {
            await submitArticleReport({
                article_id: articleKey,
                url: article.canonical_url || article.url || '',
                reason: 'user_report',
            });
            success('Report submitted. Thank you.');
        } catch (e) {
            notifyError(e?.message || 'Could not submit report.');
        }
    };

    useEffect(() => {
        const fromNav = normalizeArticleForDetail(location.state?.article || { id: routeArticleId });
        if (fromNav.id && (fromNav.fullContent || fromNav.content)) {
            setArticle(fromNav);
        }
        const id = String(routeArticleId || fromNav.id || '').trim();
        if (!id) {
            setDetailLoading(false);
            return;
        }
        let cancelled = false;
        const needsLoader = !fromNav.fullContent && !fromNav.content;
        if (needsLoader) setDetailLoading(true);
        setFetchError(location.state?.fetchError || '');
        (async () => {
            try {
                const doc = await getUserArticleDetail(id);
                if (cancelled) return;
                const mapped = normalizeArticleForDetail(mapApiItem(doc));
                setArticle((prev) => ({ ...prev, ...mapped, id }));
                setLikeCount(Number(doc.like_count ?? mapped.like_count ?? 0));
                setDislikeCount(Number(doc.dislike_count ?? mapped.dislike_count ?? 0));
                setFetchError('');
            } catch (e) {
                if (!cancelled) {
                    const msg = e?.message || 'Could not load this article.';
                    console.warn('Article fetch:', msg);
                    setFetchError(msg);
                }
            } finally {
                if (!cancelled) setDetailLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [routeArticleId, location.state?.article]);

    useEffect(() => {
        if (!articleKey) return;
        setLikeCount(Number(article.like_count ?? article.upvotes ?? article.votes ?? 0));
        setDislikeCount(Number(article.dislike_count ?? 0));
        const cachedIds = new Set(getBookmarkIds().map(String));
        setIsBookmarked(cachedIds.has(articleKey));
        const cachedReaction = getReactionMap()[articleKey] || null;
        setReactionState(cachedReaction);
        (async () => {
            const [bmRes, reactRes] = await Promise.all([
                listBookmarks().catch(() => ({ results: [] })),
                listReactions().catch(() => ({ results: [] })),
            ]);
            const ids = (bmRes.results || []).map((b) => String(b.article_id));
            setBookmarkIds(ids);
            setIsBookmarked(ids.includes(articleKey));
            const map = mergeReactionRows(reactRes.results || [], { replace: false });
            setReactionState(map[articleKey] || null);
        })();

        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [articleKey, article.like_count, article.dislike_count]);

    const content = article.fullContent || article.content || article.full_content || '';
    const showPlaceholder = !content.trim() && !detailLoading;
    const [activeTtsLineIndex, setActiveTtsLineIndex] = useState(-1);
    const listenText = getArticleListenText(article);
    const { lines: ttsHighlightLines } = useMemo(
        () => buildHighlightLinesFromContent(content, listenText),
        [content, listenText]
    );

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: colors.background,
            paddingTop: '64px',
        }}>
            {/* Header */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.surface,
                borderBottom: `1px solid ${colors.border}`,
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
                    position: 'relative',
                }}>
                    <button
                        type="button"
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
                            e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <ArrowLeft size={18} color={colors.textPrimary} />
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                        }}>
                            Back
                        </span>
                    </button>
                    <div
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                        }}
                        aria-hidden
                    >
                        <TrakLogo size={28} />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            aria-label="More options"
                            aria-expanded={showMoreMenu}
                            onClick={() => setShowMoreMenu((v) => !v)}
                            style={{
                                padding: '8px',
                                border: 'none',
                                background: showMoreMenu ? colors.backgroundSecondary : 'transparent',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <MoreHorizontal size={18} color={colors.textSecondary} />
                        </button>
                        {showMoreMenu ? (
                            <>
                                <button
                                    type="button"
                                    aria-label="Close menu"
                                    onClick={() => setShowMoreMenu(false)}
                                    style={{
                                        position: 'fixed',
                                        inset: 0,
                                        zIndex: 1099,
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'default',
                                    }}
                                />
                                <div
                                    role="menu"
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 'calc(100% + 6px)',
                                        zIndex: 1100,
                                        minWidth: 180,
                                        background: colors.surface,
                                        border: `1px solid ${colors.border}`,
                                        borderRadius: 10,
                                        boxShadow: colors.shadowDark ? `0 8px 24px ${colors.shadowDark}` : '0 8px 24px rgba(0,0,0,0.12)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {[
                                        { label: 'Share', onClick: handleShare },
                                        ...(article.canonical_url || article.url
                                            ? [{ label: 'Open original', onClick: handleOpenOriginal }]
                                            : []),
                                        { label: 'Report article', onClick: handleReport, danger: true },
                                    ].map((item) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            role="menuitem"
                                            onClick={item.onClick}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                padding: '12px 14px',
                                                border: 'none',
                                                background: 'transparent',
                                                textAlign: 'left',
                                                fontSize: 14,
                                                fontWeight: 500,
                                                color: item.danger ? colors.error : colors.textPrimary,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </div>
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
                        backgroundColor: colors.primary,
                    }}>
                        <span style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: colors.textOnPrimary || '#ffffff',
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
                                color: colors.textPrimary,
                            }}>
                                {article.source || 'Source'}
                            </span>
                            {credMeta.show && credMeta.labelKey === 'fake' ? (
                                <AlertTriangle size={14} color={credMeta.style.color} strokeWidth={2.5} />
                            ) : credMeta.show ? (
                                <CheckCircle size={14} color={credMeta.style.color} fill={credMeta.style.color} />
                            ) : article.verified ? (
                                <CheckCircle size={14} color="#10b981" fill="#10b981" />
                            ) : null}
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '2px',
                        }}>
                            <Clock size={12} color={colors.textTertiary} />
                            <span style={{
                                fontSize: '12px',
                                color: colors.textTertiary,
                            }}>
                                {article.time || '2h ago'}
                            </span>
                            {article.readTime && (
                                <>
                                    <span style={{ color: colors.textTertiary, margin: '0 4px' }}>•</span>
                                    <span style={{
                                        fontSize: '12px',
                                        color: colors.textTertiary,
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
                            color: colors.textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            padding: '4px 10px',
                            backgroundColor: colors.backgroundSecondary,
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
                    color: colors.textPrimary,
                    margin: '0 0 20px 0',
                    letterSpacing: '-0.5px',
                }}>
                    {article.title || 'Article Title'}
                </h1>

                <ArticleTtsPlayer
                    text={listenText}
                    disabled={!!fetchError}
                    highlightLines={ttsHighlightLines}
                    onActiveLineIndex={setActiveTtsLineIndex}
                />

                {/* Article Content */}
                <div style={{
                    fontSize: '17px',
                    lineHeight: '1.8',
                    color: colors.textSecondary,
                    marginBottom: '40px',
                }}>
                    {detailLoading ? (
                        <p style={{ color: colors.textTertiary }}>Loading article…</p>
                    ) : fetchError ? (
                        <div style={{
                            padding: '16px',
                            borderRadius: '8px',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#991b1b',
                            fontSize: '15px',
                            lineHeight: 1.5,
                        }}>
                            {fetchError}
                            <p style={{ marginTop: '12px', color: '#7f1d1d', fontSize: '14px' }}>
                                Mock feed articles cannot load from the API. Use real articles from explore, or set{' '}
                                <code style={{ fontSize: '13px' }}>VITE_API_URL</code> to the deployed backend in{' '}
                                <code style={{ fontSize: '13px' }}>TRAK/web/.env</code>.
                            </p>
                        </div>
                    ) : showPlaceholder ? (
                        <p style={{ color: colors.textTertiary }}>No article body available.</p>
                    ) : (
                        <ArticleBodyParagraphs
                            content={content}
                            paragraphStyle={{ fontSize: '17px', lineHeight: '1.8', color: colors.textSecondary }}
                            highlightLines={ttsHighlightLines}
                            activeLineIndex={activeTtsLineIndex}
                        />
                    )}
                </div>

                {/* Divider */}
                <div style={{
                    height: '1px',
                    backgroundColor: colors.border,
                    margin: '40px 0',
                }} />
            </article>

            {/* Bottom Actions Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: colors.background,
                borderTop: `1px solid ${colors.border}`,
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
                        backgroundColor: colors.backgroundSecondary,
                        borderRadius: '10px',
                    }}>
                        <button
                            onClick={handleLike}
                            disabled={reactionPending}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                border: 'none',
                                background: reaction === 'up' ? colors.surface : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: reaction === 'up' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                                opacity: reactionPending ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (reaction !== 'up') {
                                    e.currentTarget.style.backgroundColor = colors.surface;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (reaction !== 'up') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <ChevronUp 
                                size={16} 
                                color={reaction === 'up' ? colors.primary : colors.textSecondary} 
                                strokeWidth={reaction === 'up' ? 2.5 : 2}
                            />
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: reaction === 'up' ? colors.primary : colors.textSecondary,
                            }}>
                                {likeCount}
                            </span>
                        </button>

                        <div style={{
                            width: '1px',
                            height: '20px',
                            backgroundColor: colors.border,
                        }} />

                        <button
                            onClick={handleDislike}
                            disabled={reactionPending}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                border: 'none',
                                background: reaction === 'down' ? colors.surface : 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: reaction === 'down' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                                opacity: reactionPending ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (reaction !== 'down') {
                                    e.currentTarget.style.backgroundColor = colors.surface;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (reaction !== 'down') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <ChevronDown 
                                size={16} 
                                color={reaction === 'down' ? colors.error : colors.textSecondary} 
                                strokeWidth={reaction === 'down' ? 2.5 : 2}
                            />
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: reaction === 'down' ? colors.error : colors.textSecondary,
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
                                    e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
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
                                color={isBookmarked ? colors.warning || '#f59e0b' : colors.textTertiary} 
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
                                e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <Share2 size={18} color={colors.textTertiary} strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailScreen;

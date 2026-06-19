import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
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
import FeedbackModal from '../../components/FeedbackModal';
import { getUserArticleDetail, listBookmarks, listReactions, setReaction } from '../../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../../utils/bookmarksStorage';
import { getReactionMap, mergeReactionRows, setReactionForArticle } from '../../utils/reactionsStorage';
import { computeOptimisticReactionCounts } from '../../utils/reactionVote';
import { emitArticleInteractionChange, subscribeArticleInteractionChange } from '../../utils/articleInteractionEvents';
import {
    toggleVoteRegistered,
    scheduleVotePersist,
    setRegisteredVote,
    getRegisteredVote,
} from '../../utils/articleVoteController';
import { emitBookmarkToggle, queueBookmarkApi } from '../../utils/articleBookmarkController';
import { mapApiItem } from '../../utils/loadFeed';
import { getFeedItemCredibilityMeta } from '../../utils/credibilityIndicator';
import { normalizeArticleForDetail, getArticleListenText } from '../../utils/articleNavigation';
import { buildHighlightLinesFromContent } from '../../utils/ttsHighlight';
import { ArticleBodyParagraphs } from '../../components/ArticleBodyParagraphs';
import ArticleTtsPlayer from '../../components/ArticleTtsPlayer';
import TrakLogo from '../../components/TrakLogo';
import { useTheme } from '../../theme/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonArticleDetail } from '../../components/skeletons/SkeletonLayouts';
import { getCachedArticleDetail, setCachedArticleDetail } from '../../utils/articleDetailCache';
import { getUserFacingError } from '../../utils/getUserFacingError';
import { useResponsive } from '../../hooks/useResponsive';
import ArticleCardImage from '../../components/ArticleCardImage';
import { resolveArticleImageUrl, getUserArticleImageProxyUrl } from '../../utils/articleMedia';
import { downloadArticlePdf } from '../../utils/articlePdfExport';
import { shareArticleLink } from '../../utils/articleShare';

const ARTICLE_HEADER_HEIGHT = 56;

const ArticleDetailScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { colors } = theme;
    const { isDesktop, isMobile } = useResponsive();
    const headerPadX = isMobile ? 16 : 24;
    const headerPadRight = headerPadX + (isDesktop ? 280 : 0);
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

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [routeArticleId]);

    const credMeta = getFeedItemCredibilityMeta(article);
    const { success, error: notifyError, confirm } = useUIFeedback();
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [feedbackOpen, setFeedbackOpen] = useState(false);

    const [reaction, setReactionState] = useState(() => {
        const key = String(initialArticle.id || routeArticleId || '').trim();
        return getRegisteredVote(key) || getReactionMap()[key] || initialArticle.userReaction || null;
    });
    const [isBookmarked, setIsBookmarked] = useState(() => {
        const key = String(initialArticle.id || routeArticleId || '').trim();
        return new Set(getBookmarkIds().map(String)).has(key) || Boolean(initialArticle.isBookmarked);
    });
    const [likeCount, setLikeCount] = useState(() =>
        Number(initialArticle.like_count ?? initialArticle.upvotes ?? initialArticle.votes ?? 0),
    );
    const [dislikeCount, setDislikeCount] = useState(() =>
        Number(initialArticle.dislike_count ?? 0),
    );
    const [scrollY, setScrollY] = useState(0);

    const submitReaction = (type) => {
        if (!articleKey) return;
        const { previousVote, newVote, changed } = toggleVoteRegistered(articleKey, type);
        if (!changed) return;
        const counts = computeOptimisticReactionCounts(likeCount, dislikeCount, previousVote, newVote);
        setReactionState(newVote);
        setLikeCount(counts.like_count);
        setDislikeCount(counts.dislike_count);
        setReactionForArticle(articleKey, newVote);
        emitArticleInteractionChange({
            articleId: articleKey,
            userReaction: newVote,
            like_count: counts.like_count,
            dislike_count: counts.dislike_count,
        });

        scheduleVotePersist(articleKey, {
            persist: (articleId, apiValue) => setReaction(articleId, apiValue),
            onReconcile: (data, vote) => {
                const likes = Number(data.like_count ?? counts.like_count);
                const dislikes = Number(data.dislike_count ?? counts.dislike_count);
                setLikeCount(likes);
                setDislikeCount(dislikes);
                emitArticleInteractionChange({
                    articleId: articleKey,
                    userReaction: vote,
                    like_count: likes,
                    dislike_count: dislikes,
                });
            },
            onRollback: () => {
                setRegisteredVote(articleKey, previousVote);
                setReactionState(previousVote);
                setReactionForArticle(articleKey, previousVote || null);
                const rollback = computeOptimisticReactionCounts(
                    counts.like_count,
                    counts.dislike_count,
                    newVote,
                    previousVote
                );
                setLikeCount(rollback.like_count);
                setDislikeCount(rollback.dislike_count);
                emitArticleInteractionChange({
                    articleId: articleKey,
                    userReaction: previousVote,
                    like_count: rollback.like_count,
                    dislike_count: rollback.dislike_count,
                });
            },
        });
    };

    const handleLike = () => submitReaction('up');
    const handleDislike = () => submitReaction('down');

    const handleBookmark = () => {
        if (!articleKey) return;
        const previous = isBookmarked;
        const next = !previous;
        setIsBookmarked(next);
        const ids = new Set(getBookmarkIds());
        if (next) ids.add(articleKey);
        else ids.delete(articleKey);
        setBookmarkIds(Array.from(ids));
        emitBookmarkToggle({ articleId: articleKey, isBookmarked: next, article });

        queueBookmarkApi(articleKey, previous ? 'remove' : 'add', article).catch(() => {
            setIsBookmarked(previous);
            const rollback = new Set(getBookmarkIds());
            if (previous) rollback.add(articleKey);
            else rollback.delete(articleKey);
            setBookmarkIds(Array.from(rollback));
            emitBookmarkToggle({ articleId: articleKey, isBookmarked: previous, article });
        });
    };

    const handleShare = async () => {
        const result = await shareArticleLink(article, articleKey);
        if (result?.method === 'clipboard') {
            success('TRAK link copied to clipboard!');
        }
        setShowMoreMenu(false);
    };

    const handleOpenOriginal = () => {
        const url = article.canonical_url || article.url;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        setShowMoreMenu(false);
    };

    const handleExport = async () => {
        setShowMoreMenu(false);
        try {
            await downloadArticlePdf(article);
            success('PDF export downloaded.');
        } catch (e) {
            notifyError(e?.message || 'Could not export PDF.');
        }
    };

    const handleReport = () => {
        setShowMoreMenu(false);
        setFeedbackOpen(true);
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
        if (!needsLoader) {
            setDetailLoading(false);
            return undefined;
        }
        const cached = getCachedArticleDetail(id);
        if (cached) {
            const mapped = normalizeArticleForDetail(mapApiItem(cached));
            setArticle((prev) => ({ ...prev, ...mapped, id }));
            setLikeCount(Number(cached.like_count ?? mapped.like_count ?? 0));
            setDislikeCount(Number(cached.dislike_count ?? mapped.dislike_count ?? 0));
            setDetailLoading(false);
            setFetchError('');
            return undefined;
        }
        (async () => {
            try {
                const doc = await getUserArticleDetail(id);
                if (cancelled) return;
                setCachedArticleDetail(id, doc);
                const mapped = normalizeArticleForDetail(mapApiItem(doc));
                setArticle((prev) => ({ ...prev, ...mapped, id }));
                setLikeCount(Number(doc.like_count ?? mapped.like_count ?? 0));
                setDislikeCount(Number(doc.dislike_count ?? mapped.dislike_count ?? 0));
                setFetchError('');
            } catch (e) {
                if (!cancelled) {
                    const msg = getUserFacingError(e, { fallback: 'Could not load this article.' });
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
        if (!articleKey) return undefined;
        const navArticle = location.state?.article;
        const vote =
            getRegisteredVote(articleKey) ||
            getReactionMap()[articleKey] ||
            navArticle?.userReaction ||
            null;
        setReactionState(vote);
        if (navArticle) {
            setLikeCount(Number(navArticle.like_count ?? navArticle.upvotes ?? navArticle.votes ?? likeCount));
            setDislikeCount(Number(navArticle.dislike_count ?? dislikeCount));
        }
        setIsBookmarked(new Set(getBookmarkIds().map(String)).has(articleKey));

        return subscribeArticleInteractionChange((patch) => {
            if (String(patch.articleId) !== articleKey) return;
            if (patch.userReaction !== undefined) setReactionState(patch.userReaction);
            if (patch.like_count !== undefined) setLikeCount(patch.like_count);
            if (patch.dislike_count !== undefined) setDislikeCount(patch.dislike_count);
            if (patch.isBookmarked !== undefined) setIsBookmarked(patch.isBookmarked);
        });
    }, [articleKey, location.state?.article]);

    useEffect(() => {
        if (!articleKey || detailLoading) return;
        const registered = getRegisteredVote(articleKey);
        if (registered) setReactionState(registered);
        (async () => {
            const [bmRes, reactRes] = await Promise.all([
                listBookmarks().catch(() => ({ results: [] })),
                listReactions().catch(() => ({ results: [] })),
            ]);
            const ids = (bmRes.results || []).map((b) => String(b.article_id));
            setBookmarkIds(ids);
            setIsBookmarked(ids.includes(articleKey));
            const map = mergeReactionRows(reactRes.results || [], { replace: false });
            const vote = getRegisteredVote(articleKey) ?? map[articleKey] ?? null;
            setReactionState(vote);
        })();
    }, [articleKey, detailLoading]);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const content = article.fullContent || article.content || article.full_content || '';
    const heroImage = resolveArticleImageUrl(article);
    const showPlaceholder = !content.trim() && !detailLoading;
    const [activeTtsLineIndex, setActiveTtsLineIndex] = useState(-1);
    const listenText = getArticleListenText(article);
    const { lines: ttsHighlightLines } = useMemo(
        () => buildHighlightLinesFromContent(content, listenText, { title: article.title }),
        [content, listenText, article.title]
    );

    return (
        <>
        <div style={{
            minHeight: '100vh',
            backgroundColor: colors.background,
            paddingTop: `${ARTICLE_HEADER_HEIGHT}px`,
        }}>
            {/* Header — logo flush left of content area; article body stays centered below */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: `${ARTICLE_HEADER_HEIGHT}px`,
                boxSizing: 'border-box',
                backgroundColor: colors.surface,
                borderBottom: `1px solid ${colors.border}`,
                zIndex: 1000,
                padding: `0 ${headerPadRight}px 0 ${headerPadX}px`,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: scrollY > 10 ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
                transition: 'box-shadow 0.2s ease',
            }}>
                    <button
                        type="button"
                        onClick={() => navigate('/newsfeed')}
                        aria-label="Go to home"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px',
                            margin: 0,
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <TrakLogo size={28} />
                    </button>
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
                            flexShrink: 0,
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
                            {t('article.back')}
                        </span>
                    </button>
                    <div style={{ flex: 1, minWidth: 8 }} />
                    <div style={{ position: 'relative', flexShrink: 0 }}>
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
                                        { label: 'Share TRAK link', onClick: handleShare },
                                        ...(article.canonical_url || article.url
                                            ? [{ label: 'Open original', onClick: handleOpenOriginal }]
                                            : []),
                                        { label: 'Export PDF', onClick: handleExport },
                                        { label: 'Report or give feedback', onClick: handleReport, danger: true },
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

                {heroImage ? (
                    <div style={{ marginBottom: '24px' }}>
                        <ArticleCardImage
                            src={heroImage}
                            alt={article.title || 'Article'}
                            maxHeight={420}
                            borderRadius={14}
                            backgroundColor={colors.backgroundSecondary}
                            getProxyUrl={getUserArticleImageProxyUrl}
                        />
                    </div>
                ) : null}

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
                    articleId={articleKey}
                />

                {/* Article Content */}
                <div style={{
                    fontSize: '17px',
                    lineHeight: '1.8',
                    color: colors.textSecondary,
                    marginBottom: '40px',
                }}>
                    {detailLoading ? (
                        <SkeletonArticleDetail isDark={theme.mode === 'dark'} colors={colors} />
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
                padding: `16px ${headerPadRight}px 16px ${headerPadX}px`,
                zIndex: 1000,
            }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                }}>
                    {/* Vote + bookmark + share — aligned right */}
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
        <FeedbackModal
            open={feedbackOpen}
            onClose={() => setFeedbackOpen(false)}
            item={{ ...article, id: articleKey }}
            type="article_report"
        />
        </>
    );
};

export default ArticleDetailScreen;

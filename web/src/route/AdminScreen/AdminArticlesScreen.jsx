import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { useAdminTheme } from './useAdminTheme';
import { useResponsive } from '../../hooks/useResponsive';
import { MasonryFeed, MasonryFeedSkeleton } from '../../components/MasonryFeed';
import { getSkeletonFeedProps } from '../../components/skeletons/SkeletonLayouts';
import {
    FileText,
    Search,
    Eye,
    Clock,
    Tag,
    Trash2,
    RotateCcw,
} from 'lucide-react';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import {
    deleteAdminArticle,
    deleteAllFailedArticles,
    getAdminArticles,
    patchAdminArticle,
    requeueAdminArticle,
    requeueAllFailedArticles,
} from '../../api/adminApi';
import {
    getArticlesApiScope,
    getArticlesFetchParams,
    parseArticleRouteParams,
    filterArticlesForDisplay,
} from '../../utils/adminArticleFilters';
import ArticleInsightBadges, {
    ArticleCredibilitySourceDot,
    ArticleTopicKeywords,
} from './components/ArticleInsightBadges';
import { enableAdminAppPreview } from '../../utils/adminAppPreview';
import { dispatchAdminOverviewRefresh } from '../../utils/adminOverviewEvents';
import { normalizeArticleForDetail } from '../../utils/articleNavigation';
import { ARTICLES_POLL_INTERVAL_MS } from './adminTheme';
import { isArticlesPath } from './hooks/useAdminTabActive';
import AdminArticleReviewModal from './components/AdminArticleReviewModal';
import AdminArticleHeroImage from './components/AdminArticleHeroImage';
import AdminArticlesControlPanel from './components/AdminArticlesControlPanel';

const AdminArticlesScreen = () => {
    const { palette, isDark, colors } = useAdminTheme();
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const articlesTabActive = isArticlesPath(pathname);
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const [articleCounts, setArticleCounts] = useState(null);
    const { confirm, success, error: notifyError } = useUIFeedback();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreArticles, setHasMoreArticles] = useState(false);
    const [articlesPage, setArticlesPage] = useState(1);
    const articlesPageRef = useRef(1);
    const searchQueryRef = useRef('');
    const ADMIN_PAGE_SIZE = 100;
    const initialRoute = parseArticleRouteParams(searchParams);
    const [pipelineFilter, setPipelineFilter] = useState(initialRoute.pipelineFilter);
    const [statusById, setStatusById] = useState({});
    const [reviewArticle, setReviewArticle] = useState(null);
    const [failedBulkBusy, setFailedBulkBusy] = useState(false);

    const cardBackground = palette.card;
    const textPrimary = palette.textPrimary;
    const textSecondary = palette.textSecondary;
    const borderColor = palette.border;
    const sourceAvatarBg = isDark ? '#ffffff' : palette.textPrimary;
    const sourceAvatarText = isDark ? '#0a0a0a' : '#ffffff';

    const apiScope = useMemo(() => getArticlesApiScope(pipelineFilter), [pipelineFilter]);

    useEffect(() => {
        const route = parseArticleRouteParams(searchParams);
        setPipelineFilter(route.pipelineFilter);
    }, [searchParams]);

    const mapApiDoc = (doc) => {
        const dateStr = doc.fetched_at || doc.processed_at || '';
        const time = typeof dateStr === 'string' ? dateStr.slice(0, 16).replace('T', ' ') : '';
        return {
            id: doc.id,
            scope: doc.scope,
            title: doc.title,
            source: doc.source_key || '—',
            time,
            category: doc.scope === 'raw' ? 'Raw' : 'Processed',
            excerpt: doc.description || doc.content || 'No content preview available',
            description: doc.description || doc.content || 'No content preview available',
            fullContent: doc.content || doc.description || doc.canonical_url || '',
            verified: doc.scope === 'processed' && doc.credibility_label != null && doc.credibility_label !== '',
            upvotes: 0,
            credibility_label: doc.credibility_label,
            credibility_label_name: doc.credibility_label_name,
            credibility_max_prob: doc.credibility_max_prob,
            credibility_label_prob: doc.credibility_label_prob,
            credibility_score: doc.credibility_score,
            credibility_probs: doc.credibility_probs,
            credibility_prob_breakdown: doc.credibility_prob_breakdown,
            credibility_confidence_pct: doc.credibility_confidence_pct,
            fake_detection_label: doc.fake_detection_label,
            fake_detection_max_prob: doc.fake_detection_max_prob,
            fact_check_verdict: doc.fact_check_verdict,
            fact_check_hits: doc.fact_check_hits,
            topic_keywords: doc.topic_keywords || [],
            ai_summary: doc.summary || '',
            pipeline_status: doc.pipeline_status,
            moderation_status: doc.moderation_status || 'review',
            canonical_url: doc.canonical_url,
            content: doc.content || doc.description || doc.summary || '',
            image_url: doc.image_url,
            image: doc.image_url || undefined,
            fact_check_provider: doc.fact_check_provider,
        };
    };

    const loadArticles = useCallback(
        async (fetchScope, pipeFilter, { silent = false, page = 1, append = false, q = '' } = {}) => {
            try {
                if (!silent && !append) setLoading(true);
                if (append) setLoadingMore(true);
                const { scope, pipelineStatus, moderationStatus, credibilityLabel } = getArticlesFetchParams(pipeFilter);
                const response = await getAdminArticles({
                    page,
                    pageSize: ADMIN_PAGE_SIZE,
                    scope: fetchScope || scope,
                    pipelineStatus,
                    moderationStatus,
                    credibilityLabel,
                    q: q.trim().length >= 2 ? q.trim() : '',
                });
                const mapped = (response.results || []).map(mapApiDoc);
                setArticles((prev) => (append ? [...prev, ...mapped] : mapped));
                setArticleCounts(response.counts || null);
                setHasMoreArticles(Boolean(response.has_more));
                setArticlesPage(page);
            } catch (error) {
                console.error('Error loading articles:', error);
                if (!silent && !append) {
                    notifyError(error?.message || 'Could not load articles.');
                    setArticles([]);
                    setArticleCounts(null);
                    setHasMoreArticles(false);
                }
            } finally {
                if (!silent && !append) setLoading(false);
                if (append) setLoadingMore(false);
            }
        },
        [notifyError]
    );

    const loadMoreArticles = useCallback(() => {
        if (loadingMore || !hasMoreArticles) return;
        loadArticles(apiScope, pipelineFilter, {
            silent: true,
            page: articlesPage + 1,
            append: true,
            q: searchQuery,
        });
    }, [loadingMore, hasMoreArticles, articlesPage, loadArticles, apiScope, pipelineFilter, searchQuery]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadArticles(apiScope, pipelineFilter, { q: searchQuery, page: 1, append: false });
        }, searchQuery.trim() ? 320 : 0);
        return () => clearTimeout(timer);
    }, [apiScope, pipelineFilter, searchQuery, loadArticles]);

    useEffect(() => {
        articlesPageRef.current = articlesPage;
    }, [articlesPage]);

    useEffect(() => {
        searchQueryRef.current = searchQuery;
    }, [searchQuery]);

    useEffect(() => {
        if (!articlesTabActive) return undefined;
        const poll = () => {
            if (document.visibilityState !== 'visible') return;
            if (articlesPageRef.current > 1) return;
            loadArticles(apiScope, pipelineFilter, {
                silent: true,
                q: searchQueryRef.current,
                page: 1,
                append: false,
            });
        };
        const id = window.setInterval(poll, ARTICLES_POLL_INTERVAL_MS);
        const onVisibility = () => {
            if (document.visibilityState === 'visible') poll();
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.clearInterval(id);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [articlesTabActive, apiScope, pipelineFilter, loadArticles]);

    const handleDelete = async (articleId) => {
        const accepted = await confirm({
            title: 'Delete article?',
            message: 'Are you sure you want to delete this article?',
            confirmText: 'Delete',
            danger: true,
        });
        if (accepted) {
            const target = articles.find((a) => a.id === articleId);
            if (!target) return;
            try {
                await deleteAdminArticle(target.scope, articleId);
                success('Article deleted.');
                dispatchAdminOverviewRefresh({ silent: true, cacheBust: true });
                loadArticles(apiScope, pipelineFilter);
            } catch (e) {
                notifyError(e?.message || 'Failed to delete article.');
            }
        }
    };

    const handleStatusChange = async (articleId, nextStatus) => {
        const target = articles.find((a) => a.id === articleId);
        if (!target) return;
        const previous = statusById[articleId] || target.moderation_status || target.pipeline_status || 'review';
        setStatusById((prev) => ({ ...prev, [articleId]: nextStatus }));
        try {
            await patchAdminArticle(target.scope, articleId, { status: nextStatus });
            setArticles((prev) => prev.map((a) => (a.id === articleId ? { ...a, moderation_status: nextStatus } : a)));
            success('Article status updated.');
            dispatchAdminOverviewRefresh({ silent: true, cacheBust: true });
            loadArticles(apiScope, pipelineFilter);
        } catch (e) {
            setStatusById((prev) => ({ ...prev, [articleId]: previous }));
            notifyError(e?.message || 'Failed to update status.');
        }
    };

    const filteredArticles = useMemo(() => {
        if (searchQuery.trim().length >= 2) return articles;
        return filterArticlesForDisplay(articles, pipelineFilter, searchQuery);
    }, [articles, pipelineFilter, searchQuery]);

    const failedCount = articleCounts?.filtered_total ?? filteredArticles.length;

    const handleRequeueOne = async (articleId) => {
        const target = articles.find((a) => String(a.id) === String(articleId));
        const ps = String(target?.pipeline_status || '').toLowerCase();
        if (!target || !['failed', 'processing'].includes(ps)) return;
        setFailedBulkBusy(true);
        try {
            await requeueAdminArticle(target.scope || 'raw', articleId);
            success('Article sent back to queue.');
            dispatchAdminOverviewRefresh({ silent: true, cacheBust: true });
            await loadArticles(apiScope, pipelineFilter);
        } catch (e) {
            notifyError(e?.message || 'Could not requeue article.');
        } finally {
            setFailedBulkBusy(false);
        }
    };

    const handleRequeueAllFailed = async () => {
        if (failedBulkBusy || failedCount === 0) return;
        const accepted = await confirm({
            title: 'Send all failed back to queue?',
            message: `This will requeue ${failedCount} failed article(s) for processing.`,
            confirmText: 'Send back',
        });
        if (!accepted) return;
        setFailedBulkBusy(true);
        try {
            const res = await requeueAllFailedArticles();
            success(res?.detail || 'Failed articles requeued.');
            dispatchAdminOverviewRefresh({ silent: true, cacheBust: true });
            await loadArticles(apiScope, pipelineFilter);
        } catch (e) {
            notifyError(e?.message || 'Could not requeue failed articles.');
        } finally {
            setFailedBulkBusy(false);
        }
    };

    const handleDeleteAllFailed = async () => {
        if (failedBulkBusy || failedCount === 0) return;
        const accepted = await confirm({
            title: 'Delete all failed articles?',
            message: `Permanently delete ${failedCount} failed raw article(s)? This cannot be undone.`,
            confirmText: 'Delete all',
            danger: true,
        });
        if (!accepted) return;
        setFailedBulkBusy(true);
        try {
            const res = await deleteAllFailedArticles();
            success(res?.detail || 'Failed articles deleted.');
            dispatchAdminOverviewRefresh({ silent: true, cacheBust: true });
            await loadArticles(apiScope, pipelineFilter);
        } catch (e) {
            notifyError(e?.message || 'Could not delete failed articles.');
        } finally {
            setFailedBulkBusy(false);
        }
    };

    const handleFilterChange = (filterId) => {
        setPipelineFilter(filterId);
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('scope');
            if (filterId) next.set('pipeline', filterId);
            else next.delete('pipeline');
            return next;
        });
    };

    const { title, description } = useAdminPageMeta();

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <AdminPageLayout maxWidth="1400px">
                <AdminPageHeader title={title} description={description}>
                    <AdminArticlesControlPanel
                        palette={palette}
                        isDark={isDark}
                        loading={loading}
                        articleCounts={articleCounts}
                        pipelineFilter={pipelineFilter}
                        onFilterChange={handleFilterChange}
                        displayedCount={filteredArticles.length}
                        searchQuery={searchQuery}
                        failedBulkBusy={failedBulkBusy}
                        onRequeueAllFailed={handleRequeueAllFailed}
                        onDeleteAllFailed={handleDeleteAllFailed}
                    />
                </AdminPageHeader>

                <div className="admin-page-body">
                <div style={{
                    marginBottom: '24px',
                }}>
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <Search size={18} color={textSecondary} style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Search articles by title, source, or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 44px',
                                backgroundColor: palette.inputBg,
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                color: textPrimary,
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = palette.card;
                                e.target.style.borderColor = palette.textPrimary;
                                e.target.style.boxShadow = isDark 
                                    ? '0 0 0 3px rgba(129, 140, 248, 0.2)' 
                                    : '0 0 0 3px rgba(0, 0, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.backgroundColor = palette.inputBg;
                                e.target.style.borderColor = borderColor;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <MasonryFeedSkeleton {...getSkeletonFeedProps(isDark, colors)} count={6} />
                ) : filteredArticles.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        backgroundColor: palette.pageAlt,
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`,
                    }}>
                        <FileText size={48} color={textSecondary} style={{ marginBottom: '16px' }} />
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: textPrimary,
                            margin: '0 0 8px 0',
                        }}>
                            No articles found
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: textSecondary,
                            margin: '0',
                            textAlign: 'center',
                        }}>
                            {searchQuery ? 'Try adjusting your search query' : 'No articles in the system'}
                        </p>
                    </div>
                ) : (
                    <MasonryFeed gap={isMobile ? 16 : 24}>
                        {filteredArticles.map((article) => (
                            <div
                                key={article.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setReviewArticle(article)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setReviewArticle(article);
                                    }
                                }}
                                style={{
                                    backgroundColor: cardBackground,
                                    borderRadius: '16px',
                                    border: `1px solid ${borderColor}`,
                                    padding: 0,
                                    overflow: 'hidden',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                                    cursor: 'pointer',
                                    width: '100%',
                                    display: 'block',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = palette.textPrimary;
                                    e.currentTarget.style.boxShadow = isDark 
                                        ? '0 4px 12px rgba(129, 140, 248, 0.3)' 
                                        : '0 4px 12px rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = borderColor;
                                    e.currentTarget.style.boxShadow = isDark 
                                        ? '0 1px 3px rgba(0, 0, 0, 0.2)' 
                                        : '0 1px 3px rgba(0, 0, 0, 0.05)';
                                }}
                            >
                                {article.image_url ? (
                                    <AdminArticleHeroImage
                                        src={article.image_url}
                                        alt={article.title || 'Article'}
                                        maxHeight={220}
                                        borderRadius={0}
                                        backgroundColor={palette.inputBg}
                                        style={{ marginBottom: 0 }}
                                        dynamicAspect
                                    />
                                ) : null}

                                <div style={{ padding: '16px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '10px',
                                }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        backgroundColor: sourceAvatarBg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: sourceAvatarText,
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        flexShrink: 0,
                                    }}>
                                        {article.source?.substring(0, 2).toUpperCase() || 'N'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: textPrimary,
                                        }}>
                                            <span style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {article.source || 'Source'}
                                            </span>
                                            <ArticleCredibilitySourceDot article={article} size={12} />
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: textSecondary,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}>
                                            <Clock size={10} color={textSecondary} />
                                            {article.time || '—'}
                                        </div>
                                    </div>
                                    {article.category ? (
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            color: textSecondary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            padding: '3px 8px',
                                            backgroundColor: palette.pageAlt,
                                            borderRadius: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            flexShrink: 0,
                                        }}>
                                            <Tag size={10} />
                                            {article.category}
                                        </span>
                                    ) : null}
                                </div>

                                <ArticleInsightBadges
                                    article={article}
                                    textSecondary={textSecondary}
                                    borderColor={borderColor}
                                    compact
                                />

                                <ArticleTopicKeywords
                                    keywords={article.topic_keywords}
                                    textSecondary={textSecondary}
                                    isDark={isDark}
                                    borderColor={borderColor}
                                    max={3}
                                />

                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    margin: '0 0 8px 0',
                                    lineHeight: '1.4',
                                    letterSpacing: '-0.2px',
                                }}>
                                    {article.title || 'Article Title'}
                                </h3>

                                {(article.ai_summary || article.excerpt) && (
                                    <p style={{
                                        fontSize: '13px',
                                        color: textSecondary,
                                        margin: '0 0 12px 0',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}>
                                        {article.ai_summary || article.excerpt}
                                    </p>
                                )}

                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${borderColor}`,
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                    }}>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                enableAdminAppPreview();
                                                const normalized = normalizeArticleForDetail(article);
                                                if (article.id) {
                                                    navigate(`/article/${article.id}`, {
                                                        state: { article: normalized, adminPreview: true },
                                                    });
                                                } else if (article.canonical_url) {
                                                    window.open(article.canonical_url, '_blank', 'noopener,noreferrer');
                                                }
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                border: `1px solid ${palette.textPrimary}`,
                                                background: isDark ? 'rgba(129,140,248,0.12)' : '#f8fafc',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: textPrimary,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = palette.pageAlt;
                                                e.currentTarget.style.borderColor = palette.textPrimary;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = borderColor;
                                            }}
                                        >
                                            <Eye size={12} />
                                            In app
                                        </button>
                                        {pipelineFilter === 'failed' &&
                                        ['failed', 'processing'].includes(
                                            String(article.pipeline_status || '').toLowerCase()
                                        ) ? (
                                            <button
                                                type="button"
                                                disabled={failedBulkBusy}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRequeueOne(article.id);
                                                }}
                                                style={{
                                                    padding: '6px 10px',
                                                    border: `1px solid ${borderColor}`,
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: textPrimary,
                                                    background: palette.card,
                                                    cursor: failedBulkBusy ? 'wait' : 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    opacity: failedBulkBusy ? 0.6 : 1,
                                                }}
                                            >
                                                <RotateCcw size={12} />
                                                Send back
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(article.id);
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                border: `1px solid #ef4444`,
                                                borderRadius: '6px',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: '#ef4444',
                                                background: palette.errorBg,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}
                                        >
                                            <Trash2 size={12} />
                                            Delete
                                        </button>
                                        {article.canonical_url ? (
                                            <a
                                                href={article.canonical_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: '6px 10px',
                                                    border: `1px solid ${borderColor}`,
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: textPrimary,
                                                    textDecoration: 'none',
                                                    background: palette.card,
                                                }}
                                            >
                                                Source URL
                                            </a>
                                        ) : null}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: textSecondary, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Status</span>
                                        <select
                                            value={statusById[article.id] || (article.moderation_status || article.pipeline_status || 'review')}
                                            onChange={(e) => handleStatusChange(article.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ fontSize: '11px', padding: '6px 8px', borderRadius: '6px', border: `1px solid ${borderColor}`, background: cardBackground, color: textPrimary, minWidth: '100px', flex: 1 }}
                                        >
                                            <option value="review">review</option>
                                            <option value="approved">approved</option>
                                            <option value="rejected">rejected</option>
                                        </select>
                                    </div>
                                </div>
                                </div>
                            </div>
                        ))}
                    </MasonryFeed>
                )}
                {!loading && hasMoreArticles && filteredArticles.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 8px' }}>
                        <button
                            type="button"
                            onClick={loadMoreArticles}
                            disabled={loadingMore}
                            style={{
                                padding: '12px 24px',
                                borderRadius: 10,
                                border: `1px solid ${borderColor}`,
                                background: cardBackground,
                                color: textPrimary,
                                fontWeight: 600,
                                cursor: loadingMore ? 'wait' : 'pointer',
                            }}
                        >
                            {loadingMore ? 'Loading…' : 'Load more articles'}
                        </button>
                    </div>
                )}
                </div>
            </AdminPageLayout>

            <AdminArticleReviewModal
                open={Boolean(reviewArticle)}
                article={reviewArticle}
                onClose={() => setReviewArticle(null)}
                onSaved={(updated) => {
                    setArticles((prev) =>
                        prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row))
                    );
                    setStatusById((prev) => ({ ...prev, [updated.id]: updated.moderation_status }));
                }}
                onOpenInApp={(article) => {
                    enableAdminAppPreview();
                    const normalized = normalizeArticleForDetail(article);
                    if (article.id) {
                        navigate(`/article/${article.id}`, {
                            state: { article: normalized, adminPreview: true },
                        });
                    }
                }}
            />
        </>
    );
};

export default AdminArticlesScreen;


import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsiveGridColumns, getResponsiveGap } from '../../utils/responsiveStyles';
import {
    FileText,
    Search,
    Eye,
    Clock,
    Tag,
    Trash2,
} from 'lucide-react';
import AdminPageLayout from './components/AdminPageLayout';
import AdminPageHeader from './components/AdminPageHeader';
import { useAdminPageMeta } from './adminPageMeta';
import { deleteAdminArticle, getAdminArticles, patchAdminArticle } from '../../api/adminApi';
import {
    getArticlesApiScope,
    parseArticleRouteParams,
    filterArticlesForDisplay,
} from '../../utils/adminArticleFilters';
import { SkeletonListRows } from '../../components/skeletons/SkeletonLayouts';
import ArticleInsightBadges, {
    ArticleCredibilityIndicator,
    ArticleCredibilitySourceDot,
    ArticleTopicKeywords,
} from './components/ArticleInsightBadges';

const AdminArticlesScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [articles, setArticles] = useState([]);
    const { confirm, success, error: notifyError } = useUIFeedback();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const initialRoute = parseArticleRouteParams(searchParams);
    const [pipelineFilter, setPipelineFilter] = useState(initialRoute.pipelineFilter);
    const [statusById, setStatusById] = useState({});

    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

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
        };
    };

    const loadArticles = useCallback(
        async (fetchScope) => {
            try {
                setLoading(true);
                const response = await getAdminArticles({ page: 1, pageSize: 200, scope: fetchScope });
                setArticles((response.results || []).map(mapApiDoc));
            } catch (error) {
                console.error('Error loading articles:', error);
                notifyError(error?.message || 'Could not load articles.');
                setArticles([]);
            } finally {
                setLoading(false);
            }
        },
        [notifyError]
    );

    useEffect(() => {
        loadArticles(apiScope);
    }, [apiScope, loadArticles]);

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
                setArticles((prev) => prev.filter((a) => a.id !== articleId));
                success('Article deleted.');
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
        } catch (e) {
            setStatusById((prev) => ({ ...prev, [articleId]: previous }));
            notifyError(e?.message || 'Failed to update status.');
        }
    };

    const filteredArticles = filterArticlesForDisplay(articles, pipelineFilter, searchQuery);
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
                    <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginTop: '12px',
                        }}>
                            {[
                                { id: '', label: 'Any status' },
                                { id: 'queue', label: 'Queue' },
                                { id: 'pending', label: 'Pending' },
                                { id: 'processing', label: 'Processing' },
                                { id: 'done', label: 'Done (processed feed)' },
                                { id: 'failed', label: 'Failed' },
                            ].map((p) => {
                                const active = pipelineFilter === p.id;
                                return (
                                    <button
                                        key={p.id || 'any'}
                                        type="button"
                                        onClick={() => {
                                            setPipelineFilter(p.id);
                                            setSearchParams((prev) => {
                                                const next = new URLSearchParams(prev);
                                                next.delete('scope');
                                                if (p.id) next.set('pipeline', p.id);
                                                else next.delete('pipeline');
                                                return next;
                                            });
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: `1px solid ${active ? (isDark ? colors.primary || '#818CF8' : '#64748b') : borderColor}`,
                                            background: active
                                                ? (isDark ? 'rgba(129, 140, 248, 0.12)' : '#f1f5f9')
                                                : (isDark ? colors.backgroundSecondary || '#1e293b' : '#f8fafc'),
                                            color: active ? textPrimary : textSecondary,
                                            cursor: 'pointer',
                                            fontWeight: active ? 600 : 500,
                                            fontSize: '12px',
                                        }}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>
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
                                backgroundColor: isDark ? colors.surface || '#1E293B' : '#f9fafb',
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                color: textPrimary,
                            }}
                            onFocus={(e) => {
                                e.target.style.backgroundColor = isDark ? colors.backgroundElevated || '#334155' : '#ffffff';
                                e.target.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                e.target.style.boxShadow = isDark 
                                    ? '0 0 0 3px rgba(129, 140, 248, 0.2)' 
                                    : '0 0 0 3px rgba(0, 0, 0, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                                e.target.style.borderColor = borderColor;
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                {/* Articles Grid */}
                {loading ? (
                    <SkeletonListRows rows={10} isDark={isDark} colors={colors} />
                ) : filteredArticles.length === 0 ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '80px 20px',
                        backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
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
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: getResponsiveGridColumns(isMobile, isTablet, 350),
                        gap: getResponsiveGap(isMobile, isTablet),
                    }}>
                        {filteredArticles.map((article) => (
                            <div
                                key={article.id}
                                style={{
                                    backgroundColor: cardBackground,
                                    borderRadius: '12px',
                                    border: `1px solid ${borderColor}`,
                                    padding: '20px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
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
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    marginBottom: '12px',
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginBottom: '8px',
                                        }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '6px',
                                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#ffffff',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                            }}>
                                                {article.source?.substring(0, 2).toUpperCase() || 'N'}
                                            </div>
                                            <div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: textPrimary,
                                                }}>
                                                    <span>{article.source || 'Source'}</span>
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
                                                    {article.time || '2h ago'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <ArticleCredibilityIndicator article={article} />
                                </div>

                                {article.category && (
                                    <div style={{ marginBottom: '10px' }}>
                                        <span style={{
                                            fontSize: '10px',
                                            fontWeight: '600',
                                            color: textSecondary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            padding: '3px 8px',
                                            backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f3f4f6',
                                            borderRadius: '4px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}>
                                            <Tag size={10} />
                                            {article.category}
                                        </span>
                                    </div>
                                )}

                                <ArticleInsightBadges
                                    article={article}
                                    textSecondary={textSecondary}
                                    borderColor={borderColor}
                                />

                                <ArticleTopicKeywords
                                    keywords={article.topic_keywords}
                                    textSecondary={textSecondary}
                                    isDark={isDark}
                                    borderColor={borderColor}
                                />

                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    margin: '0 0 8px 0',
                                    lineHeight: '1.4',
                                }}>
                                    {article.title || 'Article Title'}
                                </h3>

                                {(article.ai_summary || article.excerpt) && (
                                    <p style={{
                                        fontSize: '13px',
                                        color: textSecondary,
                                        margin: '0 0 16px 0',
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
                                    alignItems: 'flex-end',
                                    justifyContent: 'space-between',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${borderColor}`,
                                    gap: '12px',
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexWrap: 'wrap',
                                        gap: '8px',
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (article.id) navigate(`/article/${article.id}`, { state: { article } });
                                                else if (article.canonical_url) window.open(article.canonical_url, '_blank', 'noopener,noreferrer');
                                            }}
                                            style={{
                                                padding: '8px 12px',
                                                border: `1px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`,
                                                background: isDark ? 'rgba(129,140,248,0.12)' : '#f8fafc',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: textPrimary,
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                                e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = borderColor;
                                            }}
                                        >
                                            <Eye size={12} />
                                            In app
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(article.id)}
                                            style={{
                                                padding: '8px 12px',
                                                border: `1px solid #ef4444`,
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#ef4444',
                                                background: '#fff5f5',
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
                                                    padding: '8px 12px',
                                                    border: `1px solid ${borderColor}`,
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: textPrimary,
                                                    textDecoration: 'none',
                                                    background: isDark ? colors.surfaceElevated || '#334155' : '#ffffff',
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
                                            style={{ fontSize: '12px', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${borderColor}`, background: cardBackground, color: textPrimary, minWidth: '120px' }}
                                        >
                                            <option value="review">review</option>
                                            <option value="approved">approved</option>
                                            <option value="rejected">rejected</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </AdminPageLayout>
        </>
    );
};

export default AdminArticlesScreen;


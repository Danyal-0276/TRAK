import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth, getResponsiveGridColumns, getResponsiveGap, getResponsiveFontSize } from '../../utils/responsiveStyles';
import {
    FileText,
    Search,
    Eye,
    CheckCircle,
    Clock,
    Tag,
} from 'lucide-react';
import { getAdminArticles } from '../../api/adminApi';

const AdminArticlesScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const { confirm } = useUIFeedback();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [scope, setScope] = useState('all');

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    useEffect(() => {
        loadArticles();
    }, [scope]);

    const mapApiDoc = (doc) => {
        const dateStr = doc.fetched_at || doc.processed_at || '';
        const time = typeof dateStr === 'string' ? dateStr.slice(0, 16).replace('T', ' ') : '';
        return {
            id: doc.id,
            title: doc.title,
            source: doc.source_key || '—',
            time,
            category: doc.scope === 'raw' ? 'Raw' : 'Processed',
            excerpt: doc.canonical_url ? String(doc.canonical_url).slice(0, 140) : '',
            verified: doc.scope === 'processed' && doc.credibility_label != null && doc.credibility_label !== '',
            upvotes: 0,
            credibility_label: doc.credibility_label,
            pipeline_status: doc.pipeline_status,
            canonical_url: doc.canonical_url,
        };
    };

    const loadArticles = async () => {
        try {
            setLoading(true);
            const response = await getAdminArticles({ page: 1, pageSize: 80, scope });
            setArticles((response.results || []).map(mapApiDoc));
        } catch (error) {
            console.error('Error loading articles:', error);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (articleId) => {
        const accepted = await confirm({
            title: 'Delete article?',
            message: 'Are you sure you want to delete this article?',
            confirmText: 'Delete',
            danger: true,
        });
        if (accepted) {
            setArticles(articles.filter(a => a.id !== articleId));
        }
    };

    const filteredArticles = articles.filter(article =>
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.source?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(article.credibility_label ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(article.pipeline_status ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{
                minHeight: '100vh',
                backgroundColor: backgroundColor,
                paddingTop: '0',
                marginTop: '0',
            }}>
            <div style={{
                maxWidth: getResponsiveMaxWidth(isMobile, isTablet, '1400px'),
                margin: '0 auto',
                width: '100%',
                padding: getResponsivePadding(isMobile, isTablet),
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: isMobile ? '16px' : '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: getResponsiveFontSize(isMobile, isTablet, 28),
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        Articles Management
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Live list from MongoDB (admin API). Edit/delete are not exposed in the API yet.
                    </p>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginTop: '16px',
                    }}>
                        {['all', 'raw', 'processed'].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setScope(s)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: `1px solid ${scope === s ? (isDark ? colors.primary || '#818CF8' : '#0f172a') : borderColor}`,
                                    background: scope === s
                                        ? (isDark ? 'rgba(129, 140, 248, 0.15)' : '#f1f5f9')
                                        : 'transparent',
                                    color: textPrimary,
                                    cursor: 'pointer',
                                    fontWeight: scope === s ? 600 : 500,
                                    textTransform: 'capitalize',
                                    fontSize: '14px',
                                }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search Bar */}
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
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px',
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            border: `3px solid ${borderColor}`,
                            borderTop: `3px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`,
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                        }} />
                    </div>
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
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: textPrimary,
                                                }}>
                                                    {article.source || 'Source'}
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
                                    {article.verified && (
                                        <CheckCircle size={16} color="#10b981" fill="#10b981" />
                                    )}
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

                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    margin: '0 0 8px 0',
                                    lineHeight: '1.4',
                                }}>
                                    {article.title || 'Article Title'}
                                </h3>

                                {article.excerpt && (
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
                                        {article.excerpt}
                                    </p>
                                )}

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingTop: '12px',
                                    borderTop: `1px solid ${borderColor}`,
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/article/${article.id}`)}
                                            style={{
                                                padding: '6px 12px',
                                                border: `1px solid ${borderColor}`,
                                                background: 'transparent',
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
                                        {article.canonical_url ? (
                                            <a
                                                href={article.canonical_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: '6px 12px',
                                                    border: `1px solid ${borderColor}`,
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: textPrimary,
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                Source URL
                                            </a>
                                        ) : null}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: textSecondary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}>
                                        {article.category === 'Processed' && article.credibility_label != null
                                            ? `label: ${article.credibility_label}`
                                            : article.pipeline_status
                                                ? `status: ${article.pipeline_status}`
                                                : '—'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default AdminArticlesScreen;


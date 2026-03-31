import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth, getResponsiveGridColumns, getResponsiveGap, getResponsiveFontSize } from '../../utils/responsiveStyles';
import {
    FileText,
    Hash,
    BarChart3,
    Activity,
    ArrowRight,
    Play,
} from 'lucide-react';
import { getAdminAnalytics, postAdminPipelineRun } from '../../api/adminApi';

const AdminDashboardScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pipelineBusy, setPipelineBusy] = useState(false);

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminAnalytics();
            setSnapshot(data);
        } catch (error) {
            console.error('Error loading admin stats:', error);
            setSnapshot(null);
        } finally {
            setLoading(false);
        }
    };

    const pipelineKeyCount = snapshot?.raw_by_pipeline_status
        ? Object.keys(snapshot.raw_by_pipeline_status).length
        : 0;
    const credKeyCount = snapshot?.processed_by_credibility_label
        ? Object.keys(snapshot.processed_by_credibility_label).length
        : 0;

    const statCards = [
        {
            icon: FileText,
            label: 'Raw articles',
            value: snapshot != null ? String(snapshot.raw_total ?? 0) : '—',
            color: '#f59e0b',
            path: '/admin/articles',
        },
        {
            icon: BarChart3,
            label: 'Processed',
            value: snapshot != null ? String(snapshot.processed_total ?? 0) : '—',
            color: '#10b981',
            path: '/admin/analytics',
        },
        {
            icon: Activity,
            label: 'Pipeline states',
            value: snapshot != null ? String(pipelineKeyCount) : '—',
            color: '#3b82f6',
            path: '/admin/analytics',
        },
        {
            icon: Hash,
            label: 'Credibility labels',
            value: snapshot != null ? String(credKeyCount) : '—',
            color: '#8b5cf6',
            path: '/admin/analytics',
        },
    ];

    const runPipeline = async () => {
        setPipelineBusy(true);
        try {
            const result = await postAdminPipelineRun(15);
            window.alert(typeof result === 'object' ? JSON.stringify(result, null, 2).slice(0, 1200) : String(result));
            await loadStats();
        } catch (e) {
            window.alert(e?.message || 'Pipeline run failed');
        } finally {
            setPipelineBusy(false);
        }
    };

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
                    marginBottom: isMobile ? '20px' : '32px',
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
                        Admin Dashboard
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Overview of your platform statistics and management
                    </p>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: getResponsiveGridColumns(isMobile, isTablet, 250),
                    gap: getResponsiveGap(isMobile, isTablet),
                    marginBottom: isMobile ? '20px' : '32px',
                }}>
                    {statCards.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                onClick={() => navigate(stat.path)}
                                style={{
                                    backgroundColor: cardBackground,
                                    borderRadius: '12px',
                                    border: `1px solid ${borderColor}`,
                                    padding: '24px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                    e.currentTarget.style.boxShadow = isDark 
                                        ? '0 4px 12px rgba(129, 140, 248, 0.3)' 
                                        : '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = borderColor;
                                    e.currentTarget.style.boxShadow = isDark 
                                        ? '0 1px 3px rgba(0, 0, 0, 0.2)' 
                                        : '0 1px 3px rgba(0, 0, 0, 0.05)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '16px',
                                }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '10px',
                                        backgroundColor: stat.color + '20',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <Icon size={24} color={stat.color} />
                                    </div>
                                    <ArrowRight size={18} color={textSecondary} />
                                </div>
                                <div style={{
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: textPrimary,
                                    marginBottom: '4px',
                                }}>
                                    {loading ? '...' : stat.value}
                                </div>
                                <div style={{
                                    fontSize: '14px',
                                    color: textSecondary,
                                    fontWeight: '500',
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '24px',
                    marginBottom: '32px',
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 20px 0',
                    }}>
                        Quick Actions
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                    }}>
                        <button
                            onClick={() => navigate('/admin/users')}
                            style={{
                                padding: '16px',
                                border: `1px solid ${borderColor}`,
                                background: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
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
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: textPrimary,
                                marginBottom: '4px',
                            }}>
                                Manage Users
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: textSecondary,
                            }}>
                                View and manage all users
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/articles')}
                            style={{
                                padding: '16px',
                                border: `1px solid ${borderColor}`,
                                background: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
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
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: textPrimary,
                                marginBottom: '4px',
                            }}>
                                Manage Articles
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: textSecondary,
                            }}>
                                View and manage all articles
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/admin/analytics')}
                            style={{
                                padding: '16px',
                                border: `1px solid ${borderColor}`,
                                background: 'transparent',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
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
                            <div style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: textPrimary,
                                marginBottom: '4px',
                            }}>
                                View Analytics
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: textSecondary,
                            }}>
                                Platform analytics and insights
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={runPipeline}
                            disabled={pipelineBusy}
                            style={{
                                padding: '16px',
                                border: `1px solid ${isDark ? colors.primary || '#818CF8' : '#0f172a'}`,
                                background: isDark ? 'rgba(129, 140, 248, 0.12)' : '#f8fafc',
                                borderRadius: '8px',
                                cursor: pipelineBusy ? 'wait' : 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                                opacity: pipelineBusy ? 0.75 : 1,
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px',
                            }}>
                                <Play size={18} color={textPrimary} />
                                <span style={{
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                }}>
                                    {pipelineBusy ? 'Running pipeline…' : 'Run AI pipeline'}
                                </span>
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: textSecondary,
                            }}>
                                Process a batch of pending raw articles on the server
                            </div>
                        </button>
                    </div>
                </div>

                {/* DB snapshot */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '24px',
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 12px 0',
                    }}>
                        Database snapshot
                    </h2>
                    <p style={{
                        fontSize: '14px',
                        color: textSecondary,
                        margin: '0 0 16px 0',
                        lineHeight: 1.5,
                    }}>
                        {snapshot == null && !loading
                            ? 'Could not load analytics. Check that you are logged in as an admin and the API is running.'
                            : 'Counts come from MongoDB (raw_articles / processed_articles), same as the admin API.'}
                    </p>
                    {snapshot != null && (
                        <pre style={{
                            margin: 0,
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                            border: `1px solid ${borderColor}`,
                            fontSize: '12px',
                            color: textPrimary,
                            overflow: 'auto',
                            maxHeight: '280px',
                        }}>
                            {JSON.stringify(snapshot, null, 2)}
                        </pre>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default AdminDashboardScreen;


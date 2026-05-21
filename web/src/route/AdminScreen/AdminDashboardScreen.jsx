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
import { postAdminPipelineRun } from '../../api/adminApi';
import AdminAnalyticsSection from './components/AdminAnalyticsSection';
import { loadAdminOverview, buildOverviewStatCards } from './loadAdminOverview';
import { toUserTrendChartData } from './mockAdminData';
import AdminChartSection from './components/AdminChartSection';
import { SkeletonStatCards, SkeletonTableRows } from '../../components/skeletons/SkeletonLayouts';

const AdminDashboardScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const [snapshot, setSnapshot] = useState(null);
    const [modelMetrics, setModelMetrics] = useState(null);
    const [keywords, setKeywords] = useState([]);
    const [mockAnalytics, setMockAnalytics] = useState(null);
    const [overviewUsers, setOverviewUsers] = useState([]);
    const [articleCount, setArticleCount] = useState(0);
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
            const data = await loadAdminOverview();
            setSnapshot(data.serverAnalytics);
            setModelMetrics(data.modelMetrics);
            setKeywords(data.keywords);
            setMockAnalytics(data.mockAnalytics);
            setOverviewUsers(data.users);
            setArticleCount(data.articles.length);
        } catch (error) {
            console.error('Error loading admin stats:', error);
            setSnapshot(null);
            setModelMetrics(null);
            setMockAnalytics(null);
        } finally {
            setLoading(false);
        }
    };

    const statMeta = [
        { icon: FileText, color: '#f59e0b' },
        { icon: BarChart3, color: '#10b981' },
        { icon: Activity, color: '#3b82f6' },
        { icon: Hash, color: '#8b5cf6' },
    ];

    const statCards = buildOverviewStatCards({
        serverAnalytics: snapshot,
        articles: { length: articleCount },
        users: overviewUsers,
    }).map((card, index) => ({
        ...card,
        icon: statMeta[index]?.icon || FileText,
        color: statMeta[index]?.color || '#64748b',
        value: loading ? '—' : card.value,
    }));

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
                        Dashboard Overview
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Platform stats, analytics, and pipeline controls (same as mobile admin overview)
                    </p>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <>
                        <SkeletonStatCards count={4} isDark={isDark} colors={colors} />
                        <div style={{ marginTop: 24 }}>
                            <SkeletonTableRows rows={5} isDark={isDark} colors={colors} />
                        </div>
                    </>
                ) : null}
                <div style={{
                    display: loading ? 'none' : 'grid',
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
                        Pipeline
                    </h2>
                    <div style={{ maxWidth: 420 }}>
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

                {!loading && (
                  <>
                    <AdminChartSection
                      title="User trend"
                      dateRange="Last 7 days"
                      data={toUserTrendChartData()}
                      lines={[{ dataKey: 'value', color: '#6366f1', strokeWidth: 3, showDots: false }]}
                      yAxisSuffix="K"
                      colors={{
                        textPrimary,
                        textSecondary,
                        grid: borderColor,
                        cardBackground,
                      }}
                    />
                    <div style={{ backgroundColor: cardBackground, borderRadius: '12px', border: `1px solid ${borderColor}`, padding: '24px', marginBottom: '32px', overflowX: 'auto' }}>
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: textPrimary, margin: '0 0 16px 0' }}>Top keywords</h2>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                            <th style={{ textAlign: 'left', padding: '8px 0', color: textSecondary }}>Keyword</th>
                            <th style={{ textAlign: 'right', padding: '8px 0', color: textSecondary }}>Searches</th>
                            <th style={{ textAlign: 'right', padding: '8px 0', color: textSecondary }}>Trend</th>
                          </tr>
                        </thead>
                        <tbody>
                          {keywords.map((k) => (
                            <tr key={k.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                              <td style={{ padding: '10px 0', color: textPrimary }}>{k.word}</td>
                              <td style={{ padding: '10px 0', textAlign: 'right', color: textPrimary }}>{k.searches}</td>
                              <td style={{ padding: '10px 0', textAlign: 'right', color: textSecondary }}>{k.trend}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <AdminAnalyticsSection
                      serverAnalytics={snapshot}
                      modelMetrics={modelMetrics}
                      mockAnalytics={mockAnalytics}
                      colors={{ textPrimary, textSecondary, border: borderColor, primary: colors.primary || '#3b82f6' }}
                      cardBackground={cardBackground}
                      borderColor={borderColor}
                    />
                  </>
                )}

            </div>
        </div>
        </>
    );
};

export default AdminDashboardScreen;


import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth, getResponsiveGridColumns, getResponsiveGap, getResponsiveFontSize } from '../../utils/responsiveStyles';
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    FileText,
    Eye,
    Clock,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { mockApi } from '../../utils/Service/mockApi';

const AdminAnalyticsScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await mockApi.getNewsFeed();
            const articles = response.data || [];
            
            // Calculate analytics
            const totalViews = articles.reduce((sum, article) => sum + (article.views || Math.floor(Math.random() * 10000)), 0);
            const totalUpvotes = articles.reduce((sum, article) => sum + (article.upvotes || 0), 0);
            const avgReadTime = articles.reduce((sum, article) => sum + (parseInt(article.readTime) || 5), 0) / articles.length || 5;
            
            // Category distribution
            const categoryCounts = {};
            articles.forEach(article => {
                if (article.category) {
                    categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
                }
            });
            
            // Top articles by upvotes
            const topArticles = [...articles]
                .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
                .slice(0, 5);
            
            // Daily activity (mock data)
            const dailyActivity = [
                { day: 'Mon', views: 1250, users: 320 },
                { day: 'Tue', views: 1890, users: 450 },
                { day: 'Wed', views: 2100, users: 520 },
                { day: 'Thu', views: 1750, users: 410 },
                { day: 'Fri', views: 2300, users: 580 },
                { day: 'Sat', views: 1950, users: 480 },
                { day: 'Sun', views: 1650, users: 390 },
            ];

            setAnalytics({
                totalViews,
                totalUpvotes,
                avgReadTime: Math.round(avgReadTime),
                categoryCounts,
                topArticles,
                dailyActivity,
                totalUsers: 1250,
                activeUsers: 892,
                newUsers: 45,
                engagementRate: 68.5,
            });
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            icon: Eye,
            label: 'Total Views',
            value: analytics?.totalViews.toLocaleString() || '0',
            change: '+12.5%',
            changeType: 'positive',
            color: '#3b82f6',
        },
        {
            icon: Users,
            label: 'Active Users',
            value: analytics?.activeUsers.toLocaleString() || '0',
            change: '+8.2%',
            changeType: 'positive',
            color: '#10b981',
        },
        {
            icon: TrendingUp,
            label: 'Engagement Rate',
            value: `${analytics?.engagementRate || 0}%`,
            change: '+3.1%',
            changeType: 'positive',
            color: '#f59e0b',
        },
        {
            icon: Clock,
            label: 'Avg. Read Time',
            value: `${analytics?.avgReadTime || 0} min`,
            change: '-2.3%',
            changeType: 'negative',
            color: '#8b5cf6',
        },
    ];

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
                            Analytics Dashboard
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: textSecondary,
                            margin: '0',
                            lineHeight: '1.5',
                        }}>
                            Platform insights and performance metrics
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
                                    style={{
                                        backgroundColor: cardBackground,
                                        borderRadius: '12px',
                                        border: `1px solid ${borderColor}`,
                                        padding: '24px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
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
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: stat.changeType === 'positive' ? '#10b981' : '#ef4444',
                                        }}>
                                            {stat.changeType === 'positive' ? (
                                                <ArrowUp size={14} />
                                            ) : (
                                                <ArrowDown size={14} />
                                            )}
                                            {stat.change}
                                        </div>
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

                    {/* Charts Section */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: getResponsiveGridColumns(isMobile, isTablet, 400),
                        gap: getResponsiveGap(isMobile, isTablet),
                        marginBottom: isMobile ? '20px' : '32px',
                    }}>
                        {/* Daily Activity Chart */}
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
                                margin: '0 0 24px 0',
                            }}>
                                Daily Activity
                            </h2>
                            {loading ? (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: '200px',
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
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    gap: '12px',
                                    height: '200px',
                                }}>
                                    {analytics?.dailyActivity.map((day, index) => {
                                        const maxViews = Math.max(...analytics.dailyActivity.map(d => d.views));
                                        const height = (day.views / maxViews) * 100;
                                        return (
                                            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{
                                                    width: '100%',
                                                    height: `${height}%`,
                                                    backgroundColor: isDark ? colors.primary || '#818CF8' : '#3b82f6',
                                                    borderRadius: '6px 6px 0 0',
                                                    minHeight: '8px',
                                                    marginBottom: '8px',
                                                    transition: 'all 0.3s ease',
                                                }} />
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: textSecondary,
                                                    fontWeight: '600',
                                                    marginTop: '8px',
                                                }}>
                                                    {day.day}
                                                </div>
                                                <div style={{
                                                    fontSize: '10px',
                                                    color: textSecondary,
                                                }}>
                                                    {day.views.toLocaleString()}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Category Distribution */}
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
                                margin: '0 0 24px 0',
                            }}>
                                Category Distribution
                            </h2>
                            {loading ? (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: '200px',
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
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                }}>
                                    {Object.entries(analytics?.categoryCounts || {})
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5)
                                        .map(([category, count], index) => {
                                            const total = Object.values(analytics.categoryCounts).reduce((sum, val) => sum + val, 0);
                                            const percentage = ((count / total) * 100).toFixed(1);
                                            return (
                                                <div key={category}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '6px',
                                                    }}>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: textPrimary,
                                                        }}>
                                                            {category}
                                                        </span>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            color: textSecondary,
                                                        }}>
                                                            {count} ({percentage}%)
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '8px',
                                                        backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f3f4f6',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                    }}>
                                                        <div style={{
                                                            width: `${percentage}%`,
                                                            height: '100%',
                                                            backgroundColor: isDark ? colors.primary || '#818CF8' : '#3b82f6',
                                                            transition: 'width 0.3s ease',
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Articles */}
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
                            margin: '0 0 24px 0',
                        }}>
                            Top Performing Articles
                        </h2>
                        {loading ? (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                minHeight: '200px',
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
                        ) : (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                            }}>
                                {analytics?.topArticles.map((article, index) => (
                                    <div
                                        key={article.id}
                                        style={{
                                            padding: '16px',
                                            backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                                            borderRadius: '8px',
                                            border: `1px solid ${borderColor}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
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
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                }}>
                                                    {index + 1}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontSize: '15px',
                                                        fontWeight: '600',
                                                        color: textPrimary,
                                                        marginBottom: '4px',
                                                    }}>
                                                        {article.title || 'Article Title'}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: textSecondary,
                                                    }}>
                                                        {article.source || 'Source'} • {article.category || 'Uncategorized'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                        }}>
                                            <div style={{
                                                textAlign: 'right',
                                            }}>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: textPrimary,
                                                }}>
                                                    {article.upvotes || 0}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: textSecondary,
                                                }}>
                                                    upvotes
                                                </div>
                                            </div>
                                            <div style={{
                                                textAlign: 'right',
                                            }}>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: textPrimary,
                                                }}>
                                                    {article.views || Math.floor(Math.random() * 10000)}
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: textSecondary,
                                                }}>
                                                    views
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminAnalyticsScreen;


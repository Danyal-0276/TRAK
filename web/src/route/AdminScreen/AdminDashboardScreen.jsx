import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getResponsivePadding, getResponsiveMaxWidth, getResponsiveGridColumns, getResponsiveGap, getResponsiveFontSize } from '../../utils/responsiveStyles';
import { 
    Users, 
    FileText, 
    TrendingUp, 
    Hash,
    BarChart3,
    Activity,
    ArrowRight
} from 'lucide-react';
import { mockApi } from '../../utils/Service/mockApi';

const AdminDashboardScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalArticles: 0,
        totalKeywords: 0,
    });
    const [loading, setLoading] = useState(true);

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
            const newsResponse = await mockApi.getNewsFeed();
            const articles = newsResponse.data || [];
            
            // Mock user data
            const totalUsers = 1250;
            const activeUsers = 892;
            
            // Extract unique keywords/categories
            const categories = new Set(articles.map(a => a.category).filter(Boolean));
            
            setStats({
                totalUsers,
                activeUsers,
                totalArticles: articles.length,
                totalKeywords: categories.size,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            icon: Users,
            label: 'Total Users',
            value: stats.totalUsers.toLocaleString(),
            color: '#3b82f6',
            path: '/admin/users',
        },
        {
            icon: Activity,
            label: 'Active Users',
            value: stats.activeUsers.toLocaleString(),
            color: '#10b981',
            path: '/admin/users',
        },
        {
            icon: FileText,
            label: 'Total Articles',
            value: stats.totalArticles.toLocaleString(),
            color: '#f59e0b',
            path: '/admin/articles',
        },
        {
            icon: Hash,
            label: 'Categories',
            value: stats.totalKeywords.toLocaleString(),
            color: '#8b5cf6',
            path: '/admin/articles',
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
                    </div>
                </div>

                {/* Recent Activity */}
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
                        margin: '0 0 20px 0',
                    }}>
                        Recent Activity
                    </h2>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }}>
                        {[
                            { action: 'New user registered', time: '2 hours ago', type: 'user' },
                            { action: 'Article published', time: '4 hours ago', type: 'article' },
                            { action: 'User account activated', time: '6 hours ago', type: 'user' },
                            { action: 'Article updated', time: '8 hours ago', type: 'article' },
                        ].map((activity, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '12px',
                                    backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                                    borderRadius: '8px',
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: textPrimary,
                                    marginBottom: '4px',
                                }}>
                                    {activity.action}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: textSecondary,
                                }}>
                                    {activity.time}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default AdminDashboardScreen;


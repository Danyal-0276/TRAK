import React, { useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { TrendingUp, Clock, Bookmark, Tag, Image } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../context/AuthContext';
import { useUserKeywords } from '../context/UserKeywordsContext';

const AppSidebar = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isDesktop } = useResponsive();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { keywords, loading: keywordsLoading } = useUserKeywords();
    const topicRows = useMemo(
        () => (keywords || []).map((t, i) => ({ id: `${i}-${t}`, topic: String(t) })),
        [keywords]
    );

    // Don't show sidebar on auth pages
    const hideNavPaths = ['/', '/login', '/signup', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection'];
    if (hideNavPaths.includes(location.pathname) || location.pathname.startsWith('/admin')) {
        return null;
    }

    // Hide on mobile/tablet
    if (!isDesktop) {
        return null;
    }

    const quickLinks = [
        { icon: TrendingUp, label: 'Trending', to: { pathname: '/newsfeed', search: '?tab=Trending' } },
        { icon: Bookmark, label: 'Bookmarks', to: '/bookmarks' },
        { icon: Clock, label: 'Recent', to: '/recent' },
        { icon: Image, label: 'Pics', to: '/pics' },
        { icon: Tag, label: 'Categories', to: '/categories' },
    ];

    const isQuickLinkActive = (link) => {
        const to = link.to;
        if (typeof to === 'object' && to.pathname === '/newsfeed' && to.search) {
            const tab = new URLSearchParams(to.search).get('tab') || 'For you';
            const activeTab = searchParams.get('tab') || 'For you';
            return location.pathname === '/newsfeed' && activeTab === tab;
        }
        const path = typeof to === 'string' ? to : to.pathname;
        return location.pathname === path;
    };

    const footerLinks = [
        { label: 'About', path: '/about' },
        { label: 'Help', path: '/help' },
        { label: 'Privacy', path: '/privacy' },
        { label: 'Terms', path: '/terms' },
    ];

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const borderColor = colors.border;

    return (
        <aside style={{
            position: 'fixed',
            right: 0,
            top: '64px',
            bottom: 0,
            width: '280px',
            backgroundColor: backgroundColor,
            borderLeft: `1px solid ${borderColor}`,
            padding: '24px 20px',
            zIndex: 100,
            overflowY: 'auto',
        }}>
            {/* Quick Links */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: textPrimary,
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Quick Links
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {quickLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = isQuickLinkActive(link);
                        const linkKey = typeof link.to === 'string' ? link.to : `${link.to.pathname}${link.to.search || ''}`;
                        const linkStyle = {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 12px',
                            border: 'none',
                            background: isActive
                                ? (isDark ? colors.surfaceElevated : '#f3f4f6')
                                : 'transparent',
                            cursor: 'pointer',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                            textDecoration: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                        };
                        return (
                            <Link
                                key={linkKey}
                                to={link.to}
                                style={linkStyle}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surface : '#f9fafb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <Icon
                                    size={16}
                                    color={isActive ? colors.primary : textSecondary}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span
                                    style={{
                                        fontSize: '13px',
                                        fontWeight: isActive ? '600' : '500',
                                        color: isActive ? colors.primary : textSecondary,
                                    }}
                                >
                                    {link.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Your tracked topics (from account keywords) */}
            <div>
                <h3 style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: textPrimary,
                    margin: '0 0 12px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                }}>
                    Your topics
                </h3>
                {!user ? (
                    <p style={{ fontSize: '12px', color: textSecondary, margin: 0, lineHeight: 1.5 }}>
                        Sign in to see the topics you follow.
                    </p>
                ) : keywordsLoading && topicRows.length === 0 ? (
                    <p style={{ fontSize: '12px', color: textSecondary, margin: 0, lineHeight: 1.5 }}>
                        Loading your topics…
                    </p>
                ) : topicRows.length === 0 ? (
                    <p style={{ fontSize: '12px', color: textSecondary, margin: 0, lineHeight: 1.5 }}>
                        No keywords yet.{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/categories')}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                padding: 0,
                                color: colors.primary,
                                cursor: 'pointer',
                                fontWeight: 600,
                                textDecoration: 'underline',
                            }}
                        >
                            Choose categories
                        </button>
                    </p>
                ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {topicRows.map((row) => (
                        <div
                            key={row.id}
                            onClick={() => navigate(`/search?q=${encodeURIComponent(row.topic)}`)}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: `1px solid ${borderColor}`,
                                backgroundColor: cardBackground,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated : '#f9fafb';
                                e.currentTarget.style.borderColor = isDark ? colors.borderLight : '#d1d5db';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = cardBackground;
                                e.currentTarget.style.borderColor = borderColor;
                            }}
                        >
                            <div style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: textPrimary,
                            }}>
                                #{row.topic}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: textSecondary,
                            }}>
                                Search articles
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '32px',
                paddingTop: '20px',
                borderTop: `1px solid ${borderColor}`,
            }}>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '10px',
                }}>
                    {footerLinks.map(({ label, path }) => (
                        <button
                            key={path}
                            type="button"
                            onClick={() => navigate(path)}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: textSecondary,
                                fontSize: '11px',
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'color 0.2s ease',
                                textDecoration: location.pathname === path ? 'underline' : 'none',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = isDark ? colors.primary : '#64748b';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = textSecondary;
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div style={{
                    fontSize: '11px',
                    color: textSecondary,
                }}>
                    © 2025 TRAK. All rights reserved.
                </div>
            </div>
        </aside>
    );
};

export default AppSidebar;

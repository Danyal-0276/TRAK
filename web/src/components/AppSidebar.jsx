import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Clock, Bookmark, Tag } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../context/AuthContext';
import { getUserKeywordsFromServer } from '../utils/Service/api';
import { getUserKeywords } from '../utils/userKeywordsStorage';

const AppSidebar = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isDesktop } = useResponsive();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [topicRows, setTopicRows] = useState([]);

    const loadTopics = useCallback(async () => {
        if (!user) {
            setTopicRows([]);
            return;
        }
        try {
            const res = await getUserKeywordsFromServer();
            const kws = Array.isArray(res?.keywords) ? res.keywords : [];
            if (kws.length) {
                setTopicRows(kws.map((t, i) => ({ id: `${i}-${t}`, topic: String(t) })));
                return;
            }
        } catch {
            /* fall back to local */
        }
        const local = getUserKeywords();
        setTopicRows(local.map((t, i) => ({ id: `${i}-${t}`, topic: String(t) })));
    }, [user]);

    useEffect(() => {
        loadTopics();
        const onKw = () => {
            loadTopics();
        };
        window.addEventListener('trak-keywords-changed', onKw);
        window.addEventListener('focus', onKw);
        return () => {
            window.removeEventListener('trak-keywords-changed', onKw);
            window.removeEventListener('focus', onKw);
        };
    }, [loadTopics]);

    // Don't show sidebar on auth pages
    const hideNavPaths = ['/', '/login', '/signup', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection'];
    if (hideNavPaths.includes(location.pathname)) {
        return null;
    }

    // Hide on mobile/tablet
    if (!isDesktop) {
        return null;
    }

    const quickLinks = [
        { icon: TrendingUp, label: 'Trending', path: '/trending' },
        { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
        { icon: Clock, label: 'Recent', path: '/recent' },
        { icon: Tag, label: 'Categories', path: '/categories' },
    ];

    const footerLinks = [
        { label: 'About', path: '/about' },
        { label: 'Help', path: '/help' },
        { label: 'Privacy', path: '/privacy' },
        { label: 'Terms', path: '/terms' },
    ];

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

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
                        const isActive = location.pathname === link.path;
                        return (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    border: 'none',
                                    background: isActive 
                                        ? (isDark ? colors.surfaceElevated || '#334155' : '#f3f4f6')
                                        : 'transparent',
                                    cursor: 'pointer',
                                    borderRadius: '6px',
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
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
                                    color={isActive 
                                        ? (isDark ? colors.primary || '#818CF8' : '#0f172a')
                                        : textSecondary
                                    } 
                                    strokeWidth={isActive ? 2.5 : 2} 
                                />
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: isActive ? '600' : '500',
                                    color: isActive 
                                        ? (isDark ? colors.primary || '#818CF8' : '#0f172a')
                                        : textSecondary,
                                }}>
                                    {link.label}
                                </span>
                            </button>
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
                                color: isDark ? colors.primary || '#818CF8' : '#0f172a',
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
                                e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
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
                                e.currentTarget.style.color = isDark ? colors.primary || '#818CF8' : '#64748b';
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

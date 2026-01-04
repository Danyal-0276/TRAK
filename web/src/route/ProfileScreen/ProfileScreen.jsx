import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { 
    Edit, 
    Settings, 
    Bookmark, 
    User, 
    Mail, 
    Phone, 
    Calendar,
    LogOut,
    CheckCircle,
    TrendingUp,
    Users,
    BookOpen
} from "lucide-react";
import { mockApi } from "../../utils/Service/mockApi";

const UserProfileScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({
        following: 180,
        followers: '2.4k',
        saved: 0,
    });

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            // Get bookmarks from localStorage
            const savedBookmarks = localStorage.getItem('bookmarks');
            if (savedBookmarks) {
                const bookmarkIds = JSON.parse(savedBookmarks);
                const allNews = await mockApi.getNewsFeed();
                const bookmarkedArticles = allNews.data.filter(article => 
                    bookmarkIds.includes(article.id)
                );
                setBookmarks(bookmarkedArticles);
                setUserStats(prev => ({ ...prev, saved: bookmarkedArticles.length }));
            }
        } catch (error) {
            console.error("Error loading bookmarks:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to log out?')) {
            navigate('/login');
        }
    };

    const items = [
        { label: 'Following', value: userStats.following, icon: Users },
        { label: 'Followers', value: userStats.followers, icon: TrendingUp },
        { label: 'Saved', value: userStats.saved, icon: BookOpen },
    ];

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
                width: '100%',
                padding: '0 24px 24px 24px',
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        Profile
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Manage your profile and preferences
                    </p>
                </div>

                {/* Profile Header Card */}
                <div style={{
                    backgroundColor: cardBackground,
                    borderRadius: '12px',
                    border: `1px solid ${borderColor}`,
                    padding: '32px',
                    marginBottom: '32px',
                    boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '24px',
                        marginBottom: '24px',
                    }}>
                        {/* Avatar */}
                        <div style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '12px',
                            backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexShrink: 0,
                            boxShadow: isDark ? '0 4px 12px rgba(129, 140, 248, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}>
                            <span style={{
                                fontSize: '36px',
                                fontWeight: '700',
                                color: '#ffffff',
                                letterSpacing: '0.5px',
                            }}>
                                S
                            </span>
                        </div>

                        {/* User Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px',
                            }}>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    color: textPrimary,
                                    margin: '0',
                                    letterSpacing: '-0.5px',
                                }}>
                                    Shahroz Butt
                                </h2>
                                <CheckCircle size={18} color="#10b981" fill="#10b981" />
                            </div>
                            <div style={{
                                fontSize: '15px',
                                color: textSecondary,
                                marginBottom: '12px',
                            }}>
                                @shahroz_butt
                            </div>
                            <div style={{
                                fontSize: '15px',
                                color: isDark ? colors.textSecondary || '#CBD5E1' : '#374151',
                                lineHeight: '1.6',
                                marginBottom: '16px',
                            }}>
                                Personalized AI News & Reports 📑 | Stay informed with curated content tailored to your interests. Exploring technology, business, and innovation.
                            </div>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '16px',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    color: textSecondary,
                                }}>
                                    <Mail size={14} color={textSecondary} />
                                    <span>shahroz.butt@gmail.com</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    color: textSecondary,
                                }}>
                                    <Phone size={14} color={textSecondary} />
                                    <span>+92 300 1234567</span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '14px',
                                    color: textSecondary,
                                }}>
                                    <Calendar size={14} color={textSecondary} />
                                    <span>Joined Jan 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '16px',
                        paddingTop: '24px',
                        borderTop: `1px solid ${borderColor}`,
                    }}>
                        {items.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={item.label}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                                        borderRadius: '8px',
                                        border: `1px solid ${borderColor}`,
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f3f4f6';
                                        e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                        e.currentTarget.style.borderColor = borderColor;
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        marginBottom: '8px',
                                    }}>
                                        <Icon size={20} color={textSecondary} />
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: '700',
                                        color: textPrimary,
                                        marginBottom: '4px',
                                    }}>
                                        {item.value}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: textSecondary,
                                        fontWeight: '500',
                                    }}>
                                        {item.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '24px',
                        paddingTop: '24px',
                        borderTop: `1px solid ${borderColor}`,
                    }}>
                        <button
                            onClick={() => navigate('/edit-profile')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.primaryDark || '#6366F1' : '#1e293b';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = isDark 
                                    ? '0 4px 12px rgba(129, 140, 248, 0.3)' 
                                    : '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Edit size={16} />
                            Edit Profile
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: cardBackground,
                                color: textPrimary,
                                border: `1px solid ${borderColor}`,
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
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
                            <Settings size={16} />
                            Settings
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: cardBackground,
                                color: '#ef4444',
                                border: '1px solid #fee2e2',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.borderColor = '#fecaca';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = cardBackground;
                                e.currentTarget.style.borderColor = '#fee2e2';
                            }}
                        >
                            <LogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Bookmarks Section */}
                <div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px',
                    }}>
                        <Bookmark size={24} color={textPrimary} />
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0',
                        }}>
                            Saved Articles
                        </h2>
                        {bookmarks.length > 0 && (
                            <span style={{
                                fontSize: '14px',
                                color: textSecondary,
                                fontWeight: '500',
                            }}>
                                ({bookmarks.length})
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '300px',
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
                    ) : bookmarks.length === 0 ? (
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
                            <Bookmark size={48} color={textSecondary} style={{ marginBottom: '16px' }} />
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: textPrimary,
                                margin: '0 0 8px 0',
                            }}>
                                No saved articles
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: textSecondary,
                                margin: '0',
                                textAlign: 'center',
                            }}>
                                Articles you bookmark will appear here
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '20px',
                        }}>
                            {bookmarks.map((bookmark) => (
                                <div
                                    key={bookmark.id}
                                    onClick={() => navigate(`/article/${bookmark.id}`)}
                                    style={{
                                        backgroundColor: cardBackground,
                                        borderRadius: '8px',
                                        border: `1px solid ${borderColor}`,
                                        padding: '20px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                                        e.currentTarget.style.borderColor = isDark ? colors.borderLight || '#475569' : '#d1d5db';
                                        e.currentTarget.style.boxShadow = isDark 
                                            ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
                                            : '0 2px 8px rgba(0, 0, 0, 0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = cardBackground;
                                        e.currentTarget.style.borderColor = borderColor;
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {bookmark.category && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                color: textSecondary,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px',
                                                padding: '4px 10px',
                                                backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f3f4f6',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                            }}>
                                                {bookmark.category}
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
                                        {bookmark.title || 'Article Title'}
                                    </h3>
                                    <p style={{
                                        fontSize: '14px',
                                        color: textSecondary,
                                        margin: '0 0 12px 0',
                                        lineHeight: '1.5',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}>
                                        {bookmark.excerpt || bookmark.description || 'Article summary...'}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <div style={{
                                            fontSize: '12px',
                                            color: textSecondary,
                                        }}>
                                            {bookmark.source || 'Source'} • {bookmark.time || '2h ago'}
                                        </div>
                                        <Bookmark size={14} color="#f59e0b" fill="#f59e0b" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default UserProfileScreen;

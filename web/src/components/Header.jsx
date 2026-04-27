import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Settings, User, Menu, X, Shield } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useResponsive } from '../hooks/useResponsive';
import Text from './ui/Text';
import { getProfile } from '../utils/Service/api';

const Header = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const { isAdmin } = useAuth();
    const { isMobile, isTablet } = useResponsive();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [profileInitial, setProfileInitial] = useState('U');
    const [avatarPreview, setAvatarPreview] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const profile = await getProfile();
                const base = (profile?.full_name || profile?.email || 'U').trim();
                setProfileInitial(base.charAt(0).toUpperCase() || 'U');
                setAvatarPreview(profile?.avatar_image || '');
            } catch {
                setProfileInitial('U');
                setAvatarPreview('');
            }
        })();
    }, [location.pathname]);

    // Don't show header on auth pages
    const hideHeaderPaths = ['/', '/login', '/signup', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection', '/terms', '/privacy'];
    if (hideHeaderPaths.includes(location.pathname)) {
        return null;
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const navLinks = [
        { path: '/newsfeed', label: 'Home' },
        { path: '/search', label: 'Explore' },
        { path: '/categories', label: 'Categories' },
        { path: '/about', label: 'About' },
    ];

    // Add admin link if user is admin
    if (isAdmin) {
        navLinks.push({ path: '/admin/dashboard', label: 'Admin' });
    }

    return (
        <header style={{
            position: 'sticky',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: isDark ? colors.background || '#0F172A' : '#ffffff',
            borderBottom: `1px solid ${isDark ? colors.border || '#334155' : '#e5e7eb'}`,
            zIndex: 1000,
            boxShadow: isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}>
            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                padding: isMobile ? '0 16px' : isTablet ? '0 24px' : '0 32px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: isMobile ? '8px' : '16px',
            }}>
                {/* Logo */}
                <div
                    onClick={() => navigate('/newsfeed')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        gap: isMobile ? '8px' : '12px',
                        minWidth: isMobile ? 'auto' : '180px',
                        flexShrink: 0,
                    }}
                >
                    <div style={{
                        width: isMobile ? '32px' : '36px',
                        height: isMobile ? '32px' : '36px',
                        backgroundColor: isDark ? colors.primary || '#818CF8' : '#000000',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img 
                            src="/images/whiteLogo.svg" 
                            alt="TRAK Logo" 
                            style={{ 
                                width: isMobile ? '20px' : '24px', 
                                height: isMobile ? '20px' : '24px',
                            }} 
                        />
                    </div>
                    {!isMobile && (
                        <Text variant="title" style={{
                            fontSize: isTablet ? '20px' : '24px',
                            fontWeight: '800',
                            color: isDark ? colors.textPrimary || '#F1F5F9' : '#000000',
                            letterSpacing: '-0.5px',
                        }}>
                            TRAK
                        </Text>
                    )}
                </div>

                {/* Navigation Links - Hidden on mobile */}
                {!isMobile && (
                    <nav style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isTablet ? '24px' : '40px',
                        flex: 1,
                        justifyContent: 'center',
                    }}>
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => navigate(link.path)}
                                style={{
                                    padding: '8px 0',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    fontSize: isTablet ? '14px' : '15px',
                                    fontWeight: location.pathname === link.path ? 600 : 500,
                                    color: location.pathname === link.path 
                                        ? (isDark ? colors.primary || '#818CF8' : '#000000')
                                        : (isDark ? colors.textSecondary || '#CBD5E1' : '#6b7280'),
                                    borderBottom: location.pathname === link.path 
                                        ? `2px solid ${isDark ? colors.primary || '#818CF8' : '#000000'}` 
                                        : '2px solid transparent',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (location.pathname !== link.path) {
                                        e.currentTarget.style.color = isDark ? colors.primary || '#818CF8' : '#000000';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (location.pathname !== link.path) {
                                        e.currentTarget.style.color = isDark ? colors.textSecondary || '#CBD5E1' : '#6b7280';
                                    }
                                }}
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>
                )}

                {/* Search Bar - Responsive */}
                {!isMobile && (
                    <form onSubmit={handleSearch} style={{
                        flex: 1,
                        maxWidth: isTablet ? '200px' : '400px',
                        margin: '0 16px',
                        position: 'relative',
                    }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                        }}>
                            <Search size={18} color={isDark ? colors.textTertiary || '#94A3B8' : '#9ca3af'} style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px 10px 44px',
                                    backgroundColor: isDark ? colors.surface || '#1E293B' : '#f9fafb',
                                    border: `1px solid ${isDark ? colors.border || '#334155' : '#e5e7eb'}`,
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    transition: 'all 0.2s ease',
                                    color: isDark ? colors.textPrimary || '#F1F5F9' : '#111827',
                                }}
                                onFocus={(e) => {
                                    e.target.style.backgroundColor = isDark ? colors.backgroundElevated || '#334155' : '#ffffff';
                                    e.target.style.borderColor = isDark ? colors.primary || '#818CF8' : '#000000';
                                    e.target.style.boxShadow = isDark 
                                        ? '0 0 0 3px rgba(129, 140, 248, 0.2)' 
                                        : '0 0 0 3px rgba(0, 0, 0, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                                    e.target.style.borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                    </form>
                )}

                {/* Mobile Search Button */}
                {isMobile && (
                    <button
                        onClick={() => navigate('/search')}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <Search size={20} color={isDark ? colors.textSecondary || '#CBD5E1' : '#6b7280'} />
                    </button>
                )}

                {/* Mobile Menu Button */}
                {isMobile && (
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: showMobileMenu 
                                ? (isDark ? colors.surface || '#1E293B' : '#f3f4f6') 
                                : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {showMobileMenu ? (
                            <X size={20} color={isDark ? colors.textPrimary || '#F1F5F9' : '#000000'} />
                        ) : (
                            <Menu size={20} color={isDark ? colors.textSecondary || '#CBD5E1' : '#6b7280'} />
                        )}
                    </button>
                )}

                {/* Right Actions */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '8px' : '12px',
                    minWidth: isMobile ? 'auto' : '180px',
                    justifyContent: 'flex-end',
                    flexShrink: 0,
                }}>
                    <button
                        onClick={() => navigate('/notifications')}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: location.pathname === '/notifications' 
                                ? (isDark ? colors.surface || '#1E293B' : '#f3f4f6') 
                                : 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            position: 'relative',
                        }}
                        onMouseEnter={(e) => {
                            if (location.pathname !== '/notifications') {
                                e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#f9fafb';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (location.pathname !== '/notifications') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        <Bell size={20} color={location.pathname === '/notifications' 
                            ? (isDark ? colors.primary || '#818CF8' : '#000000')
                            : (isDark ? colors.textSecondary || '#CBD5E1' : '#6b7280')} />
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#ef4444',
                            border: `2px solid ${isDark ? colors.background || '#0F172A' : '#ffffff'}`,
                        }} />
                    </button>

                    <button
                        onClick={() => navigate('/profile')}
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: `2px solid ${isDark ? colors.border || '#334155' : '#e5e7eb'}`,
                            backgroundColor: isDark ? colors.surface || '#1E293B' : '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#000000';
                            e.currentTarget.style.backgroundColor = isDark ? colors.surfaceElevated || '#334155' : '#f9fafb';
                        }}
                        onMouseLeave={(e) => {
                            if (!showUserMenu) {
                                e.currentTarget.style.borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';
                                e.currentTarget.style.backgroundColor = isDark ? colors.surface || '#1E293B' : '#ffffff';
                            }
                        }}
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                            <Text variant="body" style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: isDark ? colors.textPrimary || '#F1F5F9' : '#000000',
                            }}>
                                {profileInitial}
                            </Text>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobile && showMobileMenu && (
                <div style={{
                    position: 'absolute',
                    top: '64px',
                    left: 0,
                    right: 0,
                    backgroundColor: isDark ? colors.background || '#0F172A' : '#ffffff',
                    borderBottom: `1px solid ${isDark ? colors.border || '#334155' : '#e5e7eb'}`,
                    boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                    zIndex: 999,
                }}>
                    <div style={{
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                    }}>
                        {navLinks.map((link) => (
                            <button
                                key={link.path}
                                onClick={() => {
                                    navigate(link.path);
                                    setShowMobileMenu(false);
                                }}
                                style={{
                                    padding: '12px 16px',
                                    border: 'none',
                                    background: location.pathname === link.path 
                                        ? (isDark ? colors.surface || '#1E293B' : '#f3f4f6')
                                        : 'transparent',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: location.pathname === link.path ? 600 : 500,
                                    color: location.pathname === link.path 
                                        ? (isDark ? colors.primary || '#818CF8' : '#000000')
                                        : (isDark ? colors.textSecondary || '#CBD5E1' : '#6b7280'),
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;

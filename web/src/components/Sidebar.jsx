import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bell, User, Settings, Bookmark } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import Text from './ui/Text';
import NotificationBadge from './NotificationBadge';
import { useNotificationUnread } from '../context/NotificationUnreadContext';

const Sidebar = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigate = useNavigate();
    const location = useLocation();
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
    const { unreadCount } = useNotificationUnread();

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { icon: Home, path: '/newsfeed', label: 'Home' },
        { icon: Search, path: '/search', label: 'Search' },
        { icon: Bookmark, path: '/bookmarks', label: 'Bookmarks' },
        { icon: Bell, path: '/notifications', label: 'Notifications' },
        { icon: User, path: '/profile', label: 'Profile' },
        { icon: Settings, path: '/settings', label: 'Settings' },
    ];

    const isActive = (path) => location.pathname === path;

    // Don't show sidebar on auth pages
    const hideNavPaths = ['/', '/login', '/signup', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection'];
    if (hideNavPaths.includes(location.pathname)) {
        return null;
    }

    // Hide on mobile
    if (!isDesktop) {
        return null;
    }

    return (
        <aside style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            padding: '32px 20px',
            zIndex: 100,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: 'none',
        }}>
            {/* Logo */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 40,
                padding: '12px',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
            }} 
            onClick={() => navigate('/newsfeed')}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
            >
                <img src="/images/blackLogo.svg" alt="TRAK" style={{ width: 36, height: 36 }} />
                <Text variant="title" style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: '#0f172a',
                    letterSpacing: '-0.5px',
                }}>
                    TRAK
                </Text>
            </div>

            {/* Navigation Items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '14px 16px',
                                border: 'none',
                                background: active ? '#f1f5f9' : 'transparent',
                                cursor: 'pointer',
                                borderRadius: '12px',
                                transition: 'all 0.2s ease',
                                width: '100%',
                                textAlign: 'left',
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={{ position: 'relative', display: 'inline-flex' }}>
                              <Icon 
                                  size={22} 
                                  color={active ? '#3b82f6' : '#64748b'}
                                  strokeWidth={active ? 2.5 : 2}
                              />
                              {item.path === '/notifications' ? (
                                <NotificationBadge count={unreadCount} size="sm" style={{ top: -4, right: -8 }} />
                              ) : null}
                            </span>
                            <Text variant="body" style={{
                                fontSize: '15px',
                                fontWeight: active ? 600 : 500,
                                color: active ? '#3b82f6' : '#64748b',
                            }}>
                                {item.label}
                            </Text>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;

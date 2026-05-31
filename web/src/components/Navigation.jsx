import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bell, User, Settings } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';
import Text from './ui/Text';
import NotificationBadge from './NotificationBadge';
import { useNotificationUnread } from '../context/NotificationUnreadContext';

const Navigation = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const { unreadCount } = useNotificationUnread();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { icon: Home, path: '/newsfeed', label: 'Home' },
        { icon: Search, path: '/search', label: 'Search' },
        { icon: Bell, path: '/notifications', label: 'Notifications' },
        { icon: User, path: '/profile', label: 'Profile' },
        { icon: Settings, path: '/settings', label: 'Settings' },
    ];

    const isActive = (path) => location.pathname === path;

    // Don't show navigation on auth pages
    const hideNavPaths = ['/', '/login', '/signup', '/forgot-password', '/forgot-password-code', '/reset-password', '/password-changed', '/tag-selection', '/keyword-selection', '/terms', '/privacy'];
    if (hideNavPaths.includes(location.pathname) || location.pathname.startsWith('/admin')) {
        return null;
    }

    // Desktop: no bottom nav (sidebar handles it)
    if (!isMobile) {
        return null;
    }

    // Mobile: bottom navigation
    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderTop: `1px solid ${colors.border}`,
            padding: '8px 0',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
        }}>
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 4,
                            padding: '8px 16px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            borderRadius: 12,
                            transition: 'all 0.2s ease',
                            backgroundColor: active ? colors.backgroundSecondary : 'transparent',
                        }}
                    >
                        <span style={{ position: 'relative', display: 'inline-flex' }}>
                          <Icon 
                              size={22} 
                              color={active ? colors.primary : colors.textSecondary}
                              strokeWidth={active ? 2.5 : 2}
                          />
                          {item.path === '/notifications' ? (
                            <NotificationBadge count={unreadCount} size="sm" style={{ top: -6, right: -10 }} />
                          ) : null}
                        </span>
                        <Text variant="caption" style={{
                            fontSize: '11px',
                            fontWeight: active ? 600 : 400,
                            color: active ? colors.primary : colors.textSecondary,
                        }}>
                            {item.label}
                        </Text>
                    </button>
                );
            })}
        </nav>
    );
};

export default Navigation;


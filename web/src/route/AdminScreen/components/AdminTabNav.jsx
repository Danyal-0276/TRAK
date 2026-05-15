import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, Users, FileText, Bell, Settings } from 'lucide-react';
import { useTheme } from '../../../theme/ThemeContext';

const TABS = [
  { id: 'overview', path: '/admin/dashboard', icon: BarChart3, label: 'Overview' },
  { id: 'users', path: '/admin/users', icon: Users, label: 'Users' },
  { id: 'articles', path: '/admin/articles', icon: FileText, label: 'Articles' },
  { id: 'notifications', path: '/admin/notifications', icon: Bell, label: 'Notifications' },
  { id: 'settings', path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminTabNav() {
  const { theme } = useTheme();
  const { colors } = theme;
  const location = useLocation();
  const isDark = theme.mode === 'dark';

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin' || location.pathname === '/admin/analytics';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      style={{
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        overflowX: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 20px',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        {TABS.map(({ path, icon: Icon, label }) => {
          const active = isActive(path);
          return (
            <NavLink
              key={path}
              to={path}
              title={label}
              style={{
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: active
                    ? colors.primary || '#3b82f6'
                    : isDark
                      ? colors.backgroundSecondary || '#334155'
                      : '#f1f5f9',
                  transition: 'background-color 0.2s ease',
                }}
              >
                <Icon
                  size={20}
                  color={active ? '#fff' : colors.textSecondary}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminDashboardScreen from '../AdminDashboardScreen';
import AdminUsersScreen from '../AdminUsersScreen';
import AdminAdminsScreen from '../AdminAdminsScreen';
import AdminProfileScreen from '../AdminProfileScreen';
import AdminArticlesScreen from '../AdminArticlesScreen';
import AdminNotificationsScreen from '../AdminNotificationsScreen';
import AdminFeedbackScreen from '../AdminFeedbackScreen';
import AdminSettingsScreen from '../AdminSettingsScreen';
import AdminUserDetailScreen from '../AdminUserDetailScreen';
import { isDashboardPath, isArticlesPath } from '../hooks/useAdminTabActive';

const PAGES = [
  { id: 'dashboard', match: isDashboardPath, Component: AdminDashboardScreen },
  { id: 'users', match: (p) => p === '/admin/users', Component: AdminUsersScreen },
  { id: 'user-detail', match: (p) => /^\/admin\/users\/[^/]+$/.test(p), Component: AdminUserDetailScreen },
  { id: 'admins', match: (p) => p === '/admin/admins', Component: AdminAdminsScreen },
  { id: 'profile', match: (p) => p === '/admin/profile', Component: AdminProfileScreen },
  { id: 'articles', match: isArticlesPath, Component: AdminArticlesScreen },
  { id: 'notifications', match: (p) => p === '/admin/notifications', Component: AdminNotificationsScreen },
  { id: 'feedback', match: (p) => p === '/admin/feedback', Component: AdminFeedbackScreen },
  { id: 'settings', match: (p) => p === '/admin/settings' || p.startsWith('/admin/settings'), Component: AdminSettingsScreen },
];

/**
 * Keeps admin tab screens mounted so state (lists, scroll, filters) persists when switching tabs.
 */
export default function AdminKeepAliveOutlet() {
  const { pathname } = useLocation();

  return (
    <div style={{ width: '100%' }}>
      {PAGES.map(({ id, match, Component }) => {
        const visible = match(pathname);
        return (
          <div
            key={id}
            style={{
              display: visible ? 'block' : 'none',
              width: '100%',
            }}
            aria-hidden={!visible}
            data-admin-tab={id}
            data-active={visible ? 'true' : 'false'}
          >
            <Component />
          </div>
        );
      })}
    </div>
  );
}

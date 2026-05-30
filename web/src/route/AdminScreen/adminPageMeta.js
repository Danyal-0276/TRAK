import { useLocation } from 'react-router-dom';

const PAGE_META = {
  '/admin/dashboard': {
    title: 'Overview',
    description: 'Live scrape, pipeline, and credibility metrics',
  },
  '/admin/articles': {
    title: 'Articles',
    description: 'Raw and processed news articles',
  },
  '/admin/users': {
    title: 'Users',
    description: 'Manage platform user accounts',
  },
  '/admin/admins': {
    title: 'Administrators',
    description: 'Admin accounts and access',
  },
  '/admin/notifications': {
    title: 'Notifications',
    description: 'Pipeline errors and system alerts',
  },
  '/admin/settings': {
    title: 'Settings',
    description: 'Categories, connections, and platform config',
  },
  '/admin/profile': {
    title: 'Profile',
    description: 'Your administrator account',
  },
  '/admin/analytics': {
    title: 'Analytics',
    description: 'MongoDB counts and model metrics from the admin API',
  },
};

export function getAdminPageMeta(pathname) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith('/admin/articles')) return PAGE_META['/admin/articles'];
  if (pathname === '/admin' || pathname === '/admin/analytics') {
    return PAGE_META['/admin/dashboard'];
  }
  return { title: 'Admin', description: '' };
}

export function useAdminPageMeta() {
  const { pathname } = useLocation();
  return getAdminPageMeta(pathname);
}

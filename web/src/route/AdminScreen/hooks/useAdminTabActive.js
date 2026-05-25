import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useAdminTabActive(matchers) {
  const { pathname } = useLocation();
  return useMemo(() => matchers.some((fn) => fn(pathname)), [pathname, matchers]);
}

export function isDashboardPath(pathname) {
  return (
    pathname === '/admin/dashboard' ||
    pathname === '/admin' ||
    pathname === '/admin/analytics'
  );
}

export function isArticlesPath(pathname) {
  return pathname === '/admin/articles' || pathname.startsWith('/admin/articles');
}

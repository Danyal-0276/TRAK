/** Admin overview refresh — polled from AdminShell, consumed by Dashboard/Articles. */
export const ADMIN_OVERVIEW_REFRESH = 'admin:overview-refresh';

export function dispatchAdminOverviewRefresh(detail = { silent: true }) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_OVERVIEW_REFRESH, { detail }));
  }
}

export function subscribeAdminOverviewRefresh(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e) => handler(e.detail || {});
  window.addEventListener(ADMIN_OVERVIEW_REFRESH, listener);
  return () => window.removeEventListener(ADMIN_OVERVIEW_REFRESH, listener);
}

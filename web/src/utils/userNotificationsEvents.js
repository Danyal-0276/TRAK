/** Sync user notification unread counts across nav badges and the notifications page. */
export const USER_NOTIFICATION_SYNC_EVENT = 'user:notification-sync';

export function dispatchUserNotificationSync(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(USER_NOTIFICATION_SYNC_EVENT, { detail }));
  }
}

export function subscribeUserNotificationSync(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e) => handler(e.detail || {});
  window.addEventListener(USER_NOTIFICATION_SYNC_EVENT, listener);
  return () => window.removeEventListener(USER_NOTIFICATION_SYNC_EVENT, listener);
}

export function dispatchNotificationRead(notificationId) {
  dispatchUserNotificationSync({ type: 'read', id: notificationId });
}

export function dispatchAllNotificationsRead() {
  dispatchUserNotificationSync({ type: 'readAll' });
}

export function dispatchNotificationCreated(notification = {}) {
  dispatchUserNotificationSync({ type: 'created', notification });
}

export function dispatchNotificationsRefresh() {
  dispatchUserNotificationSync({ type: 'refresh' });
}

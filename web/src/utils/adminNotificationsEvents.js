/** Admin live notifications — fan-out from AdminShell WebSocket. */
export const ADMIN_NOTIFICATION_EVENT = 'admin:notification';

export function dispatchAdminNotification(notification = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_NOTIFICATION_EVENT, { detail: notification }));
  }
}

export function subscribeAdminNotifications(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e) => handler(e.detail || {});
  window.addEventListener(ADMIN_NOTIFICATION_EVENT, listener);
  return () => window.removeEventListener(ADMIN_NOTIFICATION_EVENT, listener);
}

export function isFeedbackNotificationType(type) {
  return type === 'admin_user_feedback' || type === 'admin_user_report';
}

export const ADMIN_FEEDBACK_REFRESH_EVENT = 'admin:feedback-refresh';

export function dispatchAdminFeedbackRefresh(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_FEEDBACK_REFRESH_EVENT, { detail }));
  }
}

export function subscribeAdminFeedbackRefresh(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e) => handler(e.detail || {});
  window.addEventListener(ADMIN_FEEDBACK_REFRESH_EVENT, listener);
  return () => window.removeEventListener(ADMIN_FEEDBACK_REFRESH_EVENT, listener);
}

export const ADMIN_NOTIFICATION_SYNC_EVENT = 'admin:notification-sync';

export function dispatchAdminNotificationSync(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_NOTIFICATION_SYNC_EVENT, { detail }));
  }
}

export function subscribeAdminNotificationSync(handler) {
  if (typeof window === 'undefined') return () => {};
  const listener = (e) => handler(e.detail || {});
  window.addEventListener(ADMIN_NOTIFICATION_SYNC_EVENT, listener);
  return () => window.removeEventListener(ADMIN_NOTIFICATION_SYNC_EVENT, listener);
}

export function dispatchAdminNotificationRead(notificationId) {
  dispatchAdminNotificationSync({ type: 'read', id: notificationId });
}

export function dispatchAllAdminNotificationsRead() {
  dispatchAdminNotificationSync({ type: 'readAll' });
}

export function dispatchAdminNotificationsRefresh() {
  dispatchAdminNotificationSync({ type: 'refresh' });
}

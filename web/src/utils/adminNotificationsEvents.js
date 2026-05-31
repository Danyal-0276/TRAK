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

/** Admin live notifications — fan-out from AdminScreen WebSocket. */

const notificationListeners = new Set();
const feedbackRefreshListeners = new Set();

export function dispatchAdminNotification(notification = {}) {
  notificationListeners.forEach((fn) => {
    try {
      fn(notification);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeAdminNotifications(handler) {
  notificationListeners.add(handler);
  return () => notificationListeners.delete(handler);
}

export function isFeedbackNotificationType(type) {
  return type === 'admin_user_feedback' || type === 'admin_user_report';
}

export function dispatchAdminFeedbackRefresh(detail = {}) {
  feedbackRefreshListeners.forEach((fn) => {
    try {
      fn(detail);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeAdminFeedbackRefresh(handler) {
  feedbackRefreshListeners.add(handler);
  return () => feedbackRefreshListeners.delete(handler);
}

/** Sync user notification unread counts across nav badges and the notifications page. */

const syncListeners = new Set();

export function dispatchUserNotificationSync(detail = {}) {
  syncListeners.forEach((fn) => {
    try {
      fn(detail);
    } catch {
      /* ignore */
    }
  });
}

export function subscribeUserNotificationSync(handler) {
  syncListeners.add(handler);
  return () => syncListeners.delete(handler);
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

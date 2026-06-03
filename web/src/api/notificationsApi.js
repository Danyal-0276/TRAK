import { authRequest } from '../utils/Service/api';
import {
  getNotificationSourceName,
  isArticleKeywordNotification,
} from '../utils/notificationDisplay';

function timeAgo(iso) {
  if (!iso) return '';
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return '';
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function normalizeNotification(row) {
  if (!row || typeof row !== 'object') {
    return {
      id: '',
      type: 'system',
      text: '',
      details: '',
      read: true,
      meta: {},
      time: '',
      user: 'TRAK',
      sourceName: 'TRAK',
      postTitle: null,
    };
  }

  const isKeyword = isArticleKeywordNotification(row);
  const sourceName = getNotificationSourceName(row);
  return {
    ...row,
    time: timeAgo(row.created_at),
    user: isKeyword ? sourceName : (row.meta?.actor || 'TRAK'),
    sourceName,
    postTitle: row.meta?.post_title || null,
  };
}

export async function getUnreadCount() {
  return authRequest('/api/notifications/unread-count/');
}

export async function getNotifications({ limit = 80 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await authRequest(`/api/notifications/?${params}`);
  return (res.results || []).map(normalizeNotification);
}

/** Match recent articles to this user's saved topics and create alerts. */
export async function backfillKeywordNotifications({ hours = 168, limit = 200 } = {}) {
  return authRequest('/api/notifications/backfill-keywords/', {
    method: 'POST',
    body: JSON.stringify({ hours, limit }),
  });
}

export async function markAsRead(notificationId) {
  const row = await authRequest(`/api/notifications/${notificationId}/mark-read/`, { method: 'POST' });
  return normalizeNotification(row);
}

export async function markAllAsRead() {
  return authRequest('/api/notifications/mark-all-read/', { method: 'POST' });
}

export async function registerDeviceToken(token, platform = 'web') {
  return authRequest('/api/notifications/device-token/', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

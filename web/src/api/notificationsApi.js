import { authRequest } from '../utils/Service/api';

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
  return {
    ...row,
    time: timeAgo(row.created_at),
    user: row.meta?.actor || 'TRAK',
    postTitle: row.meta?.post_title || null,
  };
}

export async function getNotifications() {
  const res = await authRequest('/api/notifications/');
  return (res.results || []).map(normalizeNotification);
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

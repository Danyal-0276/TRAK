import { API_BASE } from '../config/api';
import { apiFetch } from './client';

const PREFIX = `${API_BASE}/api/notifications`;

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
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function normalizeNotification(row) {
  return {
    ...row,
    time: timeAgo(row.created_at),
    user: row.meta?.actor || 'TRAK',
    avatar: row.meta?.avatar || '🔔',
    postTitle: row.meta?.post_title || null,
  };
}

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`);
  return data;
}

export async function getNotifications() {
  const res = await apiFetch(`${PREFIX}/`, {}, API_BASE);
  const data = await parseJson(res);
  return (data.results || []).map(normalizeNotification);
}

export async function getNotificationDetails(id) {
  const res = await apiFetch(`${PREFIX}/${id}/`, {}, API_BASE);
  return normalizeNotification(await parseJson(res));
}

export async function markAsRead(id) {
  const res = await apiFetch(`${PREFIX}/${id}/mark-read/`, { method: 'POST' }, API_BASE);
  return normalizeNotification(await parseJson(res));
}

export async function markAllAsRead() {
  const res = await apiFetch(`${PREFIX}/mark-all-read/`, { method: 'POST' }, API_BASE);
  return parseJson(res);
}

export async function registerDeviceToken(token, platform = 'mobile') {
  const res = await apiFetch(
    `${PREFIX}/device-token/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, platform }),
    },
    API_BASE
  );
  return parseJson(res);
}

import { API_BASE } from '../config/api';

import { apiFetch } from './client';

import {

  getNotificationSourceName,

  isArticleKeywordNotification,

} from '../utils/notificationDisplay';

import { parseFeedbackTimestamp } from '../constants/feedbackCategoryMeta';



const PREFIX = `${API_BASE}/api/notifications`;



function timeAgo(iso) {

  const d = parseFeedbackTimestamp(iso);

  if (!d) return '';

  const diff = Math.max(0, Date.now() - d.getTime());

  const m = Math.floor(diff / 60000);

  if (m < 1) return 'just now';

  if (m < 60) return `${m}m ago`;

  const h = Math.floor(m / 60);

  if (h < 24) return `${h}h ago`;

  const days = Math.floor(h / 24);

  return `${days}d ago`;

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

      avatar: '🔔',

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

    avatar: row.meta?.avatar || '🔔',

    postTitle: row.meta?.post_title || null,

  };

}



async function parseJson(res) {

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.detail || `Request failed (${res.status})`);

  return data;

}



export async function getUnreadCount() {

  const res = await apiFetch(`${PREFIX}/unread-count/`, {}, API_BASE);

  return parseJson(res);

}



export async function getNotifications({ limit = 80 } = {}) {

  const res = await apiFetch(`${PREFIX}/?limit=${encodeURIComponent(String(limit))}`, {}, API_BASE);

  const data = await parseJson(res);

  return (data.results || []).map(normalizeNotification);

}



export async function backfillKeywordNotifications({ hours = 168, limit = 200 } = {}) {

  const res = await apiFetch(

    `${PREFIX}/backfill-keywords/`,

    {

      method: 'POST',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ hours, limit }),

    },

    API_BASE

  );

  return parseJson(res);

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



export async function getNotificationPreferences() {

  const res = await apiFetch(`${PREFIX}/preferences/`, {}, API_BASE);

  return parseJson(res);

}



export async function patchNotificationPreferences(body) {

  const res = await apiFetch(

    `${PREFIX}/preferences/`,

    {

      method: 'PATCH',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify(body),

    },

    API_BASE

  );

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



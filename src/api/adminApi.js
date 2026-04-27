import { ADMIN_PREFIX, API_BASE } from '../config/api';
import { apiFetch } from './client';

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || data.message || `Request failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function getAdminAnalytics() {
  const res = await apiFetch(`${ADMIN_PREFIX}/analytics/`, {}, API_BASE);
  return parseJson(res);
}

export async function getAdminArticles({ page = 1, pageSize = 20, scope = 'all' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    scope: String(scope),
  });
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/?${params}`, {}, API_BASE);
  return parseJson(res);
}

export async function postAdminPipelineRun(limit = 10) {
  const res = await apiFetch(
    `${ADMIN_PREFIX}/pipeline/run/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit }),
    },
    API_BASE
  );
  return parseJson(res);
}

export async function getAdminModelMetrics() {
  const res = await apiFetch(`${ADMIN_PREFIX}/model-metrics/`, {}, API_BASE);
  return parseJson(res);
}

export async function getAdminUsers(q = '') {
  const suffix = q ? `?q=${encodeURIComponent(q)}` : '';
  const res = await apiFetch(`${ADMIN_PREFIX}/users/${suffix}`, {}, API_BASE);
  return parseJson(res);
}

export async function patchAdminUser(userId, payload) {
  const res = await apiFetch(
    `${ADMIN_PREFIX}/users/${userId}/`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
    API_BASE
  );
  return parseJson(res);
}

export async function deleteAdminUser(userId) {
  const res = await apiFetch(`${ADMIN_PREFIX}/users/${userId}/`, { method: 'DELETE' }, API_BASE);
  return parseJson(res);
}

export async function getAdminSettings() {
  const res = await apiFetch(`${ADMIN_PREFIX}/settings/`, {}, API_BASE);
  return parseJson(res);
}

export async function patchAdminSettings(payload) {
  const res = await apiFetch(
    `${ADMIN_PREFIX}/settings/`,
    { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) },
    API_BASE
  );
  return parseJson(res);
}

export async function getAdminNotifications() {
  const res = await apiFetch(`${ADMIN_PREFIX}/notifications/`, {}, API_BASE);
  return parseJson(res);
}

/**
 * Admin REST client — same `/api/admin/*` endpoints as mobile (`TRAK/src/api/adminApi.js`).
 */
import { ADMIN_PREFIX } from '../config/api';
import { apiFetch } from './client';

async function parseJson(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || data.message || `Request failed (${res.status})`;
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
  }
  return data;
}

export async function getAdminAnalytics({ cacheBust = false } = {}) {
  const suffix = cacheBust ? `?_t=${Date.now()}` : '';
  const res = await apiFetch(`${ADMIN_PREFIX}/analytics/${suffix}`);
  return parseJson(res);
}

export async function getAdminArticles({ page = 1, pageSize = 20, scope = 'all' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    scope: String(scope),
  });
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/?${params}`);
  return parseJson(res);
}

export async function postAdminPipelineRun(limit = 10) {
  const res = await apiFetch(`${ADMIN_PREFIX}/pipeline/run/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit }),
  });
  return parseJson(res);
}

export async function getAdminModelMetrics() {
  const res = await apiFetch(`${ADMIN_PREFIX}/model-metrics/`);
  return parseJson(res);
}

export async function getAdminUsers({ q = '', role = 'all' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (role && role !== 'all') params.set('role', role);
  const suffix = params.toString() ? `?${params}` : '';
  const res = await apiFetch(`${ADMIN_PREFIX}/users/${suffix}`);
  return parseJson(res);
}

export async function postAdminCreate(email, password) {
  const res = await apiFetch(`${ADMIN_PREFIX}/admins/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJson(res);
}

export async function patchAdminUser(userId, payload) {
  const res = await apiFetch(`${ADMIN_PREFIX}/users/${userId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function deleteAdminUser(userId) {
  const res = await apiFetch(`${ADMIN_PREFIX}/users/${userId}/`, { method: 'DELETE' });
  return parseJson(res);
}

export async function patchAdminArticle(scope, articleId, payload) {
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/${encodeURIComponent(scope)}/${encodeURIComponent(articleId)}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function deleteAdminArticle(scope, articleId) {
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/${encodeURIComponent(scope)}/${encodeURIComponent(articleId)}/`, {
    method: 'DELETE',
  });
  return parseJson(res);
}

export async function getAdminSettings() {
  const res = await apiFetch(`${ADMIN_PREFIX}/settings/`);
  return parseJson(res);
}

export async function patchAdminSettings(payload) {
  const res = await apiFetch(`${ADMIN_PREFIX}/settings/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function getAdminNotifications() {
  const res = await apiFetch(`${ADMIN_PREFIX}/notifications/`);
  return parseJson(res);
}

export async function createAdminCategory(name, subcategories = []) {
  const res = await apiFetch(`${ADMIN_PREFIX}/settings/categories/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, subcategories }),
  });
  return parseJson(res);
}

export async function deleteAdminCategory(slug) {
  const res = await apiFetch(`${ADMIN_PREFIX}/settings/categories/${encodeURIComponent(slug)}/`, {
    method: 'DELETE',
  });
  if (res.status === 204) return {};
  return parseJson(res);
}

export async function addAdminSubcategory(categorySlug, name) {
  const res = await apiFetch(
    `${ADMIN_PREFIX}/settings/categories/${encodeURIComponent(categorySlug)}/subcategories/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    }
  );
  return parseJson(res);
}

export async function deleteAdminSubcategory(categorySlug, subSlug) {
  const res = await apiFetch(
    `${ADMIN_PREFIX}/settings/categories/${encodeURIComponent(categorySlug)}/subcategories/${encodeURIComponent(subSlug)}/`,
    { method: 'DELETE' }
  );
  if (res.status === 204) return {};
  return parseJson(res);
}

export async function createAdminConnection(name, url = '') {
  const res = await apiFetch(`${ADMIN_PREFIX}/settings/connections/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, url }),
  });
  return parseJson(res);
}

export async function deleteAdminConnection(slug) {
  const res = await apiFetch(`${ADMIN_PREFIX}/settings/connections/${encodeURIComponent(slug)}/`, {
    method: 'DELETE',
  });
  if (res.status === 204) return {};
  return parseJson(res);
}

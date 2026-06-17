/**
 * Admin REST client — same `/api/admin/*` endpoints as mobile (`TRAK/src/api/adminApi.js`).
 */
import { ADMIN_PREFIX } from '../config/api';
import { apiFetch } from './client';
import { PIPELINE_RUN_TIMEOUT_MS } from './fetchWithTimeout';
import { parseApiResponse } from '../utils/getUserFacingError';

async function parseJson(res) {
  return parseApiResponse(res);
}

export async function getAdminAnalytics({ cacheBust = false } = {}) {
  const suffix = cacheBust ? `?_t=${Date.now()}` : '';
  const res = await apiFetch(`${ADMIN_PREFIX}/analytics/${suffix}`);
  return parseJson(res);
}

export async function getAdminArticles({ page = 1, pageSize = 20, scope = 'all', pipelineStatus = '', moderationStatus = '', credibilityLabel = '', q = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    scope: String(scope),
  });
  if (pipelineStatus) params.set('pipeline_status', String(pipelineStatus));
  if (moderationStatus) params.set('moderation_status', String(moderationStatus));
  if (credibilityLabel) params.set('credibility_label', String(credibilityLabel));
  if (q && String(q).trim()) params.set('q', String(q).trim());
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/?${params}`);
  return parseJson(res);
}

export function getAdminArticleImageProxyUrl(imageUrl) {
  if (!imageUrl) return '';
  const params = new URLSearchParams({ url: String(imageUrl) });
  return `${ADMIN_PREFIX}/articles/image-proxy/?${params.toString()}`;
}

export async function postAdminPipelineRun(limit = 10, { drainQueue = true } = {}) {
  const res = await apiFetch(`${ADMIN_PREFIX}/pipeline/run/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit, drain_queue: drainQueue }),
  }, PIPELINE_RUN_TIMEOUT_MS);
  return parseJson(res);
}

export async function postAdminScrapeRun(limit = 40) {
  const res = await apiFetch(`${ADMIN_PREFIX}/scrape/run/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit }),
  }, PIPELINE_RUN_TIMEOUT_MS);
  return parseJson(res);
}

export async function postAdminScrapeAndPipelineRun({ scrapeLimit = 40, pipelineLimit = 200 } = {}) {
  const res = await apiFetch(`${ADMIN_PREFIX}/scrape-and-pipeline/run/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scrape_limit: scrapeLimit, pipeline_limit: pipelineLimit }),
  }, PIPELINE_RUN_TIMEOUT_MS);
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

export async function getAdminUserDetail(userId) {
  const res = await apiFetch(`${ADMIN_PREFIX}/users/${encodeURIComponent(userId)}/`);
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

export async function getAdminArticleById(articleId) {
  const params = new URLSearchParams({ id: String(articleId) });
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/lookup/?${params}`);
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

export async function requeueAdminArticle(scope, articleId) {
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/${encodeURIComponent(scope)}/${encodeURIComponent(articleId)}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requeue: true }),
  });
  return parseJson(res);
}

export async function requeueAllFailedArticles() {
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/failed/bulk/`, { method: 'POST' });
  return parseJson(res);
}

export async function deleteAllFailedArticles() {
  const res = await apiFetch(`${ADMIN_PREFIX}/articles/failed/bulk/`, { method: 'DELETE' });
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

export async function markAdminNotificationRead(notificationId) {
  const res = await apiFetch(
    `${ADMIN_PREFIX}/notifications/${encodeURIComponent(notificationId)}/mark-read/`,
    { method: 'POST' }
  );
  return parseJson(res);
}

export async function getAdminFeedback({ status = '', type = '', category = '', limit = 50, skip = 0 } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (type) params.set('type', type);
  if (category) params.set('category', category);
  params.set('limit', String(limit));
  params.set('skip', String(skip));
  const res = await apiFetch(`${ADMIN_PREFIX}/feedback/?${params}`);
  return parseJson(res);
}

export async function getAdminFeedbackDetail(feedbackId) {
  const res = await apiFetch(`${ADMIN_PREFIX}/feedback/${encodeURIComponent(feedbackId)}/`);
  return parseJson(res);
}

export async function patchAdminFeedback(feedbackId, payload) {
  const res = await apiFetch(`${ADMIN_PREFIX}/feedback/${encodeURIComponent(feedbackId)}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
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

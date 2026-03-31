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

export async function getAdminAnalytics() {
  const res = await apiFetch(`${ADMIN_PREFIX}/analytics/`);
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

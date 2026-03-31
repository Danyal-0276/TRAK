import { mockApi } from './Service/mockApi';
import { USER_PREFIX } from '../config/api';
import { apiFetch } from '../api/client';

/** Dev-only mock fallback unless VITE_ALLOW_MOCK_FEED=true (not recommended for prod). */
const allowMockFallback =
  import.meta.env.DEV === true || import.meta.env.VITE_ALLOW_MOCK_FEED === 'true';

export function mapApiItem(a) {
  const cred = a.credibility || {};
  const label = cred.label || cred.label_code;
  return {
    id: a.id,
    source: a.source || 'TRAK',
    time: a.published_at ? String(a.published_at).slice(0, 16) : '',
    title: a.title || '',
    excerpt: a.excerpt || '',
    content: a.content || '',
    fullContent: a.content || '',
    categories: label ? [String(label)] : ['News'],
    category: 'News',
    trending: cred.label_code === 2 || cred.label === 'suspicious',
    votes: 0,
    credibility: a.credibility,
    upvotes: 0,
    topic_keywords: a.topic_keywords || [],
  };
}

async function fetchFeed(limit = 50, q = '') {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q && String(q).trim()) params.set('q', String(q).trim());
  const res = await apiFetch(`${USER_PREFIX}/feed/?${params}`);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Feed ${res.status}`);
  }
  return res.json();
}

/** @param {{ q?: string }} [options] */
export async function loadFeedItems(options = {}) {
  const q = options.q || '';
  const token = localStorage.getItem('trak_access');
  if (token) {
    try {
      const json = await fetchFeed(80, q);
      return (json.results || []).map(mapApiItem);
    } catch (e) {
      if (!allowMockFallback) {
        console.error(e);
        return [];
      }
      console.warn('API feed failed, using mock:', e?.message);
    }
  }
  if (!allowMockFallback) {
    return [];
  }
  const response = await mockApi.getNewsFeed();
  return response.data;
}

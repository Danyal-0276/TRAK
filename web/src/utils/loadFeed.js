import { mockApi } from './Service/mockApi';
import { USER_PREFIX } from '../config/api';
import { apiFetch } from '../api/client';

/** Dev-only mock fallback unless VITE_ALLOW_MOCK_FEED=true (not recommended for prod). */
const allowMockFallback =
  import.meta.env.DEV === true || import.meta.env.VITE_ALLOW_MOCK_FEED === 'true';

export function mapApiItem(a) {
  const cred = a.credibility || {};
  const label = cred.label || cred.label_code;
  const likes = Number(a.like_count ?? a.upvotes ?? 0);
  const dislikes = Number(a.dislike_count ?? 0);
  return {
    id: a.id,
    source: a.source || a.source_key || '',
    time: a.published_at ? String(a.published_at).slice(0, 16) : '',
    title: a.title || '',
    excerpt: a.excerpt || a.summary || '',
    summary: a.summary || a.excerpt || '',
    content: a.content || a.full_content || '',
    fullContent: a.full_content || a.content || '',
    categories: label ? [String(label)] : ['News'],
    category: 'News',
    trending: cred.label_code === 2 || cred.label === 'suspicious',
    votes: likes,
    credibility: a.credibility,
    like_count: likes,
    dislike_count: dislikes,
    upvotes: likes,
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

async function fetchExplore(limit = 200, q = '', cursor = '') {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q && String(q).trim()) params.set('q', String(q).trim());
  if (cursor && String(cursor).trim()) params.set('cursor', String(cursor).trim());
  const res = await apiFetch(`${USER_PREFIX}/explore/?${params}`);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `Explore ${res.status}`);
  }
  return res.json();
}

export async function loadExplorePage({ q = '', limit = 30, cursor = '' } = {}) {
  const json = await fetchExplore(limit, q, cursor);
  const results = (json.results || []).map(mapApiItem);
  return {
    items: results,
    nextCursor: json.next_cursor || '',
    hasMore: Boolean(json.has_more),
  };
}

/** @param {{ q?: string }} [options] */
export async function loadFeedItems(options = {}) {
  const q = options.q || '';
  const token = localStorage.getItem('trak_access_token') || localStorage.getItem('trak_access');
  if (token) {
    try {
      // Discover should use explore feed, not personalized feed.
      const json = await fetchExplore(200, q);
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

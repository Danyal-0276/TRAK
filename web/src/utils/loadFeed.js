import { mockApi } from './Service/mockApi';
import { USER_PREFIX } from '../config/api';
import { apiFetch } from '../api/client';
import { getCardSummaryText } from './articleNavigation';
import { parseApiResponse } from './getUserFacingError';
import { filterRealFeedItems } from './feedRealOnly';

/** Mock feed only when explicitly enabled (never auto-on in dev — hides real API issues). */
const allowMockFallback = import.meta.env.VITE_ALLOW_MOCK_FEED === 'true';

export { filterRealFeedItems, isRealFeedArticle } from './feedRealOnly';

export function mapApiItem(a) {
  const cred = a.credibility || {};
  const label = cred.label || cred.label_code;
  const labelStr = String(label ?? '').toLowerCase();
  const likes = Number(a.like_count ?? a.upvotes ?? 0);
  const dislikes = Number(a.dislike_count ?? 0);
  const topicKeywords = a.topic_keywords || [];
  const mlCategories = Array.isArray(a.categories) ? a.categories.filter(Boolean) : [];
  const summaryText = getCardSummaryText({
    title: a.title,
    summary: a.summary,
    excerpt: a.excerpt,
    description: a.description,
    full_content: a.full_content,
    fullContent: a.full_content,
    content: a.content,
  });
  return {
    id: a.id,
    source: a.source || a.source_key || '',
    canonical_url: a.canonical_url || a.url || '',
    url: a.url || a.canonical_url || '',
    time: a.published_at ? String(a.published_at).slice(0, 16) : '',
    title: a.title || '',
    excerpt: a.excerpt || a.summary || summaryText,
    summary: a.summary || a.excerpt || summaryText,
    description: summaryText,
    content: a.content || a.full_content || '',
    fullContent: a.full_content || a.content || '',
    primary_category: a.primary_category || '',
    categories: mlCategories,
    category: (topicKeywords[0] || 'News').toString().toUpperCase(),
    trending: cred.label_code === 2 || cred.label === 'suspicious' || labelStr === 'suspicious',
    votes: likes,
    credibility: a.credibility,
    credibilityLabel: labelStr || null,
    credibility_label: cred.label_code ?? a.credibility_label,
    credibility_label_name: cred.label || a.credibility_label_name,
    isFake: labelStr === 'fake' || Number(cred.label_code) === 1,
    isLowCredibility: labelStr === 'fake' || labelStr === 'suspicious' || Number(cred.label_code) === 2,
    like_count: likes,
    dislike_count: dislikes,
    upvotes: likes,
    topic_keywords: topicKeywords,
    image_url: a.image_url || null,
    image: (a.image_url || a.image || a.thumbnail_url || '').trim() || undefined,
  };
}

async function fetchFeed(limit = 30, q = '', cursor = '') {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q && String(q).trim()) params.set('q', String(q).trim());
  if (cursor && String(cursor).trim()) params.set('cursor', String(cursor).trim());
  const res = await apiFetch(`${USER_PREFIX}/feed/?${params}`);
  return parseApiResponse(res);
}

export function mergeUniqueById(existing, incoming) {
  const seen = new Set((existing || []).map((x) => String(x.id)));
  const out = [...(existing || [])];
  for (const item of incoming || []) {
    const id = String(item.id);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(item);
  }
  return out;
}

async function fetchExplore(limit = 50, q = '', cursor = '', category = '') {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q && String(q).trim()) params.set('q', String(q).trim());
  if (category && String(category).trim()) params.set('category', String(category).trim());
  if (cursor && String(cursor).trim()) params.set('cursor', String(cursor).trim());
  const res = await apiFetch(`${USER_PREFIX}/explore/?${params}`);
  return parseApiResponse(res);
}

async function fetchPics(limit = 50, q = '', cursor = '') {
  const params = new URLSearchParams({ limit: String(limit) });
  if (q && String(q).trim()) params.set('q', String(q).trim());
  if (cursor && String(cursor).trim()) params.set('cursor', String(cursor).trim());
  const res = await apiFetch(`${USER_PREFIX}/pics/?${params}`);
  return parseApiResponse(res);
}

export async function loadCategoryPage({ category = '', limit = 30, cursor = '' } = {}) {
  try {
    const json = await fetchExplore(limit, '', cursor, category);
    const results = filterRealFeedItems((json.results || []).map(mapApiItem));
    return {
      items: results,
      nextCursor: json.next_cursor || '',
      hasMore: Boolean(json.has_more),
      categoryTotal: json.category_total != null ? Number(json.category_total) : null,
    };
  } catch (e) {
    if (allowMockFallback) {
      console.warn('Category API failed, using mock:', e?.message);
      const response = await mockApi.getNewsFeed();
      return { items: (response.data || []).map(mapApiItem), nextCursor: '', hasMore: false };
    }
    throw e;
  }
}

export async function loadExplorePage({ q = '', limit = 30, cursor = '', category = '' } = {}) {
  try {
    const json = await fetchExplore(limit, q, cursor, category);
    const results = filterRealFeedItems((json.results || []).map(mapApiItem));
    return {
      items: results,
      nextCursor: json.next_cursor || '',
      hasMore: Boolean(json.has_more),
    };
  } catch (e) {
    if (allowMockFallback) {
      console.warn('Explore API failed, using mock:', e?.message);
      const response = await mockApi.getNewsFeed();
      const items = (response.data || []).map((item) => ({
        ...item,
        id: item.id,
        category: item.category || 'News',
      }));
      return { items, nextCursor: '', hasMore: false };
    }
    throw e;
  }
}

export async function loadPicsPage({ q = '', limit = 30, cursor = '' } = {}) {
  const json = await fetchPics(limit, q, cursor);
  const results = filterRealFeedItems((json.results || []).map(mapApiItem));
  return {
    items: results,
    nextCursor: json.next_cursor || '',
    hasMore: Boolean(json.has_more),
  };
}

export async function loadFeedPage({ q = '', limit = 30, cursor = '' } = {}) {
  const json = await fetchFeed(limit, q, cursor);
  const results = filterRealFeedItems((json.results || []).map(mapApiItem));
  return {
    items: results,
    nextCursor: json.next_cursor || '',
    hasMore: Boolean(json.has_more),
  };
}

/** @param {{ q?: string, limit?: number }} [options] */
export async function loadFeedItems(options = {}) {
  const q = options.q || '';
  const limit = options.limit ?? 50;
  const token = localStorage.getItem('trak_access_token') || localStorage.getItem('trak_access');
  if (token) {
    try {
      const { items } = await loadExplorePage({ q, limit });
      return items;
    } catch (e) {
      if (!allowMockFallback) {
        console.error(e);
        throw e;
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

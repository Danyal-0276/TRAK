import { mockApi } from './Service/mockApi';
import { fetchExplore, fetchExplorePage, fetchFeed } from '../api/newsApi';
import { getAccessToken } from '../api/client';
import { getUserKeywords } from './userKeywordsStorage';

/** Production builds: no mock feed fallback (aligns with TRAKL production readiness). */
const allowMockFallback = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

function computeMatchedKeywords(topicKeywords = [], userKeywords = []) {
    const topics = topicKeywords.map((k) => String(k || '').toLowerCase());
    const matched = [];
    for (const kw of userKeywords) {
        const k = String(kw || '').toLowerCase();
        if (!k) continue;
        if (topics.some((t) => t.includes(k) || k.includes(t))) {
            if (!matched.includes(k)) matched.push(k);
        }
    }
    return matched.slice(0, 4);
}

export function mapApiItem(a, userKeywords = []) {
    const cred = a.credibility || {};
    const label = cred.label || cred.label_code;
    const labelStr = String(label ?? '').toLowerCase();
    const topicKeywords = a.topic_keywords || [];
    const matchedKeywords = computeMatchedKeywords(topicKeywords, userKeywords);
    const categoryLabel = matchedKeywords[0] || labelStr || 'news';
    return {
        id: a.id || a._id,
        source: a.source || a.source_key || '',
        canonical_url: a.canonical_url || a.url || '',
        url: a.url || a.canonical_url || '',
        time: a.published_at ? String(a.published_at).slice(0, 16) : '',
        title: a.title || '',
        excerpt: a.excerpt || a.summary || '',
        summary: a.summary || a.excerpt || '',
        content: a.content || a.full_content || '',
        fullContent: a.full_content || a.content || '',
        like_count: Number(a.like_count ?? a.upvotes ?? 0),
        dislike_count: Number(a.dislike_count ?? 0),
        upvotes: Number(a.like_count ?? a.upvotes ?? 0),
        readTime: 4,
        categories: matchedKeywords.length ? matchedKeywords : topicKeywords.slice(0, 3),
        category: categoryLabel,
        trending: cred.label_code === 2 || cred.label === 'suspicious',
        matchedKeywords,
        credibilityLabel: labelStr || null,
        isFake: labelStr === 'fake' || Number(cred.label_code) === 1,
        isLowCredibility:
            labelStr === 'fake' ||
            labelStr === 'suspicious' ||
            (typeof cred.max_prob === 'number' && cred.max_prob < 0.6),
        votes: 0,
        credibility: a.credibility,
        topic_keywords: topicKeywords,
    };
}

/**
 * @param {{ q?: string, mode?: 'user'|'explore' }} [options]
 * - mode=user: personalized feed (/api/user/feed)
 * - mode=explore: discovery feed (/api/user/explore)
 */
export async function loadFeedItems(options = {}) {
    const q = options.q || '';
    const mode = options.mode === 'explore' ? 'explore' : 'user';
    const token = await getAccessToken();
    if (token) {
        try {
            const userKeywords = await getUserKeywords();
            const json =
                mode === 'explore'
                    ? await fetchExplore(1000, q)
                    : await fetchFeed(80, q);
            return (json.results || []).map((a) => mapApiItem(a, userKeywords));
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

/**
 * Cursor-based Explore page loader for infinite scroll UIs.
 * @param {{ q?: string, cursor?: string, limit?: number }} options
 */
export async function loadExplorePage(options = {}) {
    const q = options.q || '';
    const cursor = options.cursor || '';
    const limit = Math.max(1, Number(options.limit || 30));
    const token = await getAccessToken();
    if (!token) {
        return { items: [], nextCursor: null, hasMore: false };
    }
    const userKeywords = await getUserKeywords();
    const json = await fetchExplorePage(limit, q, cursor);
    return {
        items: (json.results || []).map((a) => mapApiItem(a, userKeywords)),
        nextCursor: json.next_cursor || null,
        hasMore: Boolean(json.has_more),
    };
}

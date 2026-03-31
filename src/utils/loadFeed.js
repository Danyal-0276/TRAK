import { mockApi } from './Service/mockApi';
import { fetchFeed } from '../api/newsApi';
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
        id: a.id,
        source: a.source || 'TRAK',
        time: a.published_at ? String(a.published_at).slice(0, 16) : '',
        title: a.title || '',
        excerpt: a.excerpt || '',
        content: a.content || '',
        fullContent: a.content || '',
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
 * @param {{ q?: string }} [options] — optional search string for /feed/?q=
 */
export async function loadFeedItems(options = {}) {
    const q = options.q || '';
    const token = await getAccessToken();
    if (token) {
        try {
            const userKeywords = await getUserKeywords();
            const json = await fetchFeed(80, q);
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

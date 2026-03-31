import { USER_PREFIX } from '../config/api';
import { API_BASE } from '../config/api';
import { apiFetch } from './client';

export async function fetchFeed(limit = 50, q = '') {
    const params = new URLSearchParams({ limit: String(limit) });
    if (q && String(q).trim()) params.set('q', String(q).trim());
    const res = await apiFetch(`${USER_PREFIX}/feed/?${params}`, {}, API_BASE);
    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Feed ${res.status}`);
    }
    return res.json();
}

export async function fetchArticle(articleId) {
    const enc = encodeURIComponent(articleId);
    const res = await apiFetch(`${USER_PREFIX}/articles/${enc}/`, {}, API_BASE);
    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Article ${res.status}`);
    }
    return res.json();
}

export async function trackKeywords(keywords) {
    const res = await apiFetch(
        `${USER_PREFIX}/track-keywords/`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ keywords }),
        },
        API_BASE
    );
    if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `Keywords ${res.status}`);
    }
    return res.json();
}

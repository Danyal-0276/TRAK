import { toBookmarkCard } from './articleBookmarkController';

function profileBookmarksCacheKey(userId) {
  const id = userId != null ? String(userId) : 'guest';
  return `trak_profile_bookmarks_cache_v1_${id}`;
}

export function patchWebProfileBookmarksCache(articleId, isBookmarked, article, userId) {
  if (typeof window === 'undefined') return;
  const id = String(articleId || '').trim();
  if (!id) return;

  let uid = userId;
  if (uid == null) {
    try {
      const raw = window.localStorage.getItem('trak_user');
      if (raw) uid = JSON.parse(raw)?.id;
    } catch {
      uid = null;
    }
  }

  const key = profileBookmarksCacheKey(uid);
  let rows = [];
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) rows = parsed;
    }
  } catch {
    rows = [];
  }

  if (isBookmarked) {
    if (!rows.some((b) => String(b.id) === id)) {
      const card = toBookmarkCard(article) || { id, title: 'Saved article' };
      rows = [card, ...rows];
    }
  } else {
    rows = rows.filter((b) => String(b.id) !== id);
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(rows.slice(0, 20)));
  } catch {
    /* ignore */
  }
}

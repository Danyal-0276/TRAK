/** Merge API bookmark rows with feed rows for the home Bookmarks tab. */
export function buildBookmarksTabNews(newsData, bookmarkedItems, bookmarkTabItems, votedItems = {}) {
  const merged = new Map();
  const saved = bookmarkedItems || new Set();

  (bookmarkTabItems || []).forEach((item) => {
    const id = String(item.id);
    if (!saved.has(id)) return;
    merged.set(id, { ...item, isBookmarked: true });
  });

  (newsData || []).forEach((item) => {
    const id = String(item.id);
    if (!saved.has(id)) return;
    merged.set(id, {
      ...item,
      ...(merged.get(id) || {}),
      isBookmarked: true,
      userReaction: item.userReaction ?? merged.get(id)?.userReaction ?? votedItems[id] ?? null,
      like_count: item.like_count ?? merged.get(id)?.like_count,
      dislike_count: item.dislike_count ?? merged.get(id)?.dislike_count,
    });
  });

  return Array.from(merged.values());
}

export function patchBookmarkTabItems(setBookmarkTabItems, patch) {
  if (typeof setBookmarkTabItems !== 'function' || patch.isBookmarked === undefined) return;
  const id = String(patch.articleId || '').trim();
  if (!id) return;

  setBookmarkTabItems((prev) => {
    const rows = prev || [];
    if (patch.isBookmarked) {
      if (rows.some((n) => String(n.id) === id)) return rows;
      if (!patch.article) return rows;
      return [patch.article, ...rows];
    }
    const next = rows.filter((n) => String(n.id) !== id);
    return next.length === rows.length ? rows : next;
  });
}

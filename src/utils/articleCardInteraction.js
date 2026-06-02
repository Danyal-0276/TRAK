export function resolveCardArticleId(item, index = 0) {
  const id = String(item?.id || item?.canonical_url || item?.url || '').trim();
  return id || `news-${index}`;
}

export function resolveArticleVote(item, articleId, votedItems, userVote) {
  if (userVote !== undefined) return userVote;
  if (item?.userReaction !== undefined && item?.userReaction !== null) return item.userReaction;
  if (!votedItems || !articleId) return item?.userReaction ?? null;
  if (votedItems[articleId] !== undefined) return votedItems[articleId];
  const rawId = item?.id != null ? String(item.id) : '';
  return rawId && votedItems[rawId] !== undefined ? votedItems[rawId] : null;
}

export function resolveArticleBookmarked(item, articleId, bookmarkedItems, isBookmarked) {
  if (isBookmarked !== undefined) return isBookmarked;
  if (item?.isBookmarked !== undefined) return !!item.isBookmarked;
  if (!bookmarkedItems?.has || !articleId) return false;
  if (bookmarkedItems.has(articleId)) return true;
  const url = String(item?.canonical_url || item?.url || '').trim();
  if (url && bookmarkedItems.has(url)) return true;
  const rawId = item?.id != null ? String(item.id) : '';
  return rawId ? bookmarkedItems.has(rawId) : false;
}

/** Stamp interaction fields onto article rows (stable FlatList updates). */
export function stampArticleInteractions(articles, votedItems, bookmarkedItems) {
  if (!Array.isArray(articles) || !articles.length) return articles;
  return articles.map((n) => {
    const id = String(n?.id ?? '');
    const userReaction =
      votedItems?.[id] !== undefined ? votedItems[id] : n.userReaction ?? null;
    const isBookmarked =
      bookmarkedItems?.has?.(id) ||
      bookmarkedItems?.has?.(n.id) ||
      (n.canonical_url && bookmarkedItems?.has?.(n.canonical_url)) ||
      (n.url && bookmarkedItems?.has?.(n.url)) ||
      false;
    if (n.userReaction === userReaction && !!n.isBookmarked === isBookmarked) return n;
    return { ...n, userReaction, isBookmarked };
  });
}

import { addBookmark, removeBookmark } from './Service/api';
import { setBookmarkIds } from './bookmarksStorage';
import { emitArticleInteractionChange } from './articleInteractionEvents';
import { patchWebProfileBookmarksCache } from './profileBookmarkCache';
import { enqueuePerArticle } from './interactionQueue';

export function toBookmarkCard(article = {}) {
  const id = String(article.id || '').trim();
  if (!id) return null;
  return {
    id,
    title: article.title || 'Saved article',
    source: article.source || 'TRAK',
    excerpt: article.excerpt || article.description || article.summary || '',
    description: article.description || article.excerpt || '',
    content: article.content || article.fullContent || '',
    fullContent: article.fullContent || article.content || '',
    canonical_url: article.canonical_url || article.url || '',
    url: article.url || article.canonical_url || '',
    category: article.category || 'General',
    time: article.time || article.date || 'Recently',
    date: article.date || article.time || 'Recently',
    image: article.image || article.image_url,
    image_url: article.image_url || article.image,
    like_count: Number(article.like_count ?? article.upvotes ?? 0),
    dislike_count: Number(article.dislike_count ?? 0),
    upvotes: Number(article.like_count ?? article.upvotes ?? 0),
    isBookmarked: true,
    userReaction: article.userReaction || null,
  };
}

export function emitBookmarkToggle({ articleId, isBookmarked, article }) {
  const id = String(articleId || '').trim();
  if (!id) return;
  const card = isBookmarked && article ? toBookmarkCard(article) : undefined;
  emitArticleInteractionChange({
    articleId: id,
    isBookmarked,
    article: card || undefined,
  });
  patchWebProfileBookmarksCache(id, isBookmarked, card || article);
}

export function upsertArticleBookmarkInList(setNewsData, articleId, isBookmarked, article) {
  const id = String(articleId || '').trim();
  if (!id || typeof setNewsData !== 'function') return;
  setNewsData((prev) => {
    const rows = prev || [];
    const exists = rows.some((n) => String(n.id) === id);
    if (isBookmarked) {
      if (exists) {
        return rows.map((n) => (String(n.id) !== id ? n : { ...n, isBookmarked: true }));
      }
      const card = toBookmarkCard(article);
      if (!card) return rows;
      return [card, ...rows];
    }
    if (!exists) return rows;
    return rows.map((n) => (String(n.id) !== id ? n : { ...n, isBookmarked: false }));
  });
}

export function queueBookmarkApi(articleId, action, article) {
  const id = String(articleId || '').trim();
  if (!id) return Promise.resolve();
  return enqueuePerArticle(`bookmark:${id}`, async () => {
    if (action === 'remove') {
      await removeBookmark(id);
    } else {
      await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
    }
  });
}

export function applyOptimisticBookmarkToggle({
  articleId,
  article,
  setBookmarkedItems,
  setNewsData,
  onArticlesPatch,
  removeFromListOnUnbookmark = false,
}) {
  const id = String(articleId || '').trim();
  if (!id) return { wasBookmarked: false, isBookmarked: false };

  let wasBookmarked = false;
  setBookmarkedItems((prev) => {
    wasBookmarked = prev.has(id);
    const next = new Set([...prev].map(String));
    if (wasBookmarked) next.delete(id);
    else next.add(id);
    setBookmarkIds(Array.from(next));
    return next;
  });

  const isBookmarked = !wasBookmarked;
  if (setNewsData) upsertArticleBookmarkInList(setNewsData, id, isBookmarked, article);
  onArticlesPatch?.((prev) => {
    const rows = prev || [];
    const exists = rows.some((n) => String(n.id) === id);
    if (isBookmarked) {
      if (exists) {
        return rows.map((n) => (String(n.id) !== id ? n : { ...n, isBookmarked: true }));
      }
      const card = toBookmarkCard(article);
      return card ? [card, ...rows] : rows;
    }
    if (removeFromListOnUnbookmark) {
      return rows.filter((n) => String(n.id) !== id);
    }
    return rows.map((n) => (String(n.id) !== id ? n : { ...n, isBookmarked: false }));
  });

  emitBookmarkToggle({ articleId: id, isBookmarked, article });
  return { wasBookmarked, isBookmarked };
}

export function rollbackBookmarkToggle({
  articleId,
  wasBookmarked,
  article,
  setBookmarkedItems,
  setNewsData,
  onArticlesPatch,
}) {
  const id = String(articleId || '').trim();
  if (!id) return;

  setBookmarkedItems((prev) => {
    const next = new Set([...prev].map(String));
    if (wasBookmarked) next.add(id);
    else next.delete(id);
    setBookmarkIds(Array.from(next));
    return next;
  });

  if (setNewsData) upsertArticleBookmarkInList(setNewsData, id, wasBookmarked, article);
  onArticlesPatch?.((prev) =>
    (prev || []).map((n) => (String(n.id) !== id ? n : { ...n, isBookmarked: wasBookmarked })),
  );
  emitBookmarkToggle({ articleId: id, isBookmarked: wasBookmarked, article });
}

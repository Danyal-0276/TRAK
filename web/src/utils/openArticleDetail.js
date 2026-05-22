import { getUserArticleDetail } from './Service/api';
import { mapApiItem } from './loadFeed';
import { normalizeArticleForDetail } from './articleNavigation';

/**
 * Navigate to /article/:id with full article payload (fetches from API when possible).
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {object} article - list/card article object
 */
export async function openArticleDetail(navigate, article) {
  const aid = String(article?.id ?? article?.article_id ?? '').trim();
  if (!aid) return;

  const fallback = normalizeArticleForDetail({ ...article, id: aid });
  const hasBody = Boolean(
    fallback.fullContent?.trim() || fallback.content?.trim()
  );

  try {
    const full = await getUserArticleDetail(aid);
    const mapped = normalizeArticleForDetail(mapApiItem(full));
    navigate(`/article/${encodeURIComponent(aid)}`, {
      state: { article: { ...mapped, id: aid }, fetchError: '' },
    });
  } catch (err) {
    const msg = err?.message || 'Could not load this article from the API.';
    navigate(`/article/${encodeURIComponent(aid)}`, {
      state: {
        article: fallback,
        fetchError: hasBody ? '' : msg,
      },
    });
  }
}

import { normalizeArticleForDetail } from './articleNavigation';

/**
 * Navigate immediately to /article/:id with whatever card data is available.
 * ArticleDetailScreen handles the full content fetch with a skeleton loader.
 * @param {import('react-router-dom').NavigateFunction} navigate
 * @param {object} article - list/card article object
 */
export function openArticleDetail(navigate, article) {
  const aid = String(article?.id ?? article?.article_id ?? '').trim();
  if (!aid) return;

  const normalized = normalizeArticleForDetail({ ...article, id: aid });
  navigate(`/article/${encodeURIComponent(aid)}`, {
    state: { article: normalized, fetchError: '' },
  });
}

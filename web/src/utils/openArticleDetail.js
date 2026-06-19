import { normalizeArticleForDetail } from './articleNavigation';
import { getReactionMap } from './reactionsStorage';
import { getBookmarkIds } from './bookmarksStorage';
import { getRegisteredVote } from './articleVoteController';
import { flushFeedScrollBeforeNavigate } from './feedScrollBridge';

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
  const reactionMap = getReactionMap();
  const bookmarkIds = getBookmarkIds().map(String);
  const userReaction =
    getRegisteredVote(aid) ?? article?.userReaction ?? reactionMap[aid] ?? null;
  const isBookmarked = bookmarkIds.includes(aid) || Boolean(article?.isBookmarked);

  flushFeedScrollBeforeNavigate();

  navigate(`/article/${encodeURIComponent(aid)}`, {
    state: {
      article: {
        ...normalized,
        userReaction,
        isBookmarked,
        like_count: article?.like_count ?? article?.upvotes ?? normalized.like_count,
        dislike_count: article?.dislike_count ?? normalized.dislike_count,
      },
      fetchError: '',
    },
  });
}

import { getUserBootstrap } from './Service/api';
import { filterRealFeedItems, loadExplorePage, mapApiItem } from './loadFeed';
import { mergeReactionRows } from './reactionsStorage';
import { setUserKeywords } from './userKeywordsStorage';

/**
 * Single home load: keywords, feed page, bookmarks, reactions.
 */
export async function loadHomeBootstrap({ limit = 50 } = {}) {
  const data = await getUserBootstrap({ limit });
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];
  let feedMode = keywords.length > 0 ? 'feed' : 'explore';

  const feed = data?.feed || {};
  let items = filterRealFeedItems((feed.results || []).map((a) => mapApiItem(a, keywords)));
  let nextCursor = feed.next_cursor || '';
  let hasMore = Boolean(feed.has_more);

  if (!items.length) {
    try {
      const explore = await loadExplorePage({ limit, cursor: '' });
      if (explore.items?.length) {
        items = explore.items;
        nextCursor = explore.nextCursor || '';
        hasMore = Boolean(explore.hasMore);
        feedMode = 'explore';
      }
    } catch {
      /* keep empty */
    }
  }

  await setUserKeywords(keywords);

  const bookmarked = new Set(
    (data?.bookmarks?.results || []).map((b) => String(b.article_id))
  );
  const reactionMap = await mergeReactionRows(data?.reactions?.results || [], {
    replace: false,
  });

  return {
    keywords,
    items,
    nextCursor,
    hasMore,
    feedMode,
    bookmarked,
    reactionMap,
  };
}

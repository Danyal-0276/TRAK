import { getUserBootstrap, listBookmarks, listReactions } from './Service/api';
import { filterRealFeedItems, loadExplorePage, mapApiItem } from './loadFeed';
import { mergeReactionRows } from './reactionsStorage';
import { loadUserKeywords, setUserKeywords } from './userKeywordsStorage';

async function loadHomeBootstrapFallback({ limit = 50 } = {}) {
  const keywords = await loadUserKeywords().catch(() => []);
  const [explore, bookmarks, reactions] = await Promise.all([
    loadExplorePage({ limit, cursor: '' }).catch(() => ({
      items: [],
      nextCursor: '',
      hasMore: false,
    })),
    listBookmarks().catch(() => ({ results: [] })),
    listReactions().catch(() => ({ results: [] })),
  ]);

  const items = explore.items || [];
  const reactionMap = await mergeReactionRows(reactions.results || [], { replace: false });
  const bookmarked = new Set((bookmarks.results || []).map((b) => String(b.article_id)));

  return {
    keywords,
    items,
    nextCursor: explore.nextCursor || '',
    hasMore: Boolean(explore.hasMore),
    feedMode: keywords.length > 0 ? 'feed' : 'explore',
    bookmarked,
    reactionMap,
    bookmarkRows: bookmarks.results || [],
    reactionResults: reactions.results || [],
  };
}

/**
 * Single home load: keywords, feed page, bookmarks, reactions.
 */
export async function loadHomeBootstrap({ limit = 50 } = {}) {
  let data;
  try {
    data = await getUserBootstrap({ limit });
  } catch (err) {
    console.warn('Bootstrap unavailable, using explore fallback:', err?.message || err);
    return loadHomeBootstrapFallback({ limit });
  }

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
    bookmarkRows: data?.bookmarks?.results || [],
    reactionResults: data?.reactions?.results || [],
  };
}

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  addBookmark,
  listBookmarks,
  listReactions,
  removeBookmark,
  setReaction,
} from '../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../utils/bookmarksStorage';
import { mergeReactionRows, setReactionForArticle } from '../utils/reactionsStorage';

const SYNC_COOLDOWN_MS = 45000;

/**
 * Fast optimistic like/dislike/bookmark with throttled server sync.
 */
export function useArticleInteractions({ articles = [], onArticlesPatch, autoSync = true } = {}) {
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [votedItems, setVotedItems] = useState({});
  const lastSyncRef = useRef(0);
  const voteQueueRef = useRef({});

  const syncFromServer = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (!force && now - lastSyncRef.current < SYNC_COOLDOWN_MS) {
        return { bookmarkIds: Array.from(bookmarkedItems), reactionMap: votedItems };
      }
      lastSyncRef.current = now;

      const [bmRes, reactRes] = await Promise.all([
        listBookmarks().catch(() => ({ results: [] })),
        listReactions().catch(() => ({ results: [] })),
      ]);
      const ids = (bmRes.results || []).map((b) => String(b.article_id));
      setBookmarkedItems(new Set(ids));
      setBookmarkIds(ids).catch(() => {});

      const reactionMap = await mergeReactionRows(reactRes.results || [], { replace: false }).catch(() => ({}));
      setVotedItems(reactionMap);
      onArticlesPatch?.((prev) =>
        (prev || []).map((n) => ({
          ...n,
          userReaction: reactionMap[String(n.id)] || null,
        }))
      );
      return { bookmarkIds: ids, reactionMap };
    },
    [onArticlesPatch]
  );

  useEffect(() => {
    if (!autoSync) return;
    (async () => {
      const cached = await getBookmarkIds().catch(() => []);
      if (cached.length) setBookmarkedItems(new Set(cached.map(String)));
      await syncFromServer(true);
    })();
  }, [autoSync, syncFromServer]);

  const handleVote = useCallback(
    async (itemId, type) => {
      const id = String(itemId);
      let newVote = null;
      let previousVote = null;

      setVotedItems((prev) => {
        previousVote = prev[id] ?? null;
        newVote = previousVote === type ? null : type;
        return { ...prev, [id]: newVote };
      });

      const article = articles.find((n) => String(n.id) === id);
      const prevLikes = Number(article?.like_count ?? article?.upvotes ?? 0);
      const prevDislikes = Number(article?.dislike_count ?? 0);
      let optLikes = prevLikes;
      let optDislikes = prevDislikes;
      if (previousVote === 'up') optLikes -= 1;
      if (previousVote === 'down') optDislikes -= 1;
      if (newVote === 'up') optLikes += 1;
      if (newVote === 'down') optDislikes += 1;

      onArticlesPatch?.((prev) =>
        (prev || []).map((n) =>
          String(n.id) !== id
            ? n
            : {
                ...n,
                like_count: Math.max(0, optLikes),
                dislike_count: Math.max(0, optDislikes),
                upvotes: Math.max(0, optLikes),
                userReaction: newVote,
              }
        )
      );

      setReactionForArticle(id, newVote).catch(() => {});

      if (voteQueueRef.current[id]) clearTimeout(voteQueueRef.current[id]);
      voteQueueRef.current[id] = setTimeout(async () => {
        delete voteQueueRef.current[id];
        try {
          const data = await setReaction(
            id,
            newVote === 'up' ? 'like' : newVote === 'down' ? 'dislike' : 'none'
          );
          const likes = Number(data.like_count ?? optLikes);
          const dislikes = Number(data.dislike_count ?? optDislikes);
          onArticlesPatch?.((prev) =>
            (prev || []).map((n) =>
              String(n.id) !== id
                ? n
                : {
                    ...n,
                    like_count: likes,
                    dislike_count: dislikes,
                    upvotes: likes,
                    userReaction: newVote,
                  }
            )
          );
        } catch {
          setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
          setReactionForArticle(id, previousVote || null).catch(() => {});
        }
      }, 280);
    },
    [articles, onArticlesPatch]
  );

  const handleBookmark = useCallback(
    async (itemId) => {
      const id = String(itemId);
      let wasBookmarked = false;
      setBookmarkedItems((prev) => {
        wasBookmarked = prev.has(id);
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setBookmarkIds(Array.from(next)).catch(() => {});
        return next;
      });

      const article = articles.find((n) => String(n.id) === id);
      try {
        if (wasBookmarked) await removeBookmark(id);
        else await addBookmark(id, article?.title || '', article?.canonical_url || article?.url || '');
      } catch {
        setBookmarkedItems((prev) => {
          const rollback = new Set(prev);
          if (rollback.has(id)) rollback.delete(id);
          else rollback.add(id);
          setBookmarkIds(Array.from(rollback)).catch(() => {});
          return rollback;
        });
      }
    },
    [articles]
  );

  return {
    bookmarkedItems,
    votedItems,
    setBookmarkedItems,
    setVotedItems,
    syncFromServer,
    handleVote,
    handleBookmark,
  };
}

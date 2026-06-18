import { useState, useCallback, useEffect, useRef } from 'react';
import {
  listBookmarks,
  listReactions,
  setReaction,
} from '../utils/Service/api';
import { getBookmarkIds, setBookmarkIds } from '../utils/bookmarksStorage';
import { mergeReactionRows, setReactionForArticle } from '../utils/reactionsStorage';
import { useFeedback } from '../components/ui/FeedbackProvider';
import { patchArticleVoteRow } from '../utils/reactionVote';
import {
  emitArticleInteractionChange,
  subscribeArticleInteractionChange,
  applyArticleInteractionPatch,
} from '../utils/articleInteractionEvents';
import {
  toggleVoteRegistered,
  scheduleVotePersist,
  seedVoteRegistry,
  setRegisteredVote,
} from '../utils/articleVoteController';
import {
  applyOptimisticBookmarkToggle,
  queueBookmarkApi,
  rollbackBookmarkToggle,
} from '../utils/articleBookmarkController';

const SYNC_COOLDOWN_MS = 8000;

/**
 * Fast optimistic like/dislike/bookmark with throttled server sync.
 */
export function useArticleInteractions({ articles = [], onArticlesPatch, autoSync = true } = {}) {
  const feedback = useFeedback();
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  const [votedItems, setVotedItems] = useState({});
  const lastSyncRef = useRef(0);
  const articlesRef = useRef(articles);
  articlesRef.current = articles;

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

      const reactionMap = await mergeReactionRows(reactRes.results || [], { replace: true }).catch(() => ({}));
      setVotedItems(reactionMap);
      seedVoteRegistry(reactionMap);
      const idSet = new Set(ids);
      onArticlesPatch?.((prev) =>
        (prev || []).map((n) => {
          const nid = String(n.id);
          const userReaction = reactionMap[nid] || null;
          const isBookmarked = idSet.has(nid);
          if (n.userReaction === userReaction && !!n.isBookmarked === isBookmarked) return n;
          return { ...n, userReaction, isBookmarked };
        })
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

  useEffect(() => {
    return subscribeArticleInteractionChange((patch) => {
      applyArticleInteractionPatch(patch, {
        setVotedItems,
        setBookmarkedItems,
        onArticlesPatch,
      });
      if (patch.userReaction !== undefined) {
        setRegisteredVote(patch.articleId, patch.userReaction);
      }
    });
  }, [onArticlesPatch]);

  const handleVote = useCallback(
    (itemId, type) => {
      const id = String(itemId || '').trim();
      if (!id) return;

      const { previousVote, newVote, changed } = toggleVoteRegistered(id, type);
      if (!changed) return;
      setVotedItems((prev) => ({ ...prev, [id]: newVote }));

      const articleRow = articlesRef.current.find((n) => String(n.id) === id) || {};
      const optimistic = patchArticleVoteRow(articleRow, previousVote, newVote);

      onArticlesPatch?.((prev) =>
        (prev || []).map((n) => (String(n.id) !== id ? n : optimistic))
      );

      setReactionForArticle(id, newVote).catch(() => {});
      emitArticleInteractionChange({
        articleId: id,
        userReaction: newVote,
        like_count: optimistic.like_count,
        dislike_count: optimistic.dislike_count,
      });

      scheduleVotePersist(id, {
        persist: (articleId, apiValue) => setReaction(articleId, apiValue),
        onReconcile: (data, vote) => {
          const likes = Number(data.like_count ?? 0);
          const dislikes = Number(data.dislike_count ?? 0);
          onArticlesPatch?.((prev) =>
            (prev || []).map((n) =>
              String(n.id) !== id
                ? n
                : {
                    ...n,
                    like_count: likes,
                    dislike_count: dislikes,
                    upvotes: likes,
                    userReaction: vote,
                  }
            )
          );
          emitArticleInteractionChange({
            articleId: id,
            userReaction: vote,
            like_count: likes,
            dislike_count: dislikes,
          });
        },
        onRollback: (err, failedVote) => {
          setRegisteredVote(id, previousVote);
          setVotedItems((prev) => ({ ...prev, [id]: previousVote }));
          setReactionForArticle(id, previousVote || null).catch(() => {});
          const rollback = patchArticleVoteRow(optimistic, failedVote, previousVote);
          onArticlesPatch?.((prev) =>
            (prev || []).map((n) => (String(n.id) !== id ? n : rollback))
          );
          emitArticleInteractionChange({
            articleId: id,
            userReaction: previousVote,
            like_count: rollback.like_count,
            dislike_count: rollback.dislike_count,
          });
          feedback?.error?.(err?.message || 'Could not save reaction');
        },
      });
    },
    [onArticlesPatch, feedback]
  );

  const handleBookmark = useCallback(
    (itemId) => {
      const id = String(itemId || '').trim();
      if (!id) return;
      const article = articlesRef.current.find((n) => String(n.id) === id);
      const { wasBookmarked } = applyOptimisticBookmarkToggle({
        articleId: id,
        article,
        setBookmarkedItems,
        onArticlesPatch,
      });

      queueBookmarkApi(id, wasBookmarked ? 'remove' : 'add', article).catch((err) => {
        rollbackBookmarkToggle({
          articleId: id,
          wasBookmarked,
          article,
          setBookmarkedItems,
          onArticlesPatch,
        });
        feedback?.error?.(err?.message || 'Could not update bookmark');
      });
    },
    [onArticlesPatch, feedback]
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

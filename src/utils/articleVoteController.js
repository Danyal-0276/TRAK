import { enqueuePerArticle } from './interactionQueue';
import { reactionApiValue, redditVoteTransition } from './reactionVote';

const voteByArticle = {};
const countsByArticle = {};
const debounceTimers = {};

/** Toggle vote in the registry (source of truth during rapid taps). */
export function toggleVoteRegistered(articleId, type) {
  const id = String(articleId || '').trim();
  if (!id) return { previousVote: null, newVote: null, changed: false };
  const previousVote = voteByArticle[id] ?? null;
  const { newVote, changed } = redditVoteTransition(previousVote, type);
  if (changed) voteByArticle[id] = newVote;
  return { previousVote, newVote, changed };
}

export function getRegisteredVote(articleId) {
  const id = String(articleId || '').trim();
  return id ? voteByArticle[id] ?? null : null;
}

export function isVoteRegistered(articleId) {
  const id = String(articleId || '').trim();
  return id ? Object.prototype.hasOwnProperty.call(voteByArticle, id) : false;
}

export function hasPendingVotePersist(articleId) {
  const id = String(articleId || '').trim();
  return Boolean(id && debounceTimers[id]);
}

export function setRegisteredVote(articleId, vote) {
  const id = String(articleId || '').trim();
  if (!id) return;
  voteByArticle[id] = vote;
}

export function seedVoteRegistry(reactionMap = {}) {
  Object.entries(reactionMap || {}).forEach(([id, vote]) => {
    if (vote === 'up' || vote === 'down') voteByArticle[String(id)] = vote;
  });
}

export function setRegisteredCounts(articleId, likeCount, dislikeCount) {
  const id = String(articleId || '').trim();
  if (!id) return;
  if (likeCount === undefined && dislikeCount === undefined) return;
  const prev = countsByArticle[id] || {};
  countsByArticle[id] = {
    like_count: likeCount !== undefined ? Number(likeCount) : Number(prev.like_count ?? 0),
    dislike_count: dislikeCount !== undefined ? Number(dislikeCount) : Number(prev.dislike_count ?? 0),
  };
}

export function getRegisteredCounts(articleId) {
  const id = String(articleId || '').trim();
  return id ? countsByArticle[id] ?? null : null;
}

/**
 * Debounce API persistence; always sends the latest registered vote for the article.
 */
export function scheduleVotePersist(articleId, { debounceMs = 280, persist, onReconcile, onRollback } = {}) {
  const id = String(articleId || '').trim();
  if (!id || typeof persist !== 'function') return;

  if (debounceTimers[id]) clearTimeout(debounceTimers[id]);
  debounceTimers[id] = setTimeout(() => {
    delete debounceTimers[id];
    const voteToSend = getRegisteredVote(id);
    enqueuePerArticle(`vote:${id}`, async () => {
      try {
        const data = await persist(id, reactionApiValue(voteToSend));
        onReconcile?.(data, voteToSend);
      } catch (err) {
        onRollback?.(err, voteToSend);
      }
    });
  }, debounceMs);
}

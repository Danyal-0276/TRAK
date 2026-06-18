import { enqueuePerArticle } from './interactionQueue';
import { reactionApiValue, redditVoteTransition } from './reactionVote';

const voteByArticle = {};
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

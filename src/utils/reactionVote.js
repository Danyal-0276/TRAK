/** Optimistic like/dislike count math for instant UI feedback. */
export function computeOptimisticReactionCounts(
  likeCount,
  dislikeCount,
  previousVote,
  newVote
) {
  let likes = Number(likeCount) || 0;
  let dislikes = Number(dislikeCount) || 0;
  if (previousVote === 'up') likes -= 1;
  if (previousVote === 'down') dislikes -= 1;
  if (newVote === 'up') likes += 1;
  if (newVote === 'down') dislikes += 1;
  const safeLikes = Math.max(0, likes);
  return {
    like_count: safeLikes,
    dislike_count: Math.max(0, dislikes),
    upvotes: safeLikes,
  };
}

export function redditVoteTransition(previousVote, type) {
  if (type !== 'up' && type !== 'down') {
    return { previousVote, newVote: previousVote, changed: false };
  }
  if (previousVote === type) {
    return { previousVote, newVote: type, changed: false };
  }
  return { previousVote, newVote: type, changed: true };
}

export function reactionApiValue(newVote) {
  if (newVote === 'up') return 'like';
  if (newVote === 'down') return 'dislike';
  return 'none';
}

/** Patch a single article row after a vote. */
export function patchArticleVoteRow(article, previousVote, newVote) {
  const counts = computeOptimisticReactionCounts(
    article?.like_count ?? article?.upvotes,
    article?.dislike_count,
    previousVote,
    newVote
  );
  return { ...article, ...counts, userReaction: newVote };
}

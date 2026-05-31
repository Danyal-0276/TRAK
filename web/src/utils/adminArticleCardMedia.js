/** Clamp card media aspect ratio (Reddit-style feed bounds). */
export const CARD_MEDIA_MIN_RATIO = 0.75;
export const CARD_MEDIA_MAX_RATIO = 1.91;

export function clampCardAspectRatio(width, height) {
  const w = Number(width) || 1;
  const h = Number(height) || 1;
  const ratio = w / h;
  if (ratio < CARD_MEDIA_MIN_RATIO) return CARD_MEDIA_MIN_RATIO;
  if (ratio > CARD_MEDIA_MAX_RATIO) return CARD_MEDIA_MAX_RATIO;
  return ratio;
}

export function cardMediaStyleFromDimensions(width, height, { maxHeight = 320 } = {}) {
  const aspectRatio = clampCardAspectRatio(width, height);
  return {
    width: '100%',
    aspectRatio: String(aspectRatio),
    maxHeight,
    objectFit: 'cover',
  };
}

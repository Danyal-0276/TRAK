import { USER_PREFIX } from '../config/api';

/** Resolve hero image URL from API / card item shapes. */
export function resolveArticleImageUrl(item) {
  if (!item) return '';
  const url = item.image_url || item.image || item.thumbnail_url || '';
  return String(url).trim();
}

export function getUserArticleImageProxyUrl(imageUrl) {
  if (!imageUrl) return '';
  const params = new URLSearchParams({ url: String(imageUrl) });
  return `${USER_PREFIX}/articles/image-proxy/?${params.toString()}`;
}

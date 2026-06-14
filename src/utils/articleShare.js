import { Platform, Share } from 'react-native';
import { PUBLIC_WEB_ORIGIN } from '../config/publicWebOrigin';

function isExternalUrl(value) {
  return /^https?:\/\//i.test(String(value || '').trim());
}

export function getArticleId(item) {
  const raw = String(item?.id || item?.article_id || item?._id || '').trim();
  if (!raw || isExternalUrl(raw) || raw.startsWith('news-')) return '';
  return raw;
}

/** Ensure share/export use the TRAK article id, not an external source URL. */
export function normalizeShareArticle(item, articleId) {
  const candidates = [articleId, item?.id, item?.article_id, item?._id];
  for (const candidate of candidates) {
    const id = String(candidate || '').trim();
    if (!id || id.startsWith('news-') || isExternalUrl(id)) continue;
    return { ...(item || {}), id };
  }
  return { ...(item || {}) };
}

/** HTTPS link — opens TRAK web or native app when installed (universal / app links). */
export function buildArticleShareUrl(item) {
  const id = getArticleId(item);
  if (!id) return PUBLIC_WEB_ORIGIN;
  return `${PUBLIC_WEB_ORIGIN}/article/${encodeURIComponent(id)}`;
}

export function buildArticleSharePayload(item) {
  const title = String(item?.title || 'Article on TRAK').trim();
  const url = buildArticleShareUrl(item);
  const summary = String(item?.summary || item?.excerpt || item?.description || '').trim();
  const message = summary
    ? `${title}\n\n${summary.slice(0, 220)}${summary.length > 220 ? '…' : ''}\n\nRead on TRAK: ${url}`
    : `${title}\n\nRead on TRAK (sign in to view the full story): ${url}`;
  return { title, url, message };
}

export async function shareArticleLink(item, articleId) {
  const shareItem = normalizeShareArticle(item, articleId);
  const { title, url, message } = buildArticleSharePayload(shareItem);
  try {
    await Share.share({
      title,
      message: Platform.OS === 'android' ? message : message,
      url: Platform.OS === 'ios' ? url : undefined,
    });
    return { ok: true };
  } catch {
    return { ok: false, cancelled: true };
  }
}

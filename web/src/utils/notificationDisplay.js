export function formatSourceName(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

function sourceFromUrl(url) {
  if (!url) return '';
  const str = String(url).trim();
  const match = str.match(/^(?:https?:\/\/)?(?:www\.)?([^/?#]+)/i);
  if (!match) return '';
  const part = (match[1] || '').split('.')[0] || '';
  return formatSourceName(part);
}

export function isArticleKeywordNotification(notification) {
  if (!notification || typeof notification !== 'object') return false;
  const type = notification.type;
  return (
    type === 'keyword_match'
    || type === 'keyword'
    || Boolean(notification.meta?.article_id)
  );
}

export function getNotificationSourceName(notification) {
  if (!notification || typeof notification !== 'object') return 'TRAK';

  const meta = notification.meta || {};
  const raw = meta.source || meta.source_key;
  if (raw) return formatSourceName(raw);

  const fromUrl = sourceFromUrl(meta.canonical_url);
  if (fromUrl) return fromUrl;

  if (notification.sourceName) return notification.sourceName;

  if (isArticleKeywordNotification(notification)) {
    return notification.user && notification.user !== 'TRAK' ? notification.user : 'Source';
  }

  return notification.user || 'TRAK';
}

export function getNotificationSourceInitial(notification) {
  const name = getNotificationSourceName(notification);
  const letter = String(name || 'S').trim().charAt(0);
  return letter ? letter.toUpperCase() : 'S';
}

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

export function isArticleKeywordNotification(item) {
  if (!item || typeof item !== 'object') return false;
  const type = item.type;
  return (
    type === 'keyword_match'
    || type === 'keyword'
    || Boolean(item.meta?.article_id)
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

export function getNotificationTypeLabel(type) {
  const labels = {
    mention: 'Mention',
    keyword: 'Keyword Alert',
    keyword_match: 'Keyword Alert',
    like: 'Like',
    comment: 'Comment',
    follow: 'New Follower',
    system: 'System',
    welcome_back: 'Welcome back',
  };
  return labels[type] || 'Notification';
}

export function getNotificationIconColor(type) {
  switch (type) {
    case 'mention':
      return '#FF6B6B';
    case 'keyword':
    case 'keyword_match':
      return '#4ECDC4';
    case 'like':
      return '#FF9A8B';
    case 'comment':
      return '#A78BFA';
    case 'follow':
      return '#60A5FA';
    case 'system':
      return '#F59E0B';
    case 'welcome_back':
      return '#34D399';
    default:
      return '#6B7280';
  }
}

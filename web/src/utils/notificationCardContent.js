import {
  getNotificationSourceName,
  getNotificationTypeLabel,
  isArticleKeywordNotification,
} from './notificationDisplay';

export function getMatchedKeyword(notification) {
  const raw = notification?.keyword || notification?.meta?.matched_keyword || '';
  const kw = String(raw).trim();
  return kw || null;
}

export function getSourceFaviconUrl(notification) {
  const url = notification?.meta?.canonical_url;
  if (!url) return null;
  try {
    const normalized = String(url).trim();
    const parsed = new URL(normalized.includes('://') ? normalized : `https://${normalized}`);
    const host = parsed.hostname;
    if (!host) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return null;
  }
}

function extractTitleFromAlertText(text) {
  const str = String(text || '').trim();
  if (!str) return '';
  const colon = str.indexOf(': ');
  if (colon >= 0 && colon < str.length - 2) {
    return str.slice(colon + 2).trim();
  }
  return str;
}

export function getNotificationCardContent(notification) {
  const isKeyword = isArticleKeywordNotification(notification);
  const keyword = getMatchedKeyword(notification);
  const postTitle =
    notification?.postTitle ||
    notification?.meta?.post_title ||
    extractTitleFromAlertText(notification?.text);
  const sourceName = getNotificationSourceName(notification);
  const time = notification?.time || '';

  if (isKeyword) {
    const isTopics = keyword === 'your topics';
    return {
      kind: 'keyword',
      headline: isTopics ? 'Your topics' : keyword,
      headlinePrefix: isTopics ? null : '#',
      title: postTitle || 'New article',
      meta: sourceName && !['TRAK', 'Source'].includes(sourceName) ? sourceName : null,
      time,
    };
  }

  return {
    kind: 'generic',
    headline: getNotificationTypeLabel(notification?.type),
    headlinePrefix: null,
    title: notification?.text || '',
    meta: null,
    time,
  };
}

export const NOTIFICATION_MCI_ICONS = {
  mention: 'at',
  keyword: 'tag-outline',
  keyword_match: 'newspaper-variant-outline',
  like: 'heart-outline',
  comment: 'comment-outline',
  follow: 'account-plus-outline',
  system: 'bell-outline',
  welcome_back: 'hand-wave-outline',
};

export function getNotificationMciIcon(type) {
  return NOTIFICATION_MCI_ICONS[type] || 'bell-outline';
}

export const NOTIFICATION_MCI_COLORS = {
  mention: '#E11D48',
  keyword: '#0D9488',
  keyword_match: '#0D9488',
  like: '#F97316',
  comment: '#8B5CF6',
  follow: '#3B82F6',
  system: '#D97706',
  welcome_back: '#10B981',
};

export function getNotificationMciColor(type) {
  return NOTIFICATION_MCI_COLORS[type] || '#64748B';
}

/** Google Material Icons CDN glyph name for web fallback avatars. */
export function getMaterialIconGlyph(type) {
  const map = {
    mention: 'alternate_email',
    keyword: 'sell',
    keyword_match: 'newspaper',
    like: 'favorite_border',
    comment: 'chat_bubble_outline',
    follow: 'person_add',
    system: 'notifications_none',
    welcome_back: 'waving_hand',
  };
  return map[type] || 'notifications_none';
}

export function getMaterialIconColor(type) {
  return getNotificationMciColor(type);
}

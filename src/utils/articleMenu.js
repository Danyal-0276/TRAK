import { Linking, Platform, Share } from 'react-native';

function articleExportPayload(item) {
  return {
    id: item?.id,
    title: item?.title,
    source: item?.source,
    category: item?.category,
    url: item?.canonical_url || item?.url,
    excerpt: item?.excerpt || item?.description,
    summary: item?.summary,
    topic_keywords: item?.topic_keywords,
    credibility: item?.credibility || item?.credibilityLabel,
    published_at: item?.published_at || item?.time,
  };
}

export async function exportArticle(item) {
  const json = JSON.stringify(articleExportPayload(item), null, 2);
  const title = String(item?.title || 'Article');
  try {
    await Share.share({
      title: `Export: ${title}`,
      message: json,
    });
  } catch (_) {
    /* dismissed */
  }
}

export async function shareArticle(item) {
  const title = String(item?.title || 'Article');
  const url = item?.canonical_url || item?.url || '';
  try {
    await Share.share({
      title,
      message: url ? `${title}\n${url}` : title,
      url: Platform.OS === 'ios' ? url : undefined,
    });
  } catch (_) {
    /* dismissed */
  }
}

/** @param {object} feedback - useFeedback() result */
export function openArticleMenu(item, feedback, options = {}) {
  const { onOpenFeedback } = options;
  const id = item?.id != null ? String(item.id) : '';
  const url = item?.canonical_url || item?.url || '';
  const title = String(item?.title || 'Article options');

  return feedback.showActionSheet({
    title: title.length > 56 ? `${title.slice(0, 53)}…` : title,
    message: 'Choose an action',
    actions: [
      {
        label: 'Share',
        onPress: () => shareArticle(item),
      },
      ...(url
        ? [
            {
              label: 'Open original',
              onPress: () => Linking.openURL(url).catch(() => {}),
            },
          ]
        : []),
      {
        label: 'Export',
        onPress: () => exportArticle(item),
      },
      {
        label: 'Report or give feedback',
        destructive: true,
        onPress: () => {
          if (onOpenFeedback) {
            onOpenFeedback(item);
          }
        },
      },
    ],
  });
}

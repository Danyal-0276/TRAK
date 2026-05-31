import { Linking, Platform, Share } from 'react-native';

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

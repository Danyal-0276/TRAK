import { Platform, Share } from 'react-native';
import { submitArticleReport } from '../api/newsApi';

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
export function openArticleMenu(item, feedback) {
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
      {
        label: 'Report article',
        destructive: true,
        onPress: async () => {
          await submitArticleReport({
            article_id: id,
            url,
            reason: 'user_report',
          });
          feedback.success('Report submitted. Thank you.');
        },
      },
    ],
  });
}

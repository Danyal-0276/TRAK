import { Linking, Share } from 'react-native';
import { exportArticlePdf } from './articlePdfExport';
import { shareArticleLink } from './articleShare';

export async function exportArticle(item, feedback) {
  try {
    await exportArticlePdf(item);
    if (feedback?.success) {
      feedback.success('PDF saved — opening now.');
    }
    return { ok: true };
  } catch (err) {
    if (feedback?.error) {
      feedback.error(err?.message || 'Could not export PDF. Please try again.');
    }
    return { ok: false };
  }
}

export async function shareArticle(item, articleId) {
  await shareArticleLink(item, articleId);
}

/** @param {object} feedback - useFeedback() result */
export function openArticleMenu(item, feedback, options = {}) {
  const { onOpenFeedback, articleId } = options;
  const url = item?.canonical_url || item?.url || '';
  const title = String(item?.title || 'Article options');

  return feedback.showActionSheet({
    title: title.length > 56 ? `${title.slice(0, 53)}…` : title,
    message: 'Choose an action',
    actions: [
      {
        label: 'Share TRAK link',
        onPress: () => shareArticle(item, articleId),
      },
      ...(url
        ? [
            {
              label: 'Open original source',
              onPress: () => Linking.openURL(url).catch(() => {}),
            },
          ]
        : []),
      {
        label: 'Export PDF',
        onPress: () => exportArticle(item, feedback),
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

/**
 * Navigate to article detail when user opens a push notification.
 */

let navigationRef = null;

export function setPushNavigationRef(ref) {
  navigationRef = ref;
}

function extractArticleId(data) {
  if (!data) return null;
  const id = data.article_id || data.meta?.article_id;
  return id ? String(id) : null;
}

export function navigateFromPushData(data) {
  const articleId = extractArticleId(data);
  if (!articleId || !navigationRef?.isReady?.()) return false;
  navigationRef.navigate('NewsFeed', {
    screen: 'ArticleDetail',
    params: { articleId },
  });
  return true;
}

export async function bindPushNotificationNavigation() {
  try {
    const messaging = require('@react-native-firebase/messaging').default;
    const initial = await messaging().getInitialNotification();
    if (initial?.data) {
      setTimeout(() => navigateFromPushData(initial.data), 500);
    }
    messaging().onNotificationOpenedApp((remoteMessage) => {
      if (remoteMessage?.data) {
        navigateFromPushData(remoteMessage.data);
      }
    });
    return true;
  } catch {
    return false;
  }
}

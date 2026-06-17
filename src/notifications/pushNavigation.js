/**
 * Navigate to article detail when user opens a push notification.
 */

import { navigateToArticleDetailFromRoot } from '../utils/articleNavigation';

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
  if (!articleId) return false;
  return navigateToArticleDetailFromRoot(navigationRef, articleId, 'Notifications');
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

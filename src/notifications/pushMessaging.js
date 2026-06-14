/**
 * Foreground FCM: refresh in-app notifications when a keyword alert arrives while TRAK is open.
 * System tray banners when the app is backgrounded/killed are handled by FCM + Android/iOS.
 */

import { Platform } from 'react-native';
import { dispatchNotificationsRefresh } from '../utils/userNotificationsEvents';

function tryFcmMessaging() {
  try {
    // eslint-disable-next-line global-require, import/no-unresolved
    const messaging = require('@react-native-firebase/messaging').default;
    return messaging;
  } catch {
    return null;
  }
}

/**
 * @returns {(() => void) | undefined} unsubscribe
 */
export function bindForegroundPushMessaging() {
  const messaging = tryFcmMessaging();
  if (!messaging) return undefined;

  if (Platform.OS === 'ios') {
    messaging().setForegroundNotificationPresentationOptions({
      alert: true,
      badge: true,
      sound: true,
    });
  }

  return messaging().onMessage(async () => {
    dispatchNotificationsRefresh();
  });
}

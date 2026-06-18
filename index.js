/**
 * Gesture handler MUST be the first import (release builds break swipe-back otherwise).
 * @format
 */
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

enableScreens(true);

try {
  // Required for data-only FCM messages when the app is backgrounded/killed.
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async () => {
    // Notification payload messages are shown by the OS; this handler covers data-only alerts.
  });
} catch {
  // @react-native-firebase/messaging not linked in this build.
}

AppRegistry.registerComponent(appName, () => App);

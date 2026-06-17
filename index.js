import 'react-native-reanimated';
/**
 * @format
 */

// Firebase is lazy-loaded in src/auth/googleSignIn.js and src/api/pushToken.js
// so Metro can bundle without crashing if a package is missing from node_modules.

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

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

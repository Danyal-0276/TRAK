import 'react-native-reanimated';
/**
 * @format
 */

// Registers Firebase modules on the default app (required for Google sign-in).
import '@react-native-firebase/app';
import '@react-native-firebase/auth';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';



AppRegistry.registerComponent(appName, () => App);

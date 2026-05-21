import 'react-native-reanimated';
/**
 * @format
 */

// Firebase is lazy-loaded in src/auth/googleSignIn.js and src/api/pushToken.js
// so Metro can bundle without crashing if a package is missing from node_modules.

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';



AppRegistry.registerComponent(appName, () => App);

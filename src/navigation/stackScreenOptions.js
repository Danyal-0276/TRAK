import { Platform } from 'react-native';

/**
 * Native-stack defaults: iOS edge-swipe back; Android uses system/predictive back via BackHandler.
 * freezeOnBlur is disabled so release builds don't freeze screens mid-gesture.
 */
export const defaultStackScreenOptions = {
  headerShown: false,
  gestureEnabled: true,
  fullScreenGestureEnabled: Platform.OS === 'ios',
  animation: 'slide_from_right',
  freezeOnBlur: false,
  ...(Platform.OS === 'ios' ? { gestureResponseDistance: 48 } : {}),
};

export const articleDetailScreenOptions = {
  ...defaultStackScreenOptions,
  presentation: 'card',
  fullScreenGestureEnabled: true,
  gestureResponseDistance: 56,
};

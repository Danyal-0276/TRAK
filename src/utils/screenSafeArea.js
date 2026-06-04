import { Platform, StatusBar } from 'react-native';

/**
 * Reliable top inset (notch/status bar). SafeAreaView alone can report 0 on some Android builds.
 */
export function resolveTopInset(insets, extra = 0) {
  const fromSafeArea = insets?.top ?? 0;
  const fromStatusBar =
    Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0;
  return Math.max(fromSafeArea, fromStatusBar) + extra;
}

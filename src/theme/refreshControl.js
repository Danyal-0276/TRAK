import { Platform } from 'react-native';

/**
 * Pull-to-refresh colors that stay visible in light and dark mode.
 * Android needs progressBackgroundColor or the spinner circle blends into the page.
 */
export function getRefreshControlProps(colors, mode = 'light', overrides = {}) {
  const isDark = mode === 'dark';
  const spinner = isDark ? colors.textPrimary || colors.primary : colors.primary;
  const circleBg =
    colors.surfaceElevated ?? colors.surface ?? colors.backgroundSecondary ?? colors.background;

  const base = {
    tintColor: spinner,
  };

  if (Platform.OS === 'android') {
    base.colors = [spinner];
    base.progressBackgroundColor = circleBg;
  }

  return { ...base, ...overrides };
}

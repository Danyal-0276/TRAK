/**
 * Shared neutral page/card chrome for user app + admin (web).
 * Semantic accents (primary black/grey, status colors) stay in lightColors/darkColors.
 */

export const LIGHT_CHROME = {
  sidebar: '#ffffff',
  background: '#f5f5f5',
  backgroundSecondary: '#f8fafc',
  backgroundTertiary: '#ebebeb',
  backgroundElevated: '#ffffff',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceHover: '#fafafa',
  textPrimary: '#0a0a0a',
  textSecondary: '#525252',
  textTertiary: '#737373',
  textInverse: '#ffffff',
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  borderDark: '#d4d4d4',
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowDark: 'rgba(0, 0, 0, 0.16)',
};

export const DARK_CHROME = {
  sidebar: '#111111',
  background: '#0a0a0a',
  backgroundSecondary: '#1a1a1a',
  backgroundTertiary: '#171717',
  backgroundElevated: '#141414',
  surface: '#141414',
  surfaceElevated: '#1a1a1a',
  surfaceHover: '#1a1a1a',
  textPrimary: '#fafafa',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  textInverse: '#0a0a0a',
  border: '#2e2e2e',
  borderLight: '#262626',
  borderDark: '#1a1a1a',
  shadow: 'rgba(0, 0, 0, 0.45)',
  shadowLight: 'rgba(0, 0, 0, 0.25)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
};

/** Map shared chrome onto a color object (mutates spread target). */
export function applyChromeTokens(base, chrome) {
  return {
    ...base,
    background: chrome.background,
    backgroundSecondary: chrome.backgroundSecondary,
    backgroundTertiary: chrome.backgroundTertiary,
    backgroundElevated: chrome.backgroundElevated,
    surface: chrome.surface,
    surfaceElevated: chrome.surfaceElevated,
    surfaceHover: chrome.surfaceHover,
    textPrimary: chrome.textPrimary,
    textSecondary: chrome.textSecondary,
    textTertiary: chrome.textTertiary,
    textInverse: chrome.textInverse,
    border: chrome.border,
    borderLight: chrome.borderLight,
    borderDark: chrome.borderDark,
    shadow: chrome.shadow,
    shadowLight: chrome.shadowLight,
    shadowDark: chrome.shadowDark,
  };
}

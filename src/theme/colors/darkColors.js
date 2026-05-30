/**
 * TRAK App - Dark Theme Colors (React Native)
 * Chrome from shared neutral tokens — keep in sync with web.
 */

import { DARK_CHROME, applyChromeTokens } from '../trakChromeTokens';

const darkSemantic = {
  primary: '#fafafa',
  primaryDark: '#e5e5e5',
  primaryLight: '#ffffff',
  primaryGradient: ['#fafafa', '#e5e5e5'],
  textOnPrimary: '#0a0a0a',
  secondary: '#a3a3a3',
  secondaryDark: '#737373',
  secondaryLight: '#d4d4d4',
  textLink: '#e5e5e5',
  borderFocus: '#737373',
  accent: '#d4d4d4',
  accentLight: '#e5e5e5',
  accentDark: '#a3a3a3',
  success: '#34D399',
  successLight: '#6EE7B7',
  successDark: '#10B981',
  successBg: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#FCD34D',
  warningDark: '#F59E0B',
  warningBg: '#78350F',
  error: '#F87171',
  errorLight: '#FCA5A5',
  errorDark: '#EF4444',
  errorBg: '#7F1D1D',
  info: '#a3a3a3',
  infoLight: '#d4d4d4',
  infoDark: '#737373',
  infoBg: '#262626',
  facebook: '#1877F2',
  google: '#4285F4',
  apple: '#FFFFFF',
  trending: '#a3a3a3',
  trendingBg: '#262626',
  verified: '#34D399',
  shadowColored: 'rgba(0, 0, 0, 0.35)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayColored: 'rgba(255, 255, 255, 0.06)',
  gradientStart: '#fafafa',
  gradientEnd: '#d4d4d4',
  gradientAccent: ['#fafafa', '#a3a3a3'],
  chartPrimary: '#a3a3a3',
  chartSecondary: '#737373',
  chartSuccess: '#34D399',
  chartWarning: '#FBBF24',
  chartError: '#F87171',
  chartInfo: '#525252',
};

export const darkColors = applyChromeTokens(darkSemantic, DARK_CHROME);

export default darkColors;

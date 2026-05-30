/**
 * TRAK App - Light Theme Colors
 * Chrome from shared neutral tokens; primary actions use black/grey (logo-aligned).
 */

import { LIGHT_CHROME, applyChromeTokens } from '../trakChromeTokens';

const lightSemantic = {
    primary: '#0a0a0a',
    primaryDark: '#000000',
    primaryLight: '#262626',
    primaryGradient: ['#0a0a0a', '#262626'],
    textOnPrimary: '#ffffff',

    secondary: '#525252',
    secondaryDark: '#404040',
    secondaryLight: '#737373',

    textLink: '#0a0a0a',
    borderFocus: '#525252',

    accent: '#0a0a0a',
    accentLight: '#404040',
    accentDark: '#000000',

    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',
    successBg: '#D1FAE5',

    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',
    warningBg: '#FEF3C7',

    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',
    errorBg: '#FEE2E2',

    info: '#525252',
    infoLight: '#737373',
    infoDark: '#404040',
    infoBg: '#f5f5f5',

    facebook: '#1877F2',
    google: '#4285F4',
    apple: '#000000',

    trending: '#525252',
    trendingBg: '#f5f5f5',
    verified: '#10B981',

    shadowColored: 'rgba(0, 0, 0, 0.15)',

    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    overlayColored: 'rgba(0, 0, 0, 0.1)',

    gradientStart: '#0a0a0a',
    gradientEnd: '#262626',
    gradientAccent: ['#0a0a0a', '#262626'],

    chartPrimary: '#525252',
    chartSecondary: '#737373',
    chartSuccess: '#10B981',
    chartWarning: '#F59E0B',
    chartError: '#EF4444',
    chartInfo: '#a3a3a3',
};

export const lightColors = applyChromeTokens(lightSemantic, LIGHT_CHROME);

export default lightColors;

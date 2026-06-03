/**
 * Admin dashboard: neutral black / white / grey chrome;
 * grey chart series; green / red / amber for semantic KPI and pipeline states.
 */

import { LIGHT_CHROME, DARK_CHROME } from '../../theme/trakChromeTokens';

const CRED_NAMES = { '0': 'Real', '1': 'Fake', '2': 'Suspicious', none: 'Unset' };

function adminBaseChrome(chrome) {
  return {
    textPrimary: chrome.textPrimary,
    textSecondary: chrome.textSecondary,
    textTertiary: chrome.textTertiary,
    border: chrome.border,
    borderLight: chrome.borderLight,
    card: chrome.surface,
    cardHover: chrome.surfaceHover,
    page: chrome.background,
    pageAlt: chrome.backgroundTertiary,
    sidebar: chrome.sidebar,
    inputBg: chrome.backgroundSecondary,
    shadow: chrome.shadow,
    shadowLight: chrome.shadowLight,
  };
}

const GREY = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
};

const SEMANTIC = {
  green: '#16a34a',
  greenDark: '#22c55e',
  red: '#dc2626',
  redDark: '#ef4444',
  yellow: '#ca8a04',
  yellowDark: '#eab308',
  amber: '#d97706',
};

const LIGHT = {
  ...adminBaseChrome(LIGHT_CHROME),
  primary: '#0a0a0a',
  navHover: '#f4f4f5',
  navActiveBg: GREY[100],
  navActiveText: GREY[900],
  success: SEMANTIC.green,
  warning: SEMANTIC.amber,
  error: SEMANTIC.red,
  info: GREY[600],
  successBg: '#f0fdf4',
  warningBg: '#fffbeb',
  errorBg: '#fef2f2',
  infoBg: GREY[100],
  yellow: SEMANTIC.yellow,
  yellowBg: '#fefce8',
  pipeline: {
    pending: GREY[500],
    processing: SEMANTIC.yellow,
    done: SEMANTIC.green,
    failed: SEMANTIC.red,
    unknown: GREY[400],
  },
  credibility: {
    Real: SEMANTIC.green,
    Fake: SEMANTIC.red,
    Suspicious: SEMANTIC.yellow,
    Unset: GREY[400],
    '0': SEMANTIC.green,
    '1': SEMANTIC.red,
    '2': SEMANTIC.yellow,
    none: GREY[400],
  },
  chart: {
    scraped: GREY[600],
    processed: GREY[800],
    primary: GREY[700],
    secondary: GREY[500],
    info: GREY[400],
    rawBar: GREY[600],
    procBar: GREY[800],
    factCheck: GREY[700],
    series: [GREY[700], GREY[600], GREY[500], GREY[800], GREY[400], GREY[900]],
  },
  statAccent: {
    raw: GREY[700],
    processed: SEMANTIC.green,
    queue: GREY[600],
    failed: SEMANTIC.red,
    completion: SEMANTIC.green,
    sources: GREY[700],
    users: GREY[800],
    credibility: GREY[600],
  },
  buttonPrimaryBg: '#0a0a0a',
  buttonPrimaryText: '#ffffff',
  buttonSecondaryBg: 'transparent',
  buttonSecondaryText: GREY[900],
  buttonSecondaryBorder: GREY[300],
  inputText: GREY[900],
};

const DARK = {
  ...adminBaseChrome(DARK_CHROME),
  primary: GREY[50],
  navHover: 'rgba(255, 255, 255, 0.06)',
  navActiveBg: 'rgba(255, 255, 255, 0.08)',
  navActiveText: GREY[50],
  success: SEMANTIC.greenDark,
  warning: '#fbbf24',
  error: SEMANTIC.redDark,
  info: GREY[400],
  successBg: '#14532d33',
  warningBg: '#78350f33',
  errorBg: '#7f1d1d33',
  infoBg: '#262626',
  yellow: SEMANTIC.yellowDark,
  yellowBg: '#42200633',
  pipeline: {
    pending: GREY[400],
    processing: SEMANTIC.yellowDark,
    done: SEMANTIC.greenDark,
    failed: SEMANTIC.redDark,
    unknown: GREY[500],
  },
  credibility: {
    Real: SEMANTIC.greenDark,
    Fake: SEMANTIC.redDark,
    Suspicious: SEMANTIC.yellowDark,
    Unset: GREY[500],
    '0': SEMANTIC.greenDark,
    '1': SEMANTIC.redDark,
    '2': SEMANTIC.yellowDark,
    none: GREY[500],
  },
  chart: {
    scraped: GREY[400],
    processed: GREY[300],
    primary: GREY[300],
    secondary: GREY[500],
    info: GREY[400],
    rawBar: GREY[500],
    procBar: GREY[300],
    factCheck: GREY[400],
    series: [GREY[300], GREY[400], GREY[500], GREY[200], GREY[600], GREY[700]],
  },
  statAccent: {
    raw: GREY[300],
    processed: SEMANTIC.greenDark,
    queue: GREY[400],
    failed: SEMANTIC.redDark,
    completion: SEMANTIC.greenDark,
    sources: GREY[300],
    users: GREY[200],
    credibility: GREY[400],
  },
  buttonPrimaryBg: GREY[100],
  buttonPrimaryText: GREY[900],
  buttonSecondaryBg: 'transparent',
  buttonSecondaryText: GREY[100],
  buttonSecondaryBorder: GREY[600],
  inputText: GREY[100],
};

export function getAdminDashboardPalette(_colors, isDark = false) {
  return isDark ? { ...DARK, isDark: true } : { ...LIGHT, isDark: false };
}

export function getAdminCssVars(palette) {
  return {
    '--admin-border': palette.border,
    '--admin-sidebar-bg': palette.sidebar,
    '--admin-topbar-bg': palette.card,
    '--admin-card': palette.card,
    '--admin-text-primary': palette.textPrimary,
    '--admin-text-secondary': palette.textSecondary,
    '--admin-text-tertiary': palette.textTertiary,
    '--admin-primary': palette.primary,
    '--admin-brand-icon-bg': palette.infoBg,
    '--admin-nav-hover': palette.navHover,
    '--admin-nav-active-bg': palette.navActiveBg,
    '--admin-nav-active-text': palette.navActiveText,
    '--admin-error': palette.error,
    '--admin-error-bg': palette.errorBg,
    '--admin-page-bg': palette.page,
    '--admin-page-alt': palette.pageAlt,
    '--admin-card-hover': palette.cardHover,
    '--admin-input-bg': palette.inputBg,
    '--admin-shadow-light': palette.shadowLight,
  };
}

export function getEmptyDashboardPalette() {
  return { ...LIGHT };
}

export function pipelineColor(palette, status) {
  return palette.pipeline[status] || palette.textTertiary;
}

export function credibilityColor(palette, labelOrKey) {
  return palette.credibility[labelOrKey] || palette.credibility[CRED_NAMES[labelOrKey]] || palette.textTertiary;
}

export { CRED_NAMES, GREY };

/** Live dashboard KPI refresh (seconds). */
export const DASHBOARD_POLL_INTERVAL_MS = 20_000;
/** Processed/raw admin articles — slow background refresh (minutes). */
export const ARTICLES_POLL_INTERVAL_MS = 5 * 60_000;
/** User feedback admin queue — half of articles interval. */
export const FEEDBACK_POLL_INTERVAL_MS = 2.5 * 60_000;

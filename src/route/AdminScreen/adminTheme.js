/**
 * Admin dashboard palette (aligned with web adminTheme.js).
 */

import { LIGHT_CHROME, DARK_CHROME } from '../../theme/trakChromeTokens';

const CRED_NAMES = { '0': 'Real', '1': 'Fake', '2': 'Suspicious', none: 'Unset' };

function adminBaseChrome(chrome) {
  return {
    textPrimary: chrome.textPrimary,
    textSecondary: chrome.textSecondary,
    textTertiary: chrome.textTertiary,
    textInverse: chrome.textInverse,
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
    scraped: '#2563eb',
    processed: '#16a34a',
    primary: '#2563eb',
    secondary: '#7c3aed',
    info: '#0891b2',
    rawBar: '#2563eb',
    procBar: '#16a34a',
    factCheck: GREY[700],
    series: ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#ea580c', '#db2777', '#4f46e5', '#0d9488'],
    factCheckVerdict: {
      supports_ml: SEMANTIC.green,
      contradicts_ml: SEMANTIC.red,
      mixed: SEMANTIC.amber,
      inconclusive: SEMANTIC.yellow,
      api_error: SEMANTIC.red,
      no_hits: GREY[500],
      standalone: '#2563eb',
      skipped: GREY[400],
      disabled: GREY[400],
      empty_query: GREY[500],
      no_api_key: SEMANTIC.amber,
    },
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
    scraped: '#60a5fa',
    processed: '#4ade80',
    primary: '#60a5fa',
    secondary: '#a78bfa',
    info: '#22d3ee',
    rawBar: '#60a5fa',
    procBar: '#4ade80',
    factCheck: GREY[400],
    series: ['#60a5fa', '#a78bfa', '#22d3ee', '#4ade80', '#fb923c', '#f472b6', '#818cf8', '#2dd4bf'],
    factCheckVerdict: {
      supports_ml: SEMANTIC.greenDark,
      contradicts_ml: SEMANTIC.redDark,
      mixed: '#fbbf24',
      inconclusive: SEMANTIC.yellowDark,
      api_error: SEMANTIC.redDark,
      no_hits: GREY[500],
      standalone: '#60a5fa',
      skipped: GREY[500],
      disabled: GREY[500],
      empty_query: GREY[500],
      no_api_key: '#fbbf24',
    },
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
};

export function getAdminDashboardPalette(_colors, isDark = false) {
  return isDark ? { ...DARK, isDark: true } : { ...LIGHT, isDark: false };
}

export function pipelineColor(palette, status) {
  return palette.pipeline[status] || palette.textTertiary;
}

export function credibilityColor(palette, labelOrKey) {
  return palette.credibility[labelOrKey] || palette.credibility[CRED_NAMES[labelOrKey]] || palette.textTertiary;
}

function normalizeVerdictKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function factCheckVerdictColor(palette, verdict, index = 0) {
  const key = normalizeVerdictKey(verdict);
  return (
    palette.chart?.factCheckVerdict?.[key] ||
    chartSeriesColor(palette, index) ||
    palette.textTertiary
  );
}

export function chartSeriesColor(palette, index) {
  const series = palette.chart?.series || [];
  if (!series.length) return palette.primary;
  return series[Math.abs(Number(index) || 0) % series.length];
}

/** Filled CTA — readable in light and dark (avoid primary bg + white text in dark). */
export function adminFilledButtonColors(palette) {
  return {
    background: palette.textPrimary,
    foreground: palette.textInverse,
  };
}

export { CRED_NAMES, GREY };

/** Live dashboard KPI refresh (seconds). */
export const DASHBOARD_POLL_INTERVAL_MS = 45_000;
/** Processed/raw admin articles — slow background refresh (minutes). */
export const ARTICLES_POLL_INTERVAL_MS = 5 * 60_000;
/** User feedback admin queue — half of articles interval. */
export const FEEDBACK_POLL_INTERVAL_MS = 2.5 * 60_000;

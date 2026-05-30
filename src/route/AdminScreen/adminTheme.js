/**
 * Admin dashboard palette (aligned with web adminTheme.js).
 */

const CRED_NAMES = { '0': 'Real', '1': 'Fake', '2': 'Suspicious', none: 'Unset' };

const BLUE = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
};

const SEMANTIC = {
  green: '#16a34a',
  greenDark: '#22c55e',
  red: '#dc2626',
  redDark: '#ef4444',
  blue: BLUE[600],
  blueLight: BLUE[400],
  yellow: '#ca8a04',
  yellowDark: '#eab308',
  amber: '#d97706',
};

const LIGHT = {
  textPrimary: '#0a0a0a',
  textSecondary: '#525252',
  textTertiary: '#737373',
  border: '#e5e5e5',
  borderLight: '#f0f0f0',
  card: '#ffffff',
  cardHover: '#fafafa',
  page: '#f5f5f5',
  pageAlt: '#ebebeb',
  sidebar: '#ffffff',
  inputBg: '#f8fafc',
  primary: '#2563eb',
  navHover: '#f4f4f5',
  navActiveBg: BLUE[50],
  navActiveText: BLUE[700],
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  success: SEMANTIC.green,
  warning: SEMANTIC.amber,
  error: SEMANTIC.red,
  info: SEMANTIC.blue,
  successBg: '#f0fdf4',
  warningBg: '#fffbeb',
  errorBg: '#fef2f2',
  infoBg: BLUE[50],
  yellow: SEMANTIC.yellow,
  yellowBg: '#fefce8',
  pipeline: {
    pending: BLUE[400],
    processing: SEMANTIC.yellow,
    done: SEMANTIC.green,
    failed: SEMANTIC.red,
    unknown: '#a3a3a3',
  },
  credibility: {
    Real: SEMANTIC.green,
    Fake: SEMANTIC.red,
    Suspicious: SEMANTIC.yellow,
    Unset: '#a3a3a3',
    '0': SEMANTIC.green,
    '1': SEMANTIC.red,
    '2': SEMANTIC.yellow,
    none: '#a3a3a3',
  },
  chart: {
    scraped: BLUE[500],
    processed: BLUE[700],
    primary: BLUE[600],
    secondary: BLUE[400],
    info: BLUE[300],
    rawBar: BLUE[500],
    procBar: BLUE[800],
    factCheck: BLUE[600],
    series: [BLUE[600], BLUE[500], BLUE[400], BLUE[700], BLUE[300], BLUE[800]],
  },
  statAccent: {
    raw: BLUE[600],
    processed: SEMANTIC.green,
    queue: BLUE[500],
    failed: SEMANTIC.red,
    completion: SEMANTIC.green,
    sources: BLUE[600],
    users: BLUE[700],
    credibility: BLUE[600],
  },
};

const DARK = {
  textPrimary: '#fafafa',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  border: '#2e2e2e',
  borderLight: '#262626',
  card: '#141414',
  cardHover: '#1a1a1a',
  page: '#0a0a0a',
  pageAlt: '#171717',
  sidebar: '#111111',
  inputBg: '#1a1a1a',
  primary: BLUE[400],
  navHover: 'rgba(255, 255, 255, 0.06)',
  navActiveBg: '#1e3a8a33',
  navActiveText: BLUE[300],
  shadow: 'rgba(0, 0, 0, 0.45)',
  shadowLight: 'rgba(0, 0, 0, 0.25)',
  success: SEMANTIC.greenDark,
  warning: '#fbbf24',
  error: SEMANTIC.redDark,
  info: BLUE[400],
  successBg: '#14532d33',
  warningBg: '#78350f33',
  errorBg: '#7f1d1d33',
  infoBg: '#1e3a8a33',
  yellow: SEMANTIC.yellowDark,
  yellowBg: '#42200633',
  pipeline: {
    pending: BLUE[400],
    processing: SEMANTIC.yellowDark,
    done: SEMANTIC.greenDark,
    failed: SEMANTIC.redDark,
    unknown: '#525252',
  },
  credibility: {
    Real: SEMANTIC.greenDark,
    Fake: SEMANTIC.redDark,
    Suspicious: SEMANTIC.yellowDark,
    Unset: '#737373',
    '0': SEMANTIC.greenDark,
    '1': SEMANTIC.redDark,
    '2': SEMANTIC.yellowDark,
    none: '#737373',
  },
  chart: {
    scraped: BLUE[400],
    processed: BLUE[300],
    primary: BLUE[400],
    secondary: BLUE[500],
    info: BLUE[200],
    rawBar: BLUE[500],
    procBar: BLUE[300],
    factCheck: BLUE[400],
    series: [BLUE[400], BLUE[500], BLUE[300], BLUE[200], BLUE[600], BLUE[700]],
  },
  statAccent: {
    raw: BLUE[400],
    processed: SEMANTIC.greenDark,
    queue: BLUE[400],
    failed: SEMANTIC.redDark,
    completion: SEMANTIC.greenDark,
    sources: BLUE[400],
    users: BLUE[300],
    credibility: BLUE[400],
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

export { CRED_NAMES };

export const DASHBOARD_POLL_INTERVAL_MS = 20_000;

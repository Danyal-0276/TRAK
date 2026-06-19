import { readStoredLanguage, LANGUAGE_TO_LOCALE } from '../i18n/translations';

const LEGACY_TIMEZONE_MAP = {
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  PKT: 'Asia/Karachi',
  IST: 'Asia/Kolkata',
  UTC: 'UTC',
};

export function normalizeTimezone(value) {
  const raw = String(value || 'UTC').trim();
  if (LEGACY_TIMEZONE_MAP[raw]) return LEGACY_TIMEZONE_MAP[raw];
  return raw || 'UTC';
}

export function getUserTimezone() {
  try {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return normalizeTimezone(parsed.timezone);
    }
  } catch {
    /* ignore */
  }
  return 'UTC';
}

export function getUserLocale() {
  try {
    const saved = localStorage.getItem('userSettings');
    if (saved) {
      const parsed = JSON.parse(saved);
      const lang = parsed.language || 'English';
      return LANGUAGE_TO_LOCALE[lang] || readStoredLanguage() || 'en';
    }
  } catch {
    /* ignore */
  }
  const stored = readStoredLanguage();
  return LANGUAGE_TO_LOCALE[stored] || stored || 'en';
}

export function formatDateTime(value, options = {}) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const locale = options.locale || getUserLocale();
  const timeZone = options.timeZone || getUserTimezone();
  const fmt = {
    timeZone,
    ...(options.dateStyle ? { dateStyle: options.dateStyle } : {}),
    ...(options.timeStyle ? { timeStyle: options.timeStyle } : {}),
  };
  if (!options.dateStyle && !options.timeStyle) {
    fmt.dateStyle = 'medium';
    fmt.timeStyle = 'short';
  }
  try {
    return date.toLocaleString(locale, fmt);
  } catch {
    return date.toLocaleString(undefined, { timeZone });
  }
}

export function formatDate(value, options = {}) {
  return formatDateTime(value, { ...options, timeStyle: undefined, dateStyle: options.dateStyle || 'medium' });
}

export const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'Asia/Karachi', label: 'Pakistan Time' },
  { value: 'Asia/Kolkata', label: 'India Time' },
];

export function migrateStoredTimezone() {
  try {
    const saved = localStorage.getItem('userSettings');
    if (!saved) return;
    const parsed = JSON.parse(saved);
    const next = normalizeTimezone(parsed.timezone);
    if (next !== parsed.timezone) {
      parsed.timezone = next;
      localStorage.setItem('userSettings', JSON.stringify(parsed));
    }
  } catch {
    /* ignore */
  }
}

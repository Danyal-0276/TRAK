import { getAdminSettings } from '../api/adminApi';
import { ADMIN_LANGUAGE_CHANGED_EVENT } from '../i18n/adminTranslations';

const ADMIN_SETTINGS_KEY = 'trak:admin-settings';

let cachedAdminSettings = null;

export async function loadAdminSettings() {
  if (cachedAdminSettings) return cachedAdminSettings;
  try {
    const stored = sessionStorage.getItem(ADMIN_SETTINGS_KEY);
    if (stored) {
      cachedAdminSettings = JSON.parse(stored);
      return cachedAdminSettings;
    }
  } catch {
    /* ignore */
  }
  try {
    const data = await getAdminSettings();
    cachedAdminSettings = data;
    sessionStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(data));
    return data;
  } catch {
    return { language: 'English' };
  }
}

export function setAdminSettingsCache(settings) {
  const prevLanguage = cachedAdminSettings?.language;
  cachedAdminSettings = settings;
  try {
    sessionStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
  if (settings?.language && settings.language !== prevLanguage && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_LANGUAGE_CHANGED_EVENT, { detail: settings.language }));
  }
}

export function getAdminLanguage() {
  return cachedAdminSettings?.language || 'English';
}

import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { LANGUAGE_TO_LOCALE, RTL_LOCALES } from '../i18n/translations';
import { adminT as translateAdmin, ADMIN_LANGUAGE_CHANGED_EVENT } from '../i18n/adminTranslations';
import { getAdminLanguage, loadAdminSettings } from '../utils/adminSettingsRuntime';

const AdminLanguageContext = createContext(null);

function applyAdminDocumentLanguage(languageName) {
  if (typeof document === 'undefined') return;
  const locale = LANGUAGE_TO_LOCALE[languageName] || 'en';
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

export function AdminLanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getAdminLanguage());

  useLayoutEffect(() => {
    loadAdminSettings()
      .then((settings) => {
        if (settings?.language) setLanguageState(settings.language);
      })
      .catch(() => {});

    const onLanguageChanged = (event) => {
      if (event?.detail) setLanguageState(event.detail);
    };
    window.addEventListener(ADMIN_LANGUAGE_CHANGED_EVENT, onLanguageChanged);
    return () => window.removeEventListener(ADMIN_LANGUAGE_CHANGED_EVENT, onLanguageChanged);
  }, []);

  useLayoutEffect(() => {
    applyAdminDocumentLanguage(language);
  }, [language]);

  const adminT = useCallback((key) => translateAdmin(key, language), [language]);

  const setAdminLanguage = useCallback((nextLanguage) => {
    setLanguageState(nextLanguage);
    applyAdminDocumentLanguage(nextLanguage);
    window.dispatchEvent(new CustomEvent(ADMIN_LANGUAGE_CHANGED_EVENT, { detail: nextLanguage }));
  }, []);

  const value = useMemo(
    () => ({ language, adminT, setAdminLanguage }),
    [language, adminT, setAdminLanguage],
  );

  return <AdminLanguageContext.Provider value={value}>{children}</AdminLanguageContext.Provider>;
}

export function useAdminLanguage() {
  const ctx = useContext(AdminLanguageContext);
  if (!ctx) {
    throw new Error('useAdminLanguage must be used within AdminLanguageProvider');
  }
  return ctx;
}

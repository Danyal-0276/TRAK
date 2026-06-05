import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_TO_LOCALE,
  RTL_LOCALES,
  persistLanguage,
  readStoredLanguage,
  translate,
} from '../i18n/translations';

export const LANGUAGE_CHANGED_EVENT = 'trak:language-changed';

const LanguageContext = createContext(null);

function applyDocumentLanguage(languageName) {
  if (typeof document === 'undefined') return;
  const locale = LANGUAGE_TO_LOCALE[languageName] || 'en';
  document.documentElement.lang = locale;
  document.documentElement.dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  const locale = LANGUAGE_TO_LOCALE[language] || 'en';

  const setLanguage = useCallback((languageName) => {
    const next = LANGUAGE_TO_LOCALE[languageName] ? languageName : DEFAULT_LANGUAGE;
    setLanguageState(next);
    persistLanguage(next);
    applyDocumentLanguage(next);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: next }));
    }
  }, []);

  useLayoutEffect(() => {
    applyDocumentLanguage(language);

    const onStorage = (event) => {
      if (event.key && event.key !== 'userSettings') return;
      setLanguageState(readStoredLanguage());
    };
    const onLanguageChanged = (event) => {
      if (event?.detail) setLanguageState(event.detail);
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(LANGUAGE_CHANGED_EVENT, onLanguageChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(LANGUAGE_CHANGED_EVENT, onLanguageChanged);
    };
  }, [language]);

  const t = useCallback((key, fallback) => translate(locale, key, fallback), [locale]);

  const value = useMemo(
    () => ({ language, locale, setLanguage, t }),
    [language, locale, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}

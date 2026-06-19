import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { adminT as translateAdmin } from '../i18n/adminTranslations';

const AdminLanguageContext = createContext(null);

export function AdminLanguageProvider({ children, initialLanguage = 'English' }) {
  const [language, setLanguageState] = useState(initialLanguage || 'English');

  const adminT = useCallback(
    (key) => translateAdmin(key, language),
    [language],
  );

  const setAdminLanguage = useCallback((nextLanguage) => {
    const lang = String(nextLanguage || 'English').trim() || 'English';
    setLanguageState(lang);
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
    return {
      language: 'English',
      adminT: (key) => translateAdmin(key, 'English'),
      setAdminLanguage: () => {},
    };
  }
  return ctx;
}

export default AdminLanguageContext;

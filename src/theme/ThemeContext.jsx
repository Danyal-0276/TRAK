import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors } from './colors/lightColors';
import { darkColors } from './colors/darkColors';
import { APP_FONTS } from './AppFontLoader';

const THEME_STORAGE_KEY = 'theme';

const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

const typography = {
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.25, fontFamily: APP_FONTS.headingBold },
  subtitle: { fontSize: 20, fontWeight: '600', fontFamily: APP_FONTS.heading },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24, fontFamily: APP_FONTS.body },
  caption: { fontSize: 13, fontWeight: '400', fontFamily: APP_FONTS.body },
  button: { fontSize: 17, fontWeight: '600', letterSpacing: 0.3, fontFamily: APP_FONTS.bodySemiBold },
};

const fonts = {
  body: APP_FONTS.body,
  bodySemiBold: APP_FONTS.bodySemiBold,
  bodyBold: APP_FONTS.bodyBold,
  heading: APP_FONTS.heading,
  headingBold: APP_FONTS.headingBold,
};

const elevation = {
  sm: 2,
  md: 4,
  lg: 6,
};

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ initialMode = 'light', children }) => {
  const [mode, setMode] = useState(initialMode);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (mounted && (saved === 'light' || saved === 'dark')) {
          setMode(saved);
        }
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => {});
  }, [mode, hydrated]);

  const palette = mode === 'dark' ? darkColors : lightColors;

  const theme = useMemo(
    () => ({
      mode,
      colors: palette,
      spacing,
      radius,
      typography,
      fonts,
      fontFamily: APP_FONTS.body,
      fontFamilyHeading: APP_FONTS.heading,
      elevation,
    }),
    [mode, palette]
  );

  const toggleTheme = useCallback(
    () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    []
  );

  const contextValue = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

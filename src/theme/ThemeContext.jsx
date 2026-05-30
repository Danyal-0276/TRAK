import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors } from './colors/lightColors';
import { darkColors } from './colors/darkColors';

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
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.25 },
  subtitle: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' },
  button: { fontSize: 17, fontWeight: '600', letterSpacing: 0.3 },
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
      elevation,
    }),
    [mode, palette]
  );

  const toggleTheme = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

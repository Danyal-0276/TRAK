import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { lightColors } from './colors/lightColors';
import { darkColors } from './colors/darkColors';

const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32
};

const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999
};

const typography = {
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.25 },
  subtitle: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400' },
  button: { fontSize: 17, fontWeight: '600', letterSpacing: 0.3 }
};

const elevation = {
  sm: 2,
  md: 4,
  lg: 6
};

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ initialMode = 'light', children }) => {
  // Load theme from localStorage or use initialMode
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || initialMode;
  });

  // Save theme to localStorage whenever it changes
  const palette = mode === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    localStorage.setItem('theme', mode);
    document.documentElement.setAttribute('data-theme', mode);
    document.body.style.backgroundColor = palette.background;
    document.body.style.color = palette.textPrimary;
  }, [mode, palette.background, palette.textPrimary]);

  const theme = useMemo(() => ({
    mode,
    colors: palette,
    spacing,
    radius,
    typography,
    elevation
  }), [mode, palette]);

  const toggleTheme = () => {
    setMode((m) => {
      const newMode = m === 'light' ? 'dark' : 'light';
      return newMode;
    });
  };

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



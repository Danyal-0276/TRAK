import React, { createContext, useContext, useMemo, useState } from 'react';
import { colors as lightColors } from '../utils/colors';

const darkColors = {
  primary: '#2563eb',
  primaryDark: '#1e3a8a',
  primaryLight: '#3b82f6',
  background: '#0b1220',
  backgroundSecondary: '#0f172a',
  backgroundTertiary: '#111827',
  surface: '#0f172a',
  surfaceElevated: '#111827',
  textPrimary: '#e5e7eb',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  border: '#1f2937',
  borderLight: '#374151',
  borderDark: '#4b5563',
  accent: '#2563eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#60a5fa',
  shadow: 'rgba(0,0,0,0.6)',
  shadowLight: 'rgba(0,0,0,0.3)',
  shadowDark: 'rgba(0,0,0,0.8)',
  overlay: 'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(255,255,255,0.06)'
};

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
  const [mode, setMode] = useState(initialMode);

  const palette = mode === 'dark' ? darkColors : lightColors;

  const theme = useMemo(() => ({
    mode,
    colors: palette,
    spacing,
    radius,
    typography,
    elevation
  }), [mode, palette]);

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

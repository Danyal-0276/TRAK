import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { flushSync } from 'react-dom';
import { lightColors } from './colors/lightColors';
import { darkColors } from './colors/darkColors';
import { runThemeSwitchAnimation } from './themeSwitchAnimation';
import { syncThemeToDocument } from './themeDomSync';
import './themeTransition.css';

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

function paletteForMode(mode) {
  return mode === 'dark' ? darkColors : lightColors;
}

export const ThemeProvider = ({ initialMode = 'light', children }) => {
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || initialMode;
  });
  const modeRef = useRef(mode);
  const animatingRef = useRef(false);

  modeRef.current = mode;
  const palette = paletteForMode(mode);

  useLayoutEffect(() => {
    syncThemeToDocument(mode, palette);
  }, [mode, palette]);

  const theme = useMemo(
    () => ({
      mode,
      colors: palette,
      spacing,
      radius,
      typography,
      elevation,
    }),
    [mode, palette],
  );

  const toggleTheme = useCallback(() => {
    if (animatingRef.current) return;

    const nextMode = modeRef.current === 'light' ? 'dark' : 'light';
    const nextPalette = paletteForMode(nextMode);

    animatingRef.current = true;
    runThemeSwitchAnimation({
      applyTheme: () => {
        flushSync(() => {
          syncThemeToDocument(nextMode, nextPalette);
          setMode(nextMode);
        });
      },
    }).finally(() => {
      animatingRef.current = false;
    });
  }, []);

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

import { useTheme } from './ThemeContext';

/**
 * Filled primary action colors with readable label/icon contrast in light and dark mode.
 */
export function filledActionColors(colors, isDark) {
  if (isDark) {
    return {
      background: colors.textPrimary || '#fafafa',
      foreground: colors.textOnPrimary || colors.background || '#0a0a0a',
    };
  }
  return {
    background: colors.primary || '#0a0a0a',
    foreground: colors.textOnPrimary || '#ffffff',
  };
}

export function useFilledActionColors() {
  const { theme } = useTheme();
  return filledActionColors(theme.colors, theme.mode === 'dark');
}

import { useTheme } from '../theme/ThemeContext';

/**
 * Theme colors for app pages — always uses palette (cream/purple), never plain white fallbacks.
 */
export function usePageColors() {
  const { theme } = useTheme();
  const { colors } = theme;
  return {
    theme,
    colors,
    isDark: theme.mode === 'dark',
    bg: colors.background,
    surface: colors.surface,
    surfaceElevated: colors.surfaceElevated || colors.surface,
    textPrimary: colors.textPrimary,
    textSecondary: colors.textSecondary,
    textTertiary: colors.textTertiary,
    border: colors.border,
    borderLight: colors.borderLight || colors.border,
    primary: colors.primary,
    accent: colors.accent || colors.primary,
  };
}

/**
 * Filled primary action colors with readable label/icon contrast in light and dark mode.
 */
export function filledActionColors(colors, isDark) {
  if (isDark) {
    const foreground = colors.textOnPrimary || colors.background || '#0a0a0a';
    return {
      background: colors.textPrimary || '#fafafa',
      foreground,
      color: foreground,
    };
  }
  const foreground = colors.textOnPrimary || '#ffffff';
  return {
    background: colors.primary || '#0a0a0a',
    foreground,
    color: foreground,
  };
}

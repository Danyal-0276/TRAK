import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { getAdminDashboardPalette, getAdminCssVars } from './adminTheme';

export function useAdminTheme() {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const palette = useMemo(
    () => getAdminDashboardPalette(theme.colors, isDark),
    [theme.colors, isDark]
  );
  const cssVars = useMemo(() => getAdminCssVars(palette), [palette]);

  return { palette, isDark, cssVars, colors: theme.colors };
}

export default useAdminTheme;

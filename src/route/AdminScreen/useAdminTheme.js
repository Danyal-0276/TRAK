import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { getAdminDashboardPalette } from './adminTheme';

export function useAdminTheme() {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const palette = useMemo(
    () => getAdminDashboardPalette(theme.colors, isDark),
    [theme.colors, isDark]
  );

  return { palette, isDark, colors: theme.colors };
}

export default useAdminTheme;

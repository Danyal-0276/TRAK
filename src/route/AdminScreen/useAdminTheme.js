import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { getAdminDashboardPalette } from './adminTheme';
import { buildAdminType } from './adminTypography';

export function useAdminTheme() {
  const { theme } = useTheme();
  const isDark = theme.mode === 'dark';
  const palette = useMemo(
    () => getAdminDashboardPalette(theme.colors, isDark),
    [theme.colors, isDark]
  );
  const type = useMemo(() => buildAdminType(theme), [theme]);

  return { palette, isDark, colors: theme.colors, theme, type };
}

export default useAdminTheme;

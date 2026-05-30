/** Shared inline page styles for themed full-screen routes. */

import { filledActionColors } from './buttonContrast';

export function themedPageRoot(colors) {
  return {
    minHeight: '100vh',
    backgroundColor: colors.background,
    color: colors.textPrimary,
  };
}

export function themedInputStyle(colors) {
  return {
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    border: `1px solid ${colors.border}`,
  };
}

export function themedPrimaryButton(colors, isDark = false) {
  const action = filledActionColors(colors, isDark);
  return {
    backgroundColor: action.background,
    color: action.foreground,
    border: 'none',
  };
}

/** Shared inline page styles for themed full-screen routes. */

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

export function themedPrimaryButton(colors) {
  return {
    backgroundColor: colors.primary,
    color: '#ffffff',
    border: 'none',
  };
}

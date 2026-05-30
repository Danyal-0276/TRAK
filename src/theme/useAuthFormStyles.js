import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';
import { filledActionColors } from './buttonContrast';

/**
 * Theme-aware styles for login, sign-up, and related auth forms.
 */
export function useAuthFormStyles() {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const action = filledActionColors(colors, isDark);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        label: {
          fontSize: 15,
          color: colors.textPrimary,
          marginBottom: 10,
          fontWeight: '600',
          letterSpacing: -0.3,
        },
        input: {
          borderWidth: 1.5,
          borderColor: colors.border,
          borderRadius: 14,
          paddingHorizontal: 18,
          paddingVertical: 16,
          fontSize: 16,
          color: colors.textPrimary,
          backgroundColor: colors.backgroundSecondary,
        },
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: colors.border,
          borderRadius: 14,
          backgroundColor: colors.backgroundSecondary,
          paddingHorizontal: 18,
          paddingVertical: 14,
        },
        inputField: {
          flex: 1,
          fontSize: 16,
          color: colors.textPrimary,
          padding: 0,
        },
        inputError: {
          borderColor: colors.error,
        },
        eyeIcon: {
          padding: 4,
          marginLeft: 8,
        },
        forgotText: {
          color: colors.textLink || colors.textPrimary,
          fontSize: 15,
          fontWeight: '600',
          letterSpacing: -0.2,
        },
        primaryButton: {
          backgroundColor: action.background,
          paddingVertical: 18,
          borderRadius: 16,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.35 : 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
        primaryButtonDisabled: {
          backgroundColor: colors.textTertiary,
          shadowOpacity: 0,
          elevation: 0,
        },
        primaryButtonText: {
          color: action.foreground,
          fontSize: 17,
          fontWeight: '700',
          letterSpacing: 0.2,
        },
        errorText: {
          color: colors.error,
          fontSize: 12,
          marginTop: 6,
          fontWeight: '500',
        },
        dividerLine: {
          flex: 1,
          height: 1,
          backgroundColor: colors.border,
        },
        dividerText: {
          textAlign: 'center',
          color: colors.textTertiary,
          fontSize: 13,
          fontWeight: '500',
          marginHorizontal: 12,
          letterSpacing: 0.2,
          textTransform: 'lowercase',
        },
        loadingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        spinner: {
          marginRight: 10,
        },
      }),
    [colors, action, isDark],
  );

  return { colors, isDark, action, styles };
}

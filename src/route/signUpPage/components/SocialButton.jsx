import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const SocialButton = ({ iconSource, onPress, loading, disabled, style }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    const styles = useMemo(
        () =>
            StyleSheet.create({
                socialButton: {
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: colors.border,
                    shadowColor: colors.shadow || '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                },
                iconImage: {
                    width: 24,
                    height: 24,
                },
                disabled: {
                    opacity: 0.5,
                },
            }),
        [colors],
    );

    return (
        <TouchableOpacity
            style={[styles.socialButton, style, (loading || disabled) && styles.disabled]}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={loading || disabled}
        >
            {loading ? (
                <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
                iconSource && (
                    <Image source={iconSource} style={styles.iconImage} resizeMode="contain" />
                )
            )}
        </TouchableOpacity>
    );
};

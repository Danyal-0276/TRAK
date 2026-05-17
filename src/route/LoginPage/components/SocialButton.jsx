import React from 'react';
import { TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import colors from '../../../utils/colors';

export const SocialButton = ({ iconSource, onPress, style, loading, disabled }) => (
    <TouchableOpacity 
        style={[styles.socialButton, style, (loading || disabled) && styles.disabled]} 
        onPress={onPress}
        activeOpacity={0.7}
        disabled={loading || disabled}
    >
        {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
        ) : (
            iconSource && (
                <Image 
                    source={iconSource} 
                    style={styles.iconImage}
                    resizeMode="contain"
                />
            )
        )}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
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
});
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import UIText from '../../../components/ui/Text';

export const Footer = ({ onSignInPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={styles.footer}>
            <UIText variant="caption" color={colors.textSecondary} style={styles.footerText}>Already have an account? </UIText>
            <TouchableOpacity onPress={onSignInPress}>
                <UIText variant="caption" color={colors.primary} style={styles.linkText}>Sign in</UIText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '400',
    },
    linkText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
});
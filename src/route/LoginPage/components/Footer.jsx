import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export const Footer = ({ onSignUpPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={styles.footer}>
            <Text variant="caption" color={colors.textSecondary} style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity 
                onPress={onSignUpPress}
                activeOpacity={0.7}
            >
                <Text variant="caption" color={colors.primary} style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
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
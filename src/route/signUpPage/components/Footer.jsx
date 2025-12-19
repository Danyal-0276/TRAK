import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../../utils/colors';

export const Footer = ({ onSignInPress }) => (
    <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={onSignInPress}>
            <Text style={styles.linkText}>Sign in</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 8,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '400',
    },
    linkText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
});
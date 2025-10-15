import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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
        paddingTop: 10,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    linkText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
});
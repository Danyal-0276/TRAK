import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocialButton } from './SocialButton';

export const SocialButtons = () => (
    <>
        <Text style={styles.dividerText}>Or Login with</Text>
        <View style={styles.socialButtons}>
            <SocialButton icon="f" />
            <SocialButton icon="G" />
            <SocialButton icon="🍎" />
        </View>
    </>
);

const styles = StyleSheet.create({
    dividerText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 18,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 15,
    },
});
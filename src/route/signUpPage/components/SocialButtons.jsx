import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocialButton } from './SocialButton';

export const SocialButtons = ({ onSocialPress, loadingProvider }) => (
    <>
        <Text style={styles.dividerText}>Or Sign up with</Text>
        <View style={styles.socialButtons}>
            <SocialButton 
                icon="f" 
                onPress={() => onSocialPress('facebook')}
                loading={loadingProvider === 'facebook'}
            />
            <SocialButton 
                icon="G" 
                onPress={() => onSocialPress('google')}
                loading={loadingProvider === 'google'}
            />
            <SocialButton 
                icon="🍎" 
                onPress={() => onSocialPress('apple')}
                loading={loadingProvider === 'apple'}
            />
        </View>
    </>
);

const styles = StyleSheet.create({
    dividerText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 15,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 15,
    },
});
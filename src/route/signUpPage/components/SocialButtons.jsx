import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocialButton } from './SocialButton';
import colors from '../../../utils/colors';

const FacebookIcon = require('../../../assets/images/facebook-logo-png-23.png');
const GoogleIcon = require('../../../assets/images/google.png');
const AppleIcon = require('../../../assets/images/apple-logo-icon-14915.png');

export const SocialButtons = ({ onSocialPress, loadingProvider }) => (
    <View style={styles.container}>
        <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
        </View>
        <View style={styles.socialButtons}>
            <SocialButton 
                iconSource={FacebookIcon}
                onPress={() => onSocialPress('facebook')}
                loading={loadingProvider === 'facebook'}
                style={styles.buttonSpacing}
            />
            <SocialButton 
                iconSource={GoogleIcon}
                onPress={() => onSocialPress('google')}
                loading={loadingProvider === 'google'}
                style={styles.buttonSpacing}
            />
            <SocialButton 
                iconSource={AppleIcon}
                onPress={() => onSocialPress('apple')}
                loading={loadingProvider === 'apple'}
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonSpacing: {
        marginRight: 16,
    },
});
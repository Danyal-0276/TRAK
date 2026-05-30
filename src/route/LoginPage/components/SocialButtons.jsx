import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocialButton } from './SocialButton';
import { useAuthFormStyles } from '../../../theme/useAuthFormStyles';

const FacebookIcon = require('../../../assets/images/facebook-logo-png-23.png');
const GoogleIcon = require('../../../assets/images/google.png');
const AppleIcon = require('../../../assets/images/apple-logo-icon-14915.png');

export const SocialButtons = ({ onSocialPress, loadingProvider }) => {
    const { styles } = useAuthFormStyles();
    const busy = loadingProvider != null;

    return (
        <View style={localStyles.container}>
            <View style={localStyles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
            </View>
            <View style={localStyles.socialButtons}>
                <SocialButton
                    iconSource={FacebookIcon}
                    onPress={() => onSocialPress?.('facebook')}
                    loading={loadingProvider === 'facebook'}
                    disabled={busy && loadingProvider !== 'facebook'}
                    style={localStyles.buttonSpacing}
                />
                <SocialButton
                    iconSource={GoogleIcon}
                    onPress={() => onSocialPress?.('google')}
                    loading={loadingProvider === 'google'}
                    disabled={busy && loadingProvider !== 'google'}
                    style={localStyles.buttonSpacing}
                />
                <SocialButton
                    iconSource={AppleIcon}
                    onPress={() => onSocialPress?.('apple')}
                    loading={loadingProvider === 'apple'}
                    disabled={busy && loadingProvider !== 'apple'}
                />
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    container: {
        width: '100%',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonSpacing: {
        marginRight: 16,
    },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocialButton } from './SocialButton';
import { useAuthFormStyles } from '../../../theme/useAuthFormStyles';

const GoogleIcon = require('../../../assets/images/google.png');

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
                    iconSource={GoogleIcon}
                    onPress={() => onSocialPress?.('google')}
                    loading={loadingProvider === 'google'}
                    disabled={busy && loadingProvider !== 'google'}
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
});

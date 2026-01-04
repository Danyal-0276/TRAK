import React from 'react';
import { SocialButton } from '../../LoginPage/components/SocialButton';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

const FacebookIcon = '/images/facebook-logo-png-23.png';
const GoogleIcon = '/images/google.png';
const AppleIcon = '/images/apple-logo-icon-14915.png';

export const SocialButtons = ({ onSocialPress, loadingProvider }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text variant="caption" color={colors.textTertiary} style={{ margin: '0 12px', textTransform: 'lowercase' }}>
                    or continue with
                </Text>
                <div style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <SocialButton
                    iconSource={FacebookIcon}
                    onPress={() => onSocialPress?.('facebook')}
                    loading={loadingProvider === 'facebook'}
                />
                <SocialButton
                    iconSource={GoogleIcon}
                    onPress={() => onSocialPress?.('google')}
                    loading={loadingProvider === 'google'}
                />
                <SocialButton
                    iconSource={AppleIcon}
                    onPress={() => onSocialPress?.('apple')}
                    loading={loadingProvider === 'apple'}
                />
            </div>
        </div>
    );
};


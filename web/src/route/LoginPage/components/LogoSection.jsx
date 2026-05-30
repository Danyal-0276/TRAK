import React from 'react';
import Text from '../../../components/ui/Text';
import TrakLogo from '../../../components/TrakLogo';
import { useTheme } from '../../../theme/ThemeContext';

export const LogoSection = () => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 20,
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <TrakLogo size={90} />
                <Text variant="title" color={colors.textPrimary} style={{ fontSize: 24, fontWeight: '700', letterSpacing: 4, marginTop: 12 }}>
                    TRAK
                </Text>
            </div>
        </div>
    );
};


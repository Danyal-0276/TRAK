import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import TrakLogo from '../../../components/TrakLogo';

export const LogoSection = () => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <View style={styles.logoSection}>
            <TrakLogo size={72} />
            <Text style={[styles.brandName, { color: colors.textPrimary }]}>TRAK</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    logoSection: {
        alignItems: 'center',
        marginBottom: 8,
    },
    brandName: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: 4,
        marginTop: 8,
    },
});

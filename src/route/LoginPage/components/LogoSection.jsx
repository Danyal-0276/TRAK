import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import TrakLogo from '../../../components/TrakLogo';

export const LogoSection = () => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
                <TrakLogo size={90} />
                <Text style={[styles.brandName, { color: colors.textPrimary }]}>TRAK</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    logoSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    logoContainer: {
        alignItems: 'center',
    },
    brandName: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 4,
        marginTop: 12,
    },
});

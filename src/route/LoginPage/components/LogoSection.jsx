import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WhiteLogo from '../../../assets/images/whiteLogo.svg';

export const LogoSection = () => (
    <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
                <WhiteLogo width={90} height={90} />
            </View>
            <Text style={styles.brandName}>TRAK</Text>
        </View>
    </View>
);

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
    logoWrapper: {
        marginBottom: 4,
    },
    brandName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 4,
        marginTop: 12,
    },
});
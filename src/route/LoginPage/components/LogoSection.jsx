import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import WhiteLogo from '../../../assets/images/whiteLogo.svg';

export const LogoSection = () => (
    <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
            <WhiteLogo width={80} height={80} />
            <Text style={styles.brandName}>TRAK</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    logoSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    brandName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 3,
        marginTop: 8,
    },
});
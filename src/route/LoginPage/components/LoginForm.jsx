import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { InputField } from './InputField';
import { SocialButtons } from './SocialButtons';
import colors from '../../../utils/colors';

export const LoginForm = ({ 
    email, 
    setEmail, 
    password, 
    setPassword, 
    onLoginPress, 
    onForgotPasswordPress,
    onSocialPress,
    loadingProvider
}) => (
    <View style={styles.formContainer}>
        <View style={styles.inputsSection}>
            <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
            />

            <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
            />

            <TouchableOpacity 
                onPress={onForgotPasswordPress}
                style={styles.forgotButton}
                activeOpacity={0.7}
            >
                <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.actionsSection}>
            <TouchableOpacity 
                style={[styles.primaryButton, (!email || !password) && styles.primaryButtonDisabled]} 
                onPress={onLoginPress}
                activeOpacity={0.9}
                disabled={!email || !password}
            >
                <Text style={styles.primaryButtonText}>Sign in</Text>
            </TouchableOpacity>

            <SocialButtons 
                onSocialPress={onSocialPress}
                loadingProvider={loadingProvider}
            />
        </View>
    </View>
);

const styles = StyleSheet.create({
    formContainer: {
        minHeight: 400,
    },
    inputsSection: {
        marginBottom: 8,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: 4,
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    forgotText: {
        color: colors.primary,
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    actionsSection: {
        marginTop: 20,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonDisabled: {
        backgroundColor: colors.textTertiary,
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        color: colors.surface,
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});
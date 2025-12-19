import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { InputField } from './InputField';
import { SocialButtons } from './SocialButtons';
import colors from '../../../utils/colors';

export const SignUpForm = ({ 
    fullName,
    setFullName,
    email, 
    setEmail, 
    password, 
    setPassword,
    confirmPassword,
    setConfirmPassword,
    onSignUpPress,
    onSocialPress,
    loading,
    loadingProvider,
    errors
}) => (
    <View style={styles.formContainer}>
        <InputField
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="John Doe"
            autoCapitalize="words"
            error={errors.fullName}
        />

        <InputField
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="hello@trak.com"
            keyboardType="email-address"
            error={errors.email}
        />

        <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.password}
        />

        <InputField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            secureTextEntry
            error={errors.confirmPassword}
        />

        <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
            onPress={onSignUpPress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.primaryButtonText}>Create account</Text>
            )}
        </TouchableOpacity>

        <SocialButtons 
            onSocialPress={onSocialPress}
            loadingProvider={loadingProvider}
        />
    </View>
);

const styles = StyleSheet.create({
    formContainer: {
        width: '100%',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 20,
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
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { InputField } from './InputField';
import { SocialButtons } from './SocialButtons';

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
        flex: 1,
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    primaryButtonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
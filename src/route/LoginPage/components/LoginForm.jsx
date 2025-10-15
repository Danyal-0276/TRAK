import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { InputField } from './InputField';
import { SocialButtons } from './SocialButtons';

export const LoginForm = ({ 
    email, 
    setEmail, 
    password, 
    setPassword, 
    onLoginPress, 
    onForgotPasswordPress 
}) => (
    <View style={styles.formContainer}>
        <InputField
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="hello@trak.com"
            keyboardType="email-address"
        />

        <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
        />

        <TouchableOpacity onPress={onForgotPasswordPress}>
            <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onLoginPress}
        >
            <Text style={styles.primaryButtonText}>Log in</Text>
        </TouchableOpacity>

        <SocialButtons />
    </View>
);

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
    },
    forgotText: {
        color: '#000',
        fontSize: 14,
        textAlign: 'right',
        marginBottom: 20,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
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
}) => {
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="John Doe"
                    placeholderTextColor={colors.textTertiary}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email address</Text>
                <TextInput
                    ref={emailRef}
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="hello@trak.com"
                    placeholderTextColor={colors.textTertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                    <TextInput
                        ref={passwordRef}
                        style={styles.inputField}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textTertiary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        returnKeyType="next"
                        onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                    <TextInput
                        ref={confirmPasswordRef}
                        style={styles.inputField}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textTertiary}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        returnKeyType="done"
                        onSubmitEditing={onSignUpPress}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? (
                            <EyeOff size={20} color={colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

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
};

const styles = StyleSheet.create({
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 18,
    },
    label: {
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: 10,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
        color: colors.textPrimary,
        backgroundColor: colors.backgroundSecondary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 14,
        backgroundColor: colors.backgroundSecondary,
        paddingHorizontal: 18,
        paddingVertical: 14,
    },
    inputField: {
        flex: 1,
        fontSize: 16,
        color: colors.textPrimary,
        padding: 0,
    },
    inputError: {
        borderColor: colors.error,
    },
    eyeIcon: {
        padding: 4,
        marginLeft: 8,
    },
    errorText: {
        color: colors.error,
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#000000',
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
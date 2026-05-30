import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { SocialButtons } from './SocialButtons';
import { useAuthFormStyles } from '../../../theme/useAuthFormStyles';

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
    const { colors, action, styles } = useAuthFormStyles();
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const disabled = !fullName || !email || !password || !confirmPassword || loading;

    return (
        <View style={localStyles.formContainer}>
            <View style={localStyles.inputGroup}>
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
                {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            <View style={localStyles.inputGroup}>
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
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={localStyles.inputGroup}>
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
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={localStyles.inputGroup}>
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
                {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>

            <TouchableOpacity
                style={[styles.primaryButton, localStyles.signUpButton, disabled && styles.primaryButtonDisabled]}
                onPress={onSignUpPress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={action.foreground} style={styles.spinner} />
                        <Text style={styles.primaryButtonText}>Creating account...</Text>
                    </View>
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

const localStyles = StyleSheet.create({
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 18,
    },
    signUpButton: {
        marginTop: 4,
        marginBottom: 20,
    },
});

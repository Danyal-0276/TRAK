import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { SocialButtons } from './SocialButtons';
import { useAuthFormStyles } from '../../../theme/useAuthFormStyles';

export const LoginForm = ({
    email,
    setEmail,
    password,
    setPassword,
    onLoginPress,
    onForgotPasswordPress,
    onSocialPress,
    loadingProvider,
    loading = false
}) => {
    const { colors, action, styles } = useAuthFormStyles();
    const passwordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const disabled = !email || !password || loading;

    return (
        <View style={localStyles.formContainer}>
            <View style={localStyles.inputsSection}>
                <View style={localStyles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textTertiary}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                </View>

                <View style={localStyles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            ref={passwordRef}
                            style={styles.inputField}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textTertiary}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            returnKeyType="done"
                            onSubmitEditing={onLoginPress}
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
                </View>

                <TouchableOpacity
                    onPress={onForgotPasswordPress}
                    style={localStyles.forgotButton}
                    activeOpacity={0.7}
                >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>
            </View>

            <View style={localStyles.actionsSection}>
                <TouchableOpacity
                    style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
                    onPress={onLoginPress}
                    activeOpacity={0.9}
                    disabled={disabled}
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={action.foreground} style={styles.spinner} />
                            <Text style={styles.primaryButtonText}>Signing in...</Text>
                        </View>
                    ) : (
                        <Text style={styles.primaryButtonText}>Sign in</Text>
                    )}
                </TouchableOpacity>

                <SocialButtons
                    onSocialPress={onSocialPress}
                    loadingProvider={loadingProvider}
                />
            </View>
        </View>
    );
};

const localStyles = StyleSheet.create({
    formContainer: {
        minHeight: 400,
    },
    inputsSection: {
        marginBottom: 8,
    },
    inputGroup: {
        marginBottom: 18,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: 4,
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    actionsSection: {
        marginTop: 20,
    },
});

import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
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
}) => {
    const passwordRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={styles.formContainer}>
            <View style={styles.inputsSection}>
                <View style={styles.inputGroup}>
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

                <View style={styles.inputGroup}>
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
};

const styles = StyleSheet.create({
    formContainer: {
        minHeight: 400,
    },
    inputsSection: {
        marginBottom: 8,
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
    eyeIcon: {
        padding: 4,
        marginLeft: 8,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: 4,
        marginBottom: 8,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    forgotText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    actionsSection: {
        marginTop: 20,
    },
    primaryButton: {
        backgroundColor: '#000000',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000000',
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
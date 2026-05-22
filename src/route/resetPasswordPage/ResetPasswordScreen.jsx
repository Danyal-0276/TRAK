import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Eye, EyeOff, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import TextComponent from '../../components/ui/Text';
import { confirmPasswordReset, confirmPasswordResetWithOtp } from '../../api/authPasswordApi';
import { useFeedback } from '../../components/ui/FeedbackProvider';

const { width, height } = Dimensions.get('window');

const ResetPasswordScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { error: showError } = useFeedback();
    const { colors } = theme;
    const otpEmail = (route.params?.email || '').trim().toLowerCase();
    const resetToken = route.params?.resetToken || '';
    const fromOtp = Boolean(route.params?.fromOtp && otpEmail && resetToken);
    const [uid, setUid] = useState(route.params?.uid || '');
    const [token, setToken] = useState(route.params?.token || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (fromOtp) return;
        const p = route.params;
        if (p?.uid) setUid(p.uid);
        if (p?.token) setToken(p.token);
    }, [route.params?.uid, route.params?.token, fromOtp]);

    useEffect(() => {
        if (route.params?.fromOtp && (!otpEmail || !resetToken)) {
            navigation.replace('ForgotPasswordCode', { email: otpEmail });
        }
    }, [fromOtp, otpEmail, resetToken, navigation, route.params?.fromOtp]);

    useEffect(() => {
        if (fromOtp) return;
        const tryParse = (url) => {
            if (!url) return;
            const qIndex = url.indexOf('?');
            if (qIndex < 0) return;
            const params = new URLSearchParams(url.slice(qIndex + 1));
            const uidParam = params.get('uid');
            const tokenParam = params.get('token');
            if (uidParam) setUid(uidParam);
            if (tokenParam) setToken(tokenParam);
        };
        Linking.getInitialURL().then(tryParse).catch(() => {});
        const sub = Linking.addEventListener('url', ({ url }) => tryParse(url));
        return () => sub?.remove?.();
    }, []);

    const validateForm = () => {
        const newErrors = {};

        if (!fromOtp) {
            if (!uid.trim()) {
                newErrors.uid = 'Copy the uid value from the reset link';
            }
            if (!token.trim()) {
                newErrors.token = 'Copy the token value from the reset link';
            }
        }

        if (!newPassword) {
            newErrors.newPassword = 'Password is required';
        } else if (newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        // Clear previous errors
        setErrors({});

        // Validate form
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            if (fromOtp) {
                await confirmPasswordResetWithOtp({
                    email: otpEmail,
                    reset_token: resetToken,
                    password: newPassword,
                    password_confirm: confirmPassword,
                });
            } else {
                await confirmPasswordReset({
                    uid: uid.trim(),
                    token: token.trim(),
                    password: newPassword,
                    password_confirm: confirmPassword,
                });
            }
            navigation.navigate('PasswordChanged');
        } catch (error) {
            showError(error?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.fullContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.background} 
            />
            
            {/* Enhanced gradient background */}
            <LinearGradient
                colors={theme.mode === 'dark' 
                    ? ['#0F172A', '#1E293B', '#334155', '#1E293B', '#0F172A']
                    : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
            {/* Static decorative circles - no animation to prevent blinking */}
            <View 
                style={[
                    styles.accentCircle1, 
                    { 
                        backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.12' : '0.05'})`,
                    }
                ]} 
            />
            <View 
                style={[
                    styles.accentCircle2, 
                    { 
                        backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.10' : '0.04'})`,
                    }
                ]} 
            />
            
            {/* Static glow effect - no animation to prevent blinking */}
            <View
                style={[
                    styles.glowEffect,
                    {
                        backgroundColor: theme.mode === 'dark' ? 'rgba(129, 140, 248, 0.08)' : 'rgba(0, 0, 0, 0.03)',
                        opacity: 0.4,
                    },
                ]}
            />

            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView 
                    style={styles.contentContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView 
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.content}>
                            <View style={styles.headerSection}>
                                <View style={styles.iconContainer}>
                                    <Lock size={48} color={colors.primary} strokeWidth={2} />
                                </View>
                                <TextComponent variant="title" color={colors.textPrimary} style={styles.title}>
                                    Reset password
                                </TextComponent>
                                <TextComponent variant="body" color={colors.textSecondary} style={styles.subtitle}>
                                    {fromOtp
                                        ? `Code verified for ${otpEmail}. Choose a new password.`
                                        : "Please type something you'll remember"}
                                </TextComponent>
                            </View>

                                <View 
                                style={[
                                    styles.formCard, 
                                    { 
                                        backgroundColor: colors.surface, 
                                        borderColor: colors.borderLight,
                                        shadowColor: colors.shadow,
                                    }
                                ]}
                            >
                                {!fromOtp && (
                                    <View style={styles.inputGroup}>
                                        <TextComponent variant="body" color={colors.textPrimary} style={styles.label}>
                                            Reset uid (from email link)
                                        </TextComponent>
                                        <View
                                            style={[
                                                styles.inputContainer,
                                                {
                                                    borderColor: errors.uid ? colors.error : colors.border,
                                                    backgroundColor: colors.backgroundSecondary,
                                                },
                                            ]}
                                        >
                                            <TextInput
                                                style={[styles.input, { color: colors.textPrimary }]}
                                                placeholder="uid query param"
                                                placeholderTextColor={colors.textTertiary}
                                                value={uid}
                                                onChangeText={(t) => {
                                                    setUid(t);
                                                    if (errors.uid) setErrors({ ...errors, uid: '' });
                                                }}
                                                autoCapitalize="none"
                                                editable={!loading}
                                            />
                                        </View>
                                        {errors.uid ? (
                                            <Text style={[styles.errorText, { color: colors.error }]}>{errors.uid}</Text>
                                        ) : null}
                                    </View>
                                )}

                                {!fromOtp && (
                                    <View style={styles.inputGroup}>
                                        <TextComponent variant="body" color={colors.textPrimary} style={styles.label}>
                                            Reset token (from email link)
                                        </TextComponent>
                                        <View
                                            style={[
                                                styles.inputContainer,
                                                {
                                                    borderColor: errors.token ? colors.error : colors.border,
                                                    backgroundColor: colors.backgroundSecondary,
                                                },
                                            ]}
                                        >
                                            <TextInput
                                                style={[styles.input, { color: colors.textPrimary }]}
                                                placeholder="token query param"
                                                placeholderTextColor={colors.textTertiary}
                                                value={token}
                                                onChangeText={(t) => {
                                                    setToken(t);
                                                    if (errors.token) setErrors({ ...errors, token: '' });
                                                }}
                                                autoCapitalize="none"
                                                editable={!loading}
                                            />
                                        </View>
                                        {errors.token ? (
                                            <Text style={[styles.errorText, { color: colors.error }]}>{errors.token}</Text>
                                        ) : null}
                                    </View>
                                )}

                                <View style={styles.inputGroup}>
                                    <TextComponent variant="body" color={colors.textPrimary} style={styles.label}>
                                        New password
                                    </TextComponent>
                                    <View style={[
                                        styles.inputContainer, 
                                        { 
                                            borderColor: errors.newPassword ? colors.error : colors.border,
                                            backgroundColor: colors.backgroundSecondary
                                        }
                                    ]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.textPrimary }]}
                                            placeholder="must be 8 characters"
                                            placeholderTextColor={colors.textTertiary}
                                            value={newPassword}
                                            onChangeText={(text) => {
                                                setNewPassword(text);
                                                if (errors.newPassword) {
                                                    setErrors({ ...errors, newPassword: '' });
                                                }
                                            }}
                                            secureTextEntry={!showNewPassword}
                                            editable={!loading}
                                        />
                                        <TouchableOpacity 
                                            style={styles.eyeIcon}
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                            disabled={loading}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={20} color={colors.textSecondary} />
                                            ) : (
                                                <Eye size={20} color={colors.textSecondary} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    {errors.newPassword && (
                                        <Text style={[styles.errorText, { color: colors.error }]}>
                                            {errors.newPassword}
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.inputGroup}>
                                    <TextComponent variant="body" color={colors.textPrimary} style={styles.label}>
                                        Confirm new password
                                    </TextComponent>
                                    <View style={[
                                        styles.inputContainer, 
                                        { 
                                            borderColor: errors.confirmPassword ? colors.error : colors.border,
                                            backgroundColor: colors.backgroundSecondary
                                        }
                                    ]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.textPrimary }]}
                                            placeholder="repeat password"
                                            placeholderTextColor={colors.textTertiary}
                                            value={confirmPassword}
                                            onChangeText={(text) => {
                                                setConfirmPassword(text);
                                                if (errors.confirmPassword) {
                                                    setErrors({ ...errors, confirmPassword: '' });
                                                }
                                            }}
                                            secureTextEntry={!showConfirmPassword}
                                            editable={!loading}
                                        />
                                        <TouchableOpacity 
                                            style={styles.eyeIcon}
                                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={loading}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff size={20} color={colors.textSecondary} />
                                            ) : (
                                                <Eye size={20} color={colors.textSecondary} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    {errors.confirmPassword && (
                                        <Text style={[styles.errorText, { color: colors.error }]}>
                                            {errors.confirmPassword}
                                        </Text>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.primaryButton, 
                                        { 
                                            backgroundColor: (
                                                (fromOtp
                                                    ? !newPassword || !confirmPassword
                                                    : !uid.trim() || !token.trim() || !newPassword || !confirmPassword) || loading
                                            )
                                                ? colors.textTertiary 
                                                : colors.primary,
                                            shadowColor: colors.shadowDark,
                                            opacity: (
                                                (fromOtp
                                                    ? !newPassword || !confirmPassword
                                                    : !uid.trim() || !token.trim() || !newPassword || !confirmPassword) || loading
                                            ) ? 0.6 : 1,
                                        }
                                    ]}
                                    onPress={handleResetPassword}
                                    disabled={
                                        (fromOtp
                                            ? !newPassword || !confirmPassword
                                            : !uid.trim() || !token.trim() || !newPassword || !confirmPassword) || loading
                                    }
                                    activeOpacity={0.8}
                                >
                                    {loading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator 
                                                size="small" 
                                                color={colors.textInverse}
                                                style={styles.spinner}
                                            />
                                            <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                                                Resetting...
                                            </Text>
                                        </View>
                                    ) : (
                                        <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                                            Reset password
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <TextComponent variant="caption" color={colors.textSecondary} style={styles.footerText}>
                                    Already have an account? 
                                </TextComponent>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <TextComponent variant="caption" color={colors.primary} style={styles.linkText}>
                                        Log in
                                    </TextComponent>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    accentCircle1: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        top: -150,
        right: -120,
    },
    accentCircle2: {
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: 160,
        bottom: 100,
        left: -100,
    },
    glowEffect: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: height * 0.25,
        left: width * 0.5 - 150,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 24,
    },
    headerSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -1.2,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    formCard: {
        borderRadius: 24,
        padding: 28,
        marginBottom: 20,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 15,
        marginBottom: 10,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    eyeIcon: {
        padding: 4,
        marginLeft: 8,
    },
    errorText: {
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
    },
    primaryButton: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        marginRight: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 16,
    },
    footerText: {
        fontSize: 14,
        fontWeight: '400',
    },
    linkText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
});

export default ResetPasswordScreen;

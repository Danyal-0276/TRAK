import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import TextComponent from '../../components/ui/Text';

const ResetPasswordScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleResetPassword = () => {
        // Validate passwords
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        // TODO: Add your password reset API call here
        // try {
        //     await resetPasswordAPI(newPassword);
        //     navigation.navigate('PasswordChanged');
        // } catch (error) {
        //     Alert.alert('Error', 'Failed to reset password. Please try again.');
        // }

        // For now, just navigate to PasswordChanged screen
        navigation.navigate('PasswordChanged');
    };

    return (
        <View style={[styles.fullContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.background} 
            />
            
            {/* Subtle gradient background */}
            <LinearGradient
                colors={[colors.background, colors.backgroundSecondary, colors.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
            {/* Decorative accent circles */}
            <View style={[styles.accentCircle1, { backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.08' : '0.04'})` }]} />
            <View style={[styles.accentCircle2, { backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.06' : '0.03'})` }]} />

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
                            <TouchableOpacity
                                style={[styles.backButton, { 
                                    backgroundColor: colors.backgroundSecondary, 
                                    borderColor: colors.border 
                                }]}
                                onPress={() => navigation.goBack()}
                            >
                                <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
                            </TouchableOpacity>

                            <View style={styles.headerSection}>
                                <TextComponent variant="title" color={colors.textPrimary} style={styles.title}>Reset password</TextComponent>
                                <TextComponent variant="body" color={colors.textSecondary} style={styles.subtitle}>
                                    Please type something you'll remember
                                </TextComponent>
                            </View>

                            <View style={[styles.formCard, { 
                                backgroundColor: colors.surface, 
                                borderColor: colors.borderLight,
                                shadowColor: colors.shadow
                            }]}>
                                <View style={styles.inputGroup}>
                                    <TextComponent variant="body" color={colors.textPrimary} style={styles.label}>New password</TextComponent>
                                    <View style={[styles.inputContainer, { 
                                        borderColor: colors.border,
                                        backgroundColor: colors.backgroundSecondary
                                    }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.textPrimary }]}
                                            placeholder="must be 8 characters"
                                            placeholderTextColor={colors.textTertiary}
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showNewPassword}
                                        />
                                        <TouchableOpacity 
                                            style={styles.eyeIcon}
                                            onPress={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff size={20} color={colors.textSecondary} />
                                            ) : (
                                                <Eye size={20} color={colors.textSecondary} />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <TextComponent variant="body" color={colors.textPrimary} style={styles.label}>Confirm new password</TextComponent>
                                    <View style={[styles.inputContainer, { 
                                        borderColor: colors.border,
                                        backgroundColor: colors.backgroundSecondary
                                    }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.textPrimary }]}
                                            placeholder="repeat password"
                                            placeholderTextColor={colors.textTertiary}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirmPassword}
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
                                </View>

                                <TouchableOpacity
                                    style={[styles.primaryButton, { 
                                        backgroundColor: colors.primary,
                                        shadowColor: colors.shadowDark
                                    }]}
                                    onPress={handleResetPassword}
                                >
                                    <TextComponent variant="button" color={colors.textInverse} style={styles.primaryButtonText}>Reset password</TextComponent>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.footer}>
                                <TextComponent variant="caption" color={colors.textSecondary} style={styles.footerText}>Already have an account? </TextComponent>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <TextComponent variant="caption" color={colors.primary} style={styles.linkText}>Log in</TextComponent>
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
        width: 350,
        height: 350,
        borderRadius: 175,
        top: -100,
        right: -100,
    },
    accentCircle2: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        bottom: 80,
        left: -80,
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
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
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
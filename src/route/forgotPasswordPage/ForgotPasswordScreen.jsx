import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import colors from '../../utils/colors';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    return (
        <View style={styles.fullContainer}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            
            {/* Subtle gradient background */}
            <LinearGradient
                colors={[colors.background, colors.backgroundSecondary, colors.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
            {/* Decorative accent circles */}
            <View style={styles.accentCircle1} />
            <View style={styles.accentCircle2} />

            <SafeAreaView style={styles.safeContainer}>
                <KeyboardAvoidingView 
                    style={styles.contentContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={styles.contentWrapper}>
                        <View style={styles.header}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.headerSection}>
                            <Text style={styles.title}>Forgot password?</Text>
                            <Text style={styles.subtitle}>
                                Don't worry! It happens. Please enter the email associated with your account.
                            </Text>
                        </View>

                        <View style={styles.formCard}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email address</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your email address"
                                    placeholderTextColor={colors.textTertiary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('ForgotPasswordCode', { email })}
                            >
                                <Text style={styles.primaryButtonText}>Send code</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Remember password? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Log in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: colors.background,
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
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        top: -100,
        right: -100,
    },
    accentCircle2: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        bottom: 80,
        left: -80,
    },
    safeContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    header: {
        paddingTop: 4,
        paddingBottom: 4,
        marginBottom: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.backgroundSecondary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 12,
        letterSpacing: -1.2,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    formCard: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 28,
        marginBottom: 20,
        shadowColor: colors.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    inputGroup: {
        marginBottom: 24,
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
    primaryButton: {
        backgroundColor: '#000000',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        color: colors.surface,
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
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '400',
    },
    linkText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
});

export default ForgotPasswordScreen;
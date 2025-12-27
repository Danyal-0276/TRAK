import React, { useState, useRef, useEffect } from 'react';
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

const ForgotPasswordCodeScreen = ({ navigation, route }) => {
    const [code, setCode] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(20);
    const inputRefs = useRef([]);

    const { email } = route.params || {};

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCodeChange = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto focus next input
        if (text && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

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

                        <View style={styles.headerContent}>
                            <Text style={styles.title}>Please check your email</Text>
                            <Text style={styles.subtitle}>
                                We've sent a code to {email || 'hello@trak.com'}
                            </Text>
                        </View>

                        <View style={styles.formCard}>
                            <View style={styles.codeInputContainer}>
                                {code.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => (inputRefs.current[index] = ref)}
                                        style={styles.codeInput}
                                        value={digit}
                                        onChangeText={(text) => handleCodeChange(text, index)}
                                        onKeyPress={(e) => handleKeyPress(e, index)}
                                        maxLength={1}
                                        keyboardType="numeric"
                                        textAlign="center"
                                    />
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('ResetPassword')}
                            >
                                <Text style={styles.primaryButtonText}>Verify</Text>
                            </TouchableOpacity>

                            <TouchableOpacity disabled={timer > 0}>
                                <Text style={[styles.resendText, timer > 0 && styles.disabledText]}>
                                    {timer > 0 
                                        ? `Send code again 00:${timer.toString().padStart(2, '0')}`
                                        : 'Send code again'
                                    }
                                </Text>
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
    headerContent: {
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
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
    },
    codeInput: {
        width: 60,
        height: 60,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 14,
        fontSize: 24,
        fontWeight: '700',
        color: colors.textPrimary,
        backgroundColor: colors.backgroundSecondary,
        marginHorizontal: 6,
    },
    primaryButton: {
            backgroundColor: '#000000',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
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
    resendText: {
        textAlign: 'center',
        color: colors.primary,
        fontSize: 15,
        fontWeight: '600',
    },
    disabledText: {
        color: colors.textTertiary,
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

export default ForgotPasswordCodeScreen;
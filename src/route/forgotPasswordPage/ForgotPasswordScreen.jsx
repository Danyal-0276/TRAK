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
    Animated,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Mail } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { checkPasswordResetEmail, requestPasswordReset } from '../../api/authPasswordApi';
import { useFeedback } from '../../components/ui/FeedbackProvider';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { error: showError } = useFeedback();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const action = filledActionColors(colors, isDark);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 7,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
                toValue: 1,
                friction: 6,
                tension: 40,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.timing(iconRotate, {
                toValue: 1,
                duration: 1000,
                delay: 400,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(circle1Anim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(circle2Anim, {
                    toValue: 1,
                    duration: 1200,
                    delay: 100,
                    useNativeDriver: true,
                }),
            ]),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ),
        ]).start();
    }, []);

    return (
        <View style={[styles.fullContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.background} 
            />
            
            {/* Enhanced gradient background */}
            <LinearGradient
                colors={theme.mode === 'dark' 
                    ? [colors.background, colors.backgroundSecondary, colors.background]
                    : [colors.background, colors.backgroundSecondary, '#F8FAFC', colors.backgroundSecondary, colors.background]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
            {/* Animated decorative circles */}
            <Animated.View 
                style={[
                    styles.accentCircle1, 
                    { 
                        backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.12' : '0.05'})`,
                        opacity: circle1Anim,
                        transform: [
                            {
                                scale: circle1Anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    }
                ]} 
            />
            <Animated.View 
                style={[
                    styles.accentCircle2, 
                    { 
                        backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.10' : '0.04'})`,
                        opacity: circle2Anim,
                        transform: [
                            {
                                scale: circle2Anim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    }
                ]} 
            />
            
            {/* Animated glow effect */}
            <Animated.View
                style={[
                    styles.glowEffect,
                    {
                        backgroundColor: theme.mode === 'dark' ? 'rgba(129, 140, 248, 0.15)' : 'rgba(0, 0, 0, 0.05)',
                        opacity: glowAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 0.6],
                        }),
                        transform: [
                            {
                                scale: glowAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.1],
                                }),
                            },
                        ],
                    },
                ]}
            />

            <SafeAreaView style={styles.safeContainer}>
                <KeyboardAvoidingView 
                    style={styles.contentContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <Animated.View 
                        style={[
                            styles.contentWrapper,
                            {
                                opacity: fadeAnim,
                                transform: [
                                    { translateY: slideAnim },
                                    { scale: scaleAnim },
                                ],
                            },
                        ]}
                    >
                        <Animated.View 
                            style={[
                                styles.headerSection,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 50],
                                                outputRange: [0, 20],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.iconContainer}>
                                <Animated.View
                                    style={{
                                        transform: [
                                            {
                                                scale: iconScale,
                                            },
                                            {
                                                rotate: iconRotate.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: ['-10deg', '0deg'],
                                                }),
                                            },
                                        ],
                                    }}
                                >
                                    <Mail size={48} color={colors.primary} strokeWidth={2} />
                                </Animated.View>
                            </View>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>Forgot password?</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Don't worry! It happens. Please enter the email associated with your account.
                            </Text>
                        </Animated.View>

                        <Animated.View 
                            style={[
                                styles.formCard, 
                                { 
                                    backgroundColor: colors.surface, 
                                    borderColor: colors.borderLight,
                                    shadowColor: colors.shadow,
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 50],
                                                outputRange: [0, 30],
                                            }),
                                        },
                                    ],
                                }
                            ]}
                        >
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Email address</Text>
                                <TextInput
                                    style={[styles.input, { 
                                        borderColor: colors.border, 
                                        backgroundColor: colors.backgroundSecondary,
                                        color: colors.textPrimary
                                    }]}
                                    placeholder="Enter your email address"
                                    placeholderTextColor={colors.textTertiary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton, 
                                    { 
                                        backgroundColor: (!email || !email.includes('@') || loading)
                                            ? colors.textTertiary
                                            : action.background,
                                        shadowColor: colors.shadowDark,
                                        opacity: (!email || !email.includes('@') || loading) ? 0.6 : 1,
                                    }
                                ]}
                                onPress={async () => {
                                    if (!email) {
                                        showError('Please enter your email address');
                                        return;
                                    }
                                    if (!email.includes('@') || !email.includes('.')) {
                                        showError('Please enter a valid email address');
                                        return;
                                    }
                                    setLoading(true);
                                    try {
                                        const check = await checkPasswordResetEmail(email.trim());
                                        if (!check?.exists) {
                                            showError('No account found with this email address.');
                                            return;
                                        }
                                        const res = await requestPasswordReset(email.trim());
                                        navigation.navigate('ForgotPasswordCode', {
                                            email: email.trim().toLowerCase(),
                                            emailSent: res?.email_sent !== false,
                                        });
                                    } catch (error) {
                                        showError(error?.message || 'Could not send reset email.');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                activeOpacity={0.8}
                                disabled={!email || !email.includes('@') || loading}
                            >
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator 
                                            size="small" 
                                            color={action.foreground}
                                            style={styles.spinner}
                                        />
                                        <Text style={[styles.primaryButtonText, { color: action.foreground }]}>
                                            Sending...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.primaryButtonText, { color: action.foreground }]}>
                                        Send reset link
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View 
                            style={[
                                styles.footer,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 50],
                                                outputRange: [0, 40],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Remember password? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={[styles.linkText, { color: colors.primary }]}>Log in</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
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
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
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
    input: {
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 16,
        fontSize: 16,
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

export default ForgotPasswordScreen;
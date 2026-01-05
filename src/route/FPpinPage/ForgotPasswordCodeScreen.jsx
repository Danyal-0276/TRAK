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
import { LinearGradient } from 'react-native-linear-gradient';
import { ChevronLeft, Mail, Shield } from 'lucide-react-native';
import { Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

const ForgotPasswordCodeScreen = ({ navigation, route }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [code, setCode] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const inputAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;

    const { email } = route.params || {};

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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
            // Stagger code input animations
            Animated.stagger(100, [
                Animated.spring(inputAnims[0], {
                    toValue: 1,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(inputAnims[1], {
                    toValue: 1,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(inputAnims[2], {
                    toValue: 1,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(inputAnims[3], {
                    toValue: 1,
                    friction: 7,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const handleCodeChange = (text, index) => {
        const newCode = [...code];
        newCode[index] = text.replace(/[^0-9]/g, '');
        setCode(newCode);

        // Animate input on change
        Animated.sequence([
            Animated.timing(inputAnims[index], {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(inputAnims[index], {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto focus next input
        if (newCode[index] && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
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
                                styles.header,
                                {
                                    opacity: fadeAnim,
                                    transform: [{ translateY: slideAnim }],
                                },
                            ]}
                        >
                            <TouchableOpacity 
                                style={[styles.backButton, {
                                    backgroundColor: colors.backgroundSecondary,
                                    borderColor: colors.border,
                                }]}
                                onPress={() => navigation.goBack()}
                            >
                                <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View 
                            style={[
                                styles.headerContent,
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
                                    <Shield size={48} color={colors.primary} strokeWidth={2} />
                                </Animated.View>
                            </View>
                            <Text style={[styles.title, { color: colors.textPrimary }]}>Please check your email</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                We've sent a code to {email || 'hello@trak.com'}
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
                            <View style={styles.codeInputContainer}>
                                {code.map((digit, index) => (
                                    <Animated.View
                                        key={index}
                                        style={{
                                            transform: [
                                                {
                                                    scale: inputAnims[index].interpolate({
                                                        inputRange: [0, 1, 1.1],
                                                        outputRange: [0, 1, 1.05],
                                                    }),
                                                },
                                            ],
                                            opacity: inputAnims[index],
                                        }}
                                    >
                                        <TextInput
                                            ref={(ref) => (inputRefs.current[index] = ref)}
                                            style={[
                                                styles.codeInput,
                                                {
                                                    borderColor: digit ? colors.primary : colors.border,
                                                    backgroundColor: colors.backgroundSecondary,
                                                    color: colors.textPrimary,
                                                }
                                            ]}
                                            value={digit}
                                            onChangeText={(text) => handleCodeChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            maxLength={1}
                                            keyboardType="numeric"
                                            textAlign="center"
                                        />
                                    </Animated.View>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.primaryButton, 
                                    {
                                        backgroundColor: (code.some(digit => !digit) || loading) 
                                            ? colors.textTertiary 
                                            : colors.primary,
                                        shadowColor: colors.shadowDark,
                                        opacity: (code.some(digit => !digit) || loading) ? 0.6 : 1,
                                    }
                                ]}
                                onPress={async () => {
                                    if (code.some(digit => !digit)) return;
                                    setLoading(true);
                                    try {
                                        // Simulate API call
                                        await new Promise(resolve => setTimeout(resolve, 1500));
                                        navigation.navigate('ResetPassword');
                                    } catch (error) {
                                        Alert.alert('Error', 'Failed to verify code. Please try again.');
                                        setLoading(false);
                                    }
                                }}
                                activeOpacity={0.8}
                                disabled={code.some(digit => !digit) || loading}
                            >
                                {loading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator 
                                            size="small" 
                                            color={colors.textInverse}
                                            style={styles.spinner}
                                        />
                                        <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                                            Verifying...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                                        Verify
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                disabled={timer > 0}
                                onPress={() => {
                                    if (timer === 0) {
                                        setTimer(60);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={[
                                    styles.resendText, 
                                    { color: timer > 0 ? colors.textTertiary : colors.primary }
                                ]}>
                                    {timer > 0 
                                        ? `Send code again 00:${timer.toString().padStart(2, '0')}`
                                        : 'Send code again'
                                    }
                                </Text>
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
    headerContent: {
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
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
        gap: 12,
    },
    codeInput: {
        width: 70,
        height: 70,
        borderWidth: 2,
        borderRadius: 16,
        fontSize: 28,
        fontWeight: '700',
        marginHorizontal: 4,
    },
    primaryButton: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
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
    resendText: {
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '600',
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

export default ForgotPasswordCodeScreen;
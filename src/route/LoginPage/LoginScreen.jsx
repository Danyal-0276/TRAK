import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Platform, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { Footer } from './components/Footer';
import { useTheme } from '../../theme/ThemeContext';
import Text from '../../components/ui/Text';
import { useAuth } from '../../context/AuthContext';
import { setTokens } from '../../api/client';
import {
    loginWithOtp,
    loginWithSocialDemo,
    requestOtp,
    saveAuthSession,
} from '../../utils/Service/api';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const { login, bootstrap } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notice, setNotice] = useState(null);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const circle1Anim = useRef(new Animated.Value(0)).current;
    const circle2Anim = useRef(new Animated.Value(0)).current;
    const circle3Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Staggered entrance animations
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
                Animated.timing(circle3Anim, {
                    toValue: 1,
                    duration: 1400,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const handleSocialLogin = async (provider) => {
        setLoadingProvider(provider);
        
        try {
            const normalizedProvider = provider === 'apple' ? 'twitter' : provider === 'facebook' ? 'github' : provider;
            const syntheticEmail = `${normalizedProvider}_mobile_user_${Date.now()}@trak.local`;
            const session = await loginWithSocialDemo(normalizedProvider, syntheticEmail);
            await setTokens(session.access, session.refresh);
            saveAuthSession(session);
            await bootstrap();
            const dest = session.user?.role === 'admin' ? 'AdminScreen' : 'NewsFeed';
            navigation.reset({ index: 0, routes: [{ name: dest }] });
        } catch (error) {
            setNotice({ type: 'error', text: error.message || 'Failed to login with social provider' });
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            
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
            
            {/* Animated decorative circles with glow */}
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
            <Animated.View 
                style={[
                    styles.accentCircle3, 
                    { 
                        backgroundColor: `rgba(0, 0, 0, ${theme.mode === 'dark' ? '0.08' : '0.03'})`,
                        opacity: circle3Anim,
                        transform: [
                            {
                                scale: circle3Anim.interpolate({
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

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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
                        }
                    ]}
                >
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }}
                    >
                        <Header onBackPress={() => navigation.navigate('OpeningScreen')} />
                    </Animated.View>
                    
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
                        <Text variant="title" style={styles.title}>Welcome back</Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            Sign in to continue your journey
                        </Text>
                    </Animated.View>

                    <Animated.View 
                        style={[
                            styles.formCard, 
                            { 
                                backgroundColor: colors.surface, 
                                borderColor: colors.borderLight,
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
                        {notice ? (
                            <View style={[
                                styles.noticeBox,
                                {
                                    backgroundColor: notice.type === 'error' ? '#FEE2E2' : '#DCFCE7',
                                    borderColor: notice.type === 'error' ? '#FCA5A5' : '#86EFAC',
                                },
                            ]}>
                                <Text style={{ color: notice.type === 'error' ? '#991B1B' : '#166534', fontSize: 12, fontWeight: '600' }}>
                                    {notice.text}
                                </Text>
                            </View>
                        ) : null}
                        <LoginForm
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            onLoginPress={async () => {
                                if (!email || !password) return;
                                setLoading(true);
                                try {
                                    const user = await login(email, password);
                                    const dest =
                                        user?.role === 'admin' ? 'AdminScreen' : 'NewsFeed';
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: dest }],
                                    });
                                } catch (error) {
                                    setNotice({ type: 'error', text: error.message || 'Failed to sign in.' });
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onRequestOtp={async () => {
                                if (!email) {
                                    setNotice({ type: 'error', text: 'Enter email or phone in the first field' });
                                    return;
                                }
                                try {
                                    await requestOtp(email);
                                    setNotice({ type: 'success', text: 'Code sent successfully.' });
                                } catch (error) {
                                    setNotice({ type: 'error', text: error.message || 'Failed to send code' });
                                }
                            }}
                            onVerifyOtp={async () => {
                                if (!email || !password) {
                                    setNotice({ type: 'error', text: 'Use first field for email/phone and second for OTP code' });
                                    return;
                                }
                                setLoading(true);
                                try {
                                    const session = await loginWithOtp(email, password);
                                    await setTokens(session.access, session.refresh);
                                    saveAuthSession(session);
                                    await bootstrap();
                                    const dest = session.user?.role === 'admin' ? 'AdminScreen' : 'NewsFeed';
                                    navigation.reset({ index: 0, routes: [{ name: dest }] });
                                } catch (error) {
                                    setNotice({ type: 'error', text: error.message || 'Failed to verify code' });
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            onForgotPasswordPress={() => navigation.navigate('ForgotPassword')}
                            onSocialPress={handleSocialLogin}
                            loadingProvider={loadingProvider}
                            loading={loading}
                        />
                    </Animated.View>

                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 50],
                                        outputRange: [0, 40],
                                    }),
                                },
                            ],
                        }}
                    >
                        <Footer onSignUpPress={() => navigation.navigate('SignUp')} />
                    </Animated.View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
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
    accentCircle3: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        top: height * 0.3,
        right: -50,
    },
    glowEffect: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: height * 0.2,
        left: width * 0.5 - 150,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        minHeight: '100%',
        justifyContent: 'space-between',
    },
    headerSection: {
        marginTop: 32,
        marginBottom: 32,
    },
    title: {
        marginBottom: 12,
    },
    subtitle: {
        lineHeight: 24,
    },
    formCard: {
        borderRadius: 24,
        padding: 28,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 1,
    },
    noticeBox: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
});

export default LoginScreen;
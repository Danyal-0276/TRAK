import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Platform, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from './components/Header';
import { SignUpForm } from './components/SignUpForm';
import { Footer } from './components/Footer';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Text from '../../components/ui/Text';
import { UserPlus } from 'lucide-react-native';
import { formatGoogleAuthError, getFirebaseIdTokenFromGoogle } from '../../auth/googleSignIn';
import { applyAuthSession } from '../../auth/applyAuthSession';
import { loginWithFirebase } from '../../utils/Service/api';
import { useFeedback } from '../../components/ui/FeedbackProvider';

const { width, height } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { success, error: showError } = useFeedback();
    const { colors } = theme;
    const { register, bootstrap } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [errors, setErrors] = useState({});
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
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
                Animated.timing(circle3Anim, {
                    toValue: 1,
                    duration: 1400,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        
        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email address';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const u = await register(email, password, confirmPassword);
            success('Account created — check your email for a verification code');
            if (u?.email_verified) {
                navigation.navigate('TagSelection', { fromSignup: true });
            } else {
                navigation.navigate('VerifyEmail', {
                    email: email.trim().toLowerCase(),
                    fromSignup: true,
                });
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignUp = async (provider) => {
        if (provider !== 'google') {
            showError('This sign-up method is not available yet.');
            return;
        }

        setLoadingProvider(provider);
        try {
            const firebaseIdToken = await getFirebaseIdTokenFromGoogle();
            const session = await loginWithFirebase(firebaseIdToken);
            if (!session?.access) {
                throw new Error('Server did not return a sign-up session');
            }
            await applyAuthSession(session);
            await bootstrap();
            success('Signed up with Google');
            navigation.reset({
                index: 0,
                routes: [{ name: 'TagSelection', params: { fromSignup: true } }],
            });
        } catch (error) {
            const message = formatGoogleAuthError(error);
            if (!/cancel/i.test(message)) {
                showError(message);
            }
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
                        <Header />
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
                                <UserPlus size={48} color={colors.primary} strokeWidth={2} />
                            </Animated.View>
                        </View>
                        <Text variant="title" style={styles.title}>Create account</Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            Sign up to start your journey
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
                        <SignUpForm
                            fullName={fullName}
                            setFullName={setFullName}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                            onSignUpPress={handleSignUp}
                            onSocialPress={handleSocialSignUp}
                            loading={loading}
                            loadingProvider={loadingProvider}
                            errors={errors}
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
                        <Footer onSignInPress={() => navigation.navigate('Login')} />
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
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 30,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
        minHeight: '100%',
        justifyContent: 'space-between',
    },
    headerSection: {
        marginTop: 32,
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        lineHeight: 24,
        textAlign: 'center',
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
});

export default SignUpScreen;
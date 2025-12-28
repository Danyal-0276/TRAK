import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Alert, ScrollView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from './components/Header';
import { SignUpForm } from './components/SignUpForm';
import { Footer } from './components/Footer';
import { mockAuthAPI } from './services/mockAuthAPI';
import { useTheme } from '../../theme/ThemeContext';
import Text from '../../components/ui/Text';

const SignUpScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [errors, setErrors] = useState({});
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

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
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
            const response = await mockAuthAPI.signUp({
                fullName,
                email,
                password,
                confirmPassword
            });

            console.log('Sign up successful:', response);
            
            Alert.alert(
                'Success!',
                'Account created successfully',
                [
                    {
                        text: 'Continue',
                        onPress: () => navigation.navigate('TagSelection')
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignUp = async (provider) => {
        setLoadingProvider(provider);
        
        try {
            const response = await mockAuthAPI.socialSignUp(provider);
            
            console.log(`${provider} sign up successful:`, response);
            
            Alert.alert(
                'Success!',
                `Signed up with ${provider}`,
                [
                    {
                        text: 'Continue',
                        onPress: () => navigation.navigate('TagSelection')
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <SafeAreaView style={[styles.safeContainer, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
            
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

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View style={[styles.contentWrapper, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Header onBackPress={() => navigation.navigate('OpeningScreen')} />
                    
                    <View style={styles.headerSection}>
                        <Text variant="title" style={styles.title}>Create account</Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>Sign up to start your journey</Text>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
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
                    </View>

                    <Footer onSignInPress={() => navigation.navigate('Login')} />
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
        marginTop: 16,
        marginBottom: 20,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        lineHeight: 20,
    },
    formCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
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
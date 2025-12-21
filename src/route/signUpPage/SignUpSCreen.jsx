import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { Header } from './components/Header';
import { SignUpForm } from './components/SignUpForm';
import { Footer } from './components/Footer';
import { mockAuthAPI } from './services/mockAuthAPI';
import colors from '../../utils/colors';

const SignUpScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [errors, setErrors] = useState({});

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
                    enabled={true}
                >
                    <View style={styles.contentWrapper}>
                        <Header onBackPress={() => navigation.navigate('OpeningScreen')} />
                        
                        <View style={styles.headerSection}>
                            <Text style={styles.title}>Create account</Text>
                            <Text style={styles.subtitle}>Sign up to start your journey</Text>
                        </View>

                        <View style={styles.formCard}>
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
        backgroundColor: 'rgba(37, 99, 235, 0.04)',
        top: -100,
        right: -100,
    },
    accentCircle2: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        backgroundColor: 'rgba(37, 99, 235, 0.03)',
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
        paddingTop: 8,
        paddingBottom: 16,
        justifyContent: 'space-between',
    },
    headerSection: {
        marginTop: 16,
        marginBottom: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 8,
        letterSpacing: -1.2,
    },
    subtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    formCard: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 20,
        marginBottom: 12,
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
});

export default SignUpScreen;
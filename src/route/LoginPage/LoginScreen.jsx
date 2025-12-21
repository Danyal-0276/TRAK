import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { Footer } from './components/Footer';
import colors from '../../utils/colors';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingProvider, setLoadingProvider] = useState(null);

    const handleSocialLogin = async (provider) => {
        setLoadingProvider(provider);
        
        try {
            console.log(`${provider} login initiated`);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            navigation.navigate('NewsFeed');
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to login with social provider');
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
                            <Text style={styles.title}>Welcome back</Text>
                            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                        </View>

                        <View style={styles.formCard}>
                            <LoginForm
                                email={email}
                                setEmail={setEmail}
                                password={password}
                                setPassword={setPassword}
                                onLoginPress={() => navigation.navigate('NewsFeed')}
                                onForgotPasswordPress={() => navigation.navigate('ForgotPassword')}
                                onSocialPress={handleSocialLogin}
                                loadingProvider={loadingProvider}
                            />
                        </View>

                        <Footer onSignUpPress={() => navigation.navigate('SignUp')} />
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
        paddingTop: 16,
        paddingBottom: 24,
        justifyContent: 'space-between',
    },
    headerSection: {
        marginTop: 32,
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
        fontWeight: '400',
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
});

export default LoginScreen;
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ScrollView, Platform, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { Footer } from './components/Footer';
import { useTheme } from '../../theme/ThemeContext';
import Text from '../../components/ui/Text';

const LoginScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loadingProvider, setLoadingProvider] = useState(null);
    
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
                        <Text variant="title" style={styles.title}>Welcome back</Text>
                        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>Sign in to continue your journey</Text>
                    </View>

                    <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
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
});

export default LoginScreen;
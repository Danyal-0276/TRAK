import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, StatusBar, Animated, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import WhiteLogo from '../../assets/images/whiteLogo.svg';
import { useTheme } from '../../theme/ThemeContext';
import Screen from '../../components/ui/Screen';
import Text from '../../components/ui/Text';

const { width } = Dimensions.get('window');

const OpeningScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const [signInLoading, setSignInLoading] = useState(false);
    const [createAccountLoading, setCreateAccountLoading] = useState(false);
    // Animation values
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoRotation = useRef(new Animated.Value(0)).current;
    const brandNameOpacity = useRef(new Animated.Value(0)).current;
    const brandNameTranslateY = useRef(new Animated.Value(20)).current;
    const welcomeOpacity = useRef(new Animated.Value(0)).current;
    const welcomeTranslateY = useRef(new Animated.Value(30)).current;
    const buttonContainerOpacity = useRef(new Animated.Value(0)).current;
    const buttonContainerTranslateY = useRef(new Animated.Value(20)).current;
    const pulseScale = useRef(new Animated.Value(1)).current;
    const circle1Scale = useRef(new Animated.Value(0)).current;
    const circle2Scale = useRef(new Animated.Value(0)).current;
    const circle3Scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Logo animation - scale, fade in, and subtle rotation
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(logoRotation, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation for logo glow
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseScale, {
                    toValue: 1.15,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseScale, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Decorative circles animation
        Animated.stagger(200, [
            Animated.spring(circle1Scale, {
                toValue: 1,
                tension: 30,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.spring(circle2Scale, {
                toValue: 1,
                tension: 30,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.spring(circle3Scale, {
                toValue: 1,
                tension: 30,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();

        // Brand name animation - fade in and slide up
        Animated.parallel([
            Animated.timing(brandNameOpacity, {
                toValue: 1,
                duration: 1000,
                delay: 400,
                useNativeDriver: true,
            }),
            Animated.spring(brandNameTranslateY, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Welcome section animation
        Animated.parallel([
            Animated.timing(welcomeOpacity, {
                toValue: 1,
                duration: 800,
                delay: 800,
                useNativeDriver: true,
            }),
            Animated.spring(welcomeTranslateY, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Buttons animation - slide up and fade in
        Animated.parallel([
            Animated.timing(buttonContainerOpacity, {
                toValue: 1,
                duration: 800,
                delay: 1100,
                useNativeDriver: true,
            }),
            Animated.spring(buttonContainerTranslateY, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: 1100,
                useNativeDriver: true,
            }),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const logoRotationInterpolate = logoRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.background} 
                translucent
            />

            {/* Enhanced Gradient Background */}
            <LinearGradient
                colors={theme.mode === 'dark' 
                    ? [colors.background, colors.backgroundSecondary, colors.background]
                    : ['#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#F1F5F9', '#F8FAFC', '#FFFFFF']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Decorative Animated Circles */}
            <Animated.View
                style={[
                    styles.decorativeCircle1,
                    {
                        transform: [{ scale: circle1Scale }],
                        backgroundColor: theme.mode === 'dark' 
                            ? 'rgba(129, 140, 248, 0.1)' 
                            : 'rgba(15, 23, 42, 0.03)',
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.decorativeCircle2,
                    {
                        transform: [{ scale: circle2Scale }],
                        backgroundColor: theme.mode === 'dark' 
                            ? 'rgba(139, 92, 246, 0.08)' 
                            : 'rgba(15, 23, 42, 0.02)',
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.decorativeCircle3,
                    {
                        transform: [{ scale: circle3Scale }],
                        backgroundColor: theme.mode === 'dark' 
                            ? 'rgba(99, 102, 241, 0.06)' 
                            : 'rgba(15, 23, 42, 0.015)',
                    },
                ]}
            />

            <View style={styles.contentContainer}>
                {/* Logo and Brand Section */}
                <Animated.View
                    style={[
                        styles.logoSection,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    {/* Glow effect behind logo */}
                    <Animated.View
                        style={[
                            styles.logoGlow,
                            {
                                transform: [{ scale: pulseScale }],
                                backgroundColor: theme.mode === 'dark'
                                    ? 'rgba(129, 140, 248, 0.2)'
                                    : 'rgba(15, 23, 42, 0.08)',
                            },
                        ]}
                    />
                    
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [{ rotate: logoRotationInterpolate }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={theme.mode === 'dark'
                                ? ['#818CF8', '#A78BFA', '#C084FC']
                                : [colors.primary, colors.primary, colors.primary]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoWrapper}
                        >
                            <WhiteLogo width={80} height={80} />
                        </LinearGradient>
                    </Animated.View>
                    
                    <Animated.Text
                        style={[
                            styles.brandName,
                            {
                                opacity: brandNameOpacity,
                                transform: [{ translateY: brandNameTranslateY }],
                                color: colors.textPrimary,
                            },
                        ]}
                    >
                        TRAK
                    </Animated.Text>
                    <Animated.Text
                        style={[
                            styles.tagline,
                            {
                                opacity: brandNameOpacity,
                                color: colors.textSecondary,
                            },
                        ]}
                    >
                        Your News, Your Way
                    </Animated.Text>
                </Animated.View>

                {/* Welcome and Action Section */}
                <Animated.View
                    style={[
                        styles.actionSection,
                        {
                            opacity: welcomeOpacity,
                            transform: [{ translateY: welcomeTranslateY }],
                        },
                    ]}
                >
                    <View style={styles.welcomeTextContainer}>
                        <View style={styles.titleContainer}>
                            <Text variant="title" style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
                                Get Started
                            </Text>
                            <View style={[styles.titleUnderline, { backgroundColor: theme.mode === 'dark' ? 'rgba(129, 140, 248, 0.3)' : 'rgba(15, 23, 42, 0.1)' }]} />
                        </View>
                        <Text variant="body" style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
                            Discover personalized news content{'\n'}
                            curated just for you
                        </Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.buttonContainer,
                            {
                                opacity: buttonContainerOpacity,
                                transform: [{ translateY: buttonContainerTranslateY }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={async () => {
                                if (signInLoading) return;
                                setSignInLoading(true);
                                try {
                                    // Simulate brief loading
                                    await new Promise(resolve => setTimeout(resolve, 800));
                                    navigation.navigate('Login');
                                } catch (error) {
                                    // Handle error
                                } finally {
                                    setSignInLoading(false);
                                }
                            }}
                            style={styles.primaryButtonWrapper}
                            disabled={signInLoading || createAccountLoading}
                        >
                            <LinearGradient
                                colors={theme.mode === 'dark'
                                    ? ['#818CF8', '#A78BFA', '#C084FC']
                                    : [colors.primary, colors.primary]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.primaryButton, 
                                    { 
                                        shadowColor: colors.shadow,
                                        opacity: (signInLoading || createAccountLoading) ? 0.7 : 1,
                                    }
                                ]}
                            >
                                {signInLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator 
                                            size="small" 
                                            color={colors.textInverse}
                                            style={styles.spinner}
                                        />
                                        <Text variant="button" style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                                            Loading...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text variant="button" style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                                        Sign In
                                    </Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={async () => {
                                if (createAccountLoading) return;
                                setCreateAccountLoading(true);
                                try {
                                    // Simulate brief loading
                                    await new Promise(resolve => setTimeout(resolve, 800));
                                    navigation.navigate('SignUp');
                                } catch (error) {
                                    // Handle error
                                } finally {
                                    setCreateAccountLoading(false);
                                }
                            }}
                            style={styles.secondaryButtonWrapper}
                            disabled={signInLoading || createAccountLoading}
                        >
                            <View style={[
                                styles.secondaryButton, 
                                { 
                                    borderColor: theme.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.4)' 
                                        : colors.borderDark || '#CBD5E1',
                                    backgroundColor: theme.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.15)' 
                                        : '#FFFFFF',
                                    opacity: (signInLoading || createAccountLoading) ? 0.7 : 1,
                                }
                            ]}>
                                {createAccountLoading ? (
                                    <View style={styles.loadingContainer}>
                                        <ActivityIndicator 
                                            size="small" 
                                            color={colors.textPrimary}
                                            style={styles.spinner}
                                        />
                                        <Text variant="button" style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
                                            Loading...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text variant="button" style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>
                                        Create Account
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
        paddingTop: 80,
        paddingBottom: 50,
        paddingHorizontal: 24,
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: -50,
        right: -50,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        top: 100,
        left: -30,
    },
    decorativeCircle3: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        bottom: 150,
        right: 20,
    },
    logoSection: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingTop: 40,
        position: 'relative',
    },
    logoGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: '50%',
        left: '50%',
        marginLeft: -100,
        marginTop: -100,
    },
    logoContainer: {
        marginBottom: 24,
        zIndex: 1,
    },
    logoWrapper: {
        width: 140,
        height: 140,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.35,
        shadowRadius: 25,
        elevation: 15,
    },
    brandName: {
        fontSize: 50,
        fontWeight: '900',
        letterSpacing: 12,
        marginBottom: 12,
        textTransform: 'uppercase',
        zIndex: 1,
    },
    tagline: {
        fontSize: 18,
        fontWeight: '500',
        letterSpacing: 1.2,
        marginTop: 8,
        zIndex: 1,
    },
    actionSection: {
        width: '100%',
        paddingBottom: 20,
    },
    welcomeTextContainer: {
        marginBottom: 50,
        alignItems: 'center',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    welcomeTitle: {
        fontSize: 34,
        fontWeight: '800',
        letterSpacing: -1,
        textAlign: 'center',
        marginBottom: 8,
    },
    titleUnderline: {
        width: 60,
        height: 4,
        borderRadius: 2,
        marginTop: 4,
    },
    welcomeSubtitle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        gap: 16,
        width: '100%',
    },
    primaryButtonWrapper: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    primaryButton: {
        width: '100%',
        paddingVertical: 19,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 12,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.6,
    },
    secondaryButtonWrapper: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
    },
    secondaryButton: {
        width: '100%',
        paddingVertical: 19,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5,
    },
    secondaryButtonText: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        marginRight: 10,
    },
});

export default OpeningScreen;
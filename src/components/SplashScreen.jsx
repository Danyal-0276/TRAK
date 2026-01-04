import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import WhiteLogo from '../assets/images/whiteLogo.svg';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish, isReady, onReady }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    // Animation values - start with visible content for immediate appearance
    const logoScale = useRef(new Animated.Value(0.8)).current; // Start at 0.8 instead of 0
    const logoOpacity = useRef(new Animated.Value(1)).current; // Start visible
    const brandNameOpacity = useRef(new Animated.Value(1)).current; // Start visible
    const brandNameTranslateY = useRef(new Animated.Value(0)).current; // Start at 0
    const pulseScale = useRef(new Animated.Value(1)).current;
    const fadeOut = useRef(new Animated.Value(1)).current;
    const hasNotifiedReady = useRef(false);

    useEffect(() => {
        // Start with subtle entrance animation - content is already visible
        // Logo scale animation (subtle bounce)
        Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Pulse animation (starts immediately)
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

        // Notify parent that splash screen is ready (rendered)
        // This allows hiding the native splash screen
        if (!hasNotifiedReady.current && onReady) {
            hasNotifiedReady.current = true;
            // Wait a bit to ensure component is fully mounted and rendered
            // Use multiple requestAnimationFrame calls to ensure it happens after render
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (onReady) {
                        onReady();
                    }
                });
            });
        }
    }, [onReady]);

    useEffect(() => {
        // Wait for app to be ready, then fade out
        if (isReady) {
            setTimeout(() => {
                Animated.timing(fadeOut, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    if (onFinish) {
                        onFinish();
                    }
                });
            }, 300);
        }
    }, [isReady, onFinish, fadeOut]);

    // Use the exact same color as native splash (black) for seamless transition
    const splashBackgroundColor = '#000000';
    
    return (
        <Animated.View 
            style={[
                styles.container, 
                { 
                    backgroundColor: splashBackgroundColor, // Match native splash exactly
                    opacity: fadeOut,
                }
            ]}
        >
            <StatusBar 
                barStyle="light-content" 
                backgroundColor={splashBackgroundColor} 
                translucent={false}
            />

            {/* Gradient Background - Black for splash screen */}
            <LinearGradient
                colors={[splashBackgroundColor, splashBackgroundColor, splashBackgroundColor]} // Black background
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Animated Glow Effect */}
            <Animated.View
                style={[
                    styles.glowEffect,
                    {
                        transform: [{ scale: pulseScale }],
                        backgroundColor: theme.mode === 'dark'
                            ? 'rgba(129, 140, 248, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                    },
                ]}
            />

            {/* Logo Container */}
            <View style={styles.logoContainer}>
                {/* Glow effect behind logo */}
                <Animated.View
                    style={[
                        styles.logoGlow,
                        {
                            transform: [{ scale: pulseScale }],
                            backgroundColor: theme.mode === 'dark'
                                ? 'rgba(129, 140, 248, 0.2)'
                                : 'rgba(255, 255, 255, 0.1)',
                        },
                    ]}
                />
                
                <Animated.View
                    style={[
                        styles.logoWrapper,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
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
                        style={styles.logoGradient}
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
                            color: colors.textInverse,
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
                            color: colors.textInverse,
                        },
                    ]}
                >
                    Your News, Your Way
                </Animated.Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowEffect: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    logoContainer: {
        alignItems: 'center',
        zIndex: 1,
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
    logoWrapper: {
        marginBottom: 24,
        zIndex: 1,
    },
    logoGradient: {
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
        opacity: 0.95,
    },
});

export default SplashScreen;


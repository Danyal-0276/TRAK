import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import TrakLogo from './TrakLogo';

const SplashScreen = ({ onFinish, isReady, onReady }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';

    const logoScale = useRef(new Animated.Value(0.8)).current;
    const pulseScale = useRef(new Animated.Value(1)).current;
    const fadeOut = useRef(new Animated.Value(1)).current;
    const hasNotifiedReady = useRef(false);

    const splashBackgroundColor = colors.background;

    useEffect(() => {
        Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseScale, {
                    toValue: 1.08,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseScale, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        if (!hasNotifiedReady.current && onReady) {
            hasNotifiedReady.current = true;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    onReady?.();
                });
            });
        }
    }, [onReady, logoScale, pulseScale]);

    useEffect(() => {
        if (isReady) {
            const timer = setTimeout(() => {
                Animated.timing(fadeOut, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }).start(() => {
                    onFinish?.();
                });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isReady, onFinish, fadeOut]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: splashBackgroundColor,
                    opacity: fadeOut,
                },
            ]}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={splashBackgroundColor}
                translucent={false}
            />

            <Animated.View
                style={[
                    styles.glowEffect,
                    {
                        transform: [{ scale: pulseScale }],
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    },
                ]}
            />

            <View style={styles.logoContainer}>
                <Animated.View
                    style={[
                        styles.logoGlow,
                        {
                            transform: [{ scale: pulseScale }],
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                        },
                    ]}
                />

                <Animated.View
                    style={{
                        transform: [{ scale: logoScale }],
                        marginBottom: 20,
                    }}
                >
                    <TrakLogo size={96} />
                </Animated.View>

                <Animated.Text style={[styles.brandName, { color: colors.textPrimary }]}>
                    TRAK
                </Animated.Text>
                <Animated.Text style={[styles.tagline, { color: colors.textSecondary }]}>
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
        width: 240,
        height: 240,
        borderRadius: 120,
    },
    logoContainer: {
        alignItems: 'center',
        zIndex: 1,
    },
    logoGlow: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        top: 20,
    },
    brandName: {
        fontSize: 44,
        fontWeight: '900',
        letterSpacing: 10,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    tagline: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.8,
        marginTop: 4,
    },
});

export default SplashScreen;

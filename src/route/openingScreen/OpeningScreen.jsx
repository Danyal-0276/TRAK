import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Animated,
} from 'react-native';
import WhiteLogo from '../../assets/images/whiteLogo.svg';
import colors from '../../utils/colors';

const OpeningScreen = ({ navigation }) => {
    // Animation values
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const brandNameOpacity = useRef(new Animated.Value(0)).current;
    const brandNameTranslateY = useRef(new Animated.Value(20)).current;
    const welcomeOpacity = useRef(new Animated.Value(0)).current;
    const welcomeTranslateY = useRef(new Animated.Value(30)).current;
    const buttonContainerOpacity = useRef(new Animated.Value(0)).current;
    const buttonContainerTranslateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Logo animation - scale and fade in
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Brand name animation - fade in and slide up
        Animated.parallel([
            Animated.timing(brandNameOpacity, {
                toValue: 1,
                duration: 800,
                delay: 300,
                useNativeDriver: true,
            }),
            Animated.spring(brandNameTranslateY, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Welcome section animation
        Animated.parallel([
            Animated.timing(welcomeOpacity, {
                toValue: 1,
                duration: 600,
                delay: 600,
                useNativeDriver: true,
            }),
            Animated.spring(welcomeTranslateY, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Buttons animation - slide up and fade in
        Animated.parallel([
            Animated.timing(buttonContainerOpacity, {
                toValue: 1,
                duration: 700,
                delay: 900,
                useNativeDriver: true,
            }),
            Animated.spring(buttonContainerTranslateY, {
                toValue: 0,
                tension: 50,
                friction: 8,
                delay: 900,
                useNativeDriver: true,
            }),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.fullContainer}>
            <StatusBar barStyle="light-content" backgroundColor={colors.textPrimary} />

            {/* Black Background Section - Top Half */}
            <View style={styles.topSection}>
                <View style={styles.logoContainer}>
                    <Animated.View
                        style={{
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        }}
                    >
                        <WhiteLogo width={140} height={140} />
                    </Animated.View>
                    <Animated.Text
                        style={[
                            styles.brandName,
                            {
                                opacity: brandNameOpacity,
                                transform: [{ translateY: brandNameTranslateY }],
                            },
                        ]}
                    >
                        TRAK
                    </Animated.Text>
                </View>
            </View>

            {/* White Bottom Section - Bottom Half */}
            <View style={styles.bottomSection}>
                <View style={styles.contentWrapper}>
                    {/* Welcome Text */}
                    <Animated.View
                        style={[
                            styles.welcomeSection,
                            {
                                opacity: welcomeOpacity,
                                transform: [{ translateY: welcomeTranslateY }],
                            },
                        ]}
                    >
                        <Text style={styles.welcomeTitle}>Welcome</Text>
                        <Text style={styles.welcomeSubtitle}>
                            A world of exceptional news{'\n'}
                            with TRAK news core...
                        </Text>
                    </Animated.View>

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
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.primaryButtonText}>Sign In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('SignUp')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.secondaryButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: colors.textPrimary,
    },
    topSection: {
        flex: 1,
        backgroundColor: colors.textPrimary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    logoContainer: {
        alignItems: 'center',
    },
    brandName: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.surface,
        letterSpacing: 14,
        marginTop: 20,
        textTransform: 'uppercase',
    },
    bottomSection: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 50,
        flex: 1,
        justifyContent: 'center',
    },
    contentWrapper: {
        flex: 1,
        justifyContent: 'center',
    },
    welcomeSection: {
        marginBottom: 40,
        alignItems: 'flex-start',
    },
    welcomeTitle: {
        fontSize: 38,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
        textAlign: 'left',
        letterSpacing: -0.5,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'left',
        lineHeight: 24,
        fontWeight: '400',
    },
    buttonContainer: {
        gap: 16,
    },
    primaryButton: {
        backgroundColor: colors.textPrimary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: colors.shadowDark,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    primaryButtonText: {
        color: colors.surface,
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
});

export default OpeningScreen;
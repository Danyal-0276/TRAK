import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, StatusBar, Animated } from 'react-native';
import WhiteLogo from '../../assets/images/whiteLogo.svg';
import { useTheme } from '../../theme/ThemeContext';
import Screen from '../../components/ui/Screen';
import Text from '../../components/ui/Text';
import Button from '../../components/ui/Button';

const OpeningScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
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
        <Screen gradient>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.primary} 
            />

            {/* Primary Background Section - Top Half */}
            <View style={[styles.topSection, { backgroundColor: colors.primary }]}>
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
                                color: colors.textInverse,
                            },
                        ]}
                    >
                        TRAK
                    </Animated.Text>
                </View>
            </View>

            {/* Surface Background Section - Bottom Half */}
            <View style={[styles.bottomSection, { backgroundColor: colors.surface }]}>
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
                        <Text variant="title" style={[styles.welcomeTitle, { color: colors.textPrimary }]}>Welcome</Text>
                        <Text variant="body" style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
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
                        <Button
                            title="Sign In"
                            variant="primary"
                            primaryColors={[colors.primary, colors.primary]}
                            onPress={() => navigation.navigate('Login')}
                        />
                        <Button title="Create Account" variant="outline" onPress={() => navigation.navigate('SignUp')} />
                    </Animated.View>
                </View>
            </View>
        </Screen>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
    },
    topSection: {
        flex: 1,
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
        letterSpacing: 14,
        marginTop: 20,
        textTransform: 'uppercase',
    },
    bottomSection: {
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
        marginBottom: 16,
        textAlign: 'left',
    },
    welcomeSubtitle: {
        fontSize: 16,
        textAlign: 'left',
        lineHeight: 24,
        fontWeight: '400',
    },
    buttonContainer: {
        gap: 16,
    },
    primaryButton: {},
    primaryButtonText: {},
    secondaryButton: {},
    secondaryButtonText: {},
});

export default OpeningScreen;
// src/route/Login/useAnimated.js
import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Custom hook for login screen animations
 * @returns {Object} - Animation values and control functions
 */
export const useLoginAnimation = () => {
    // Animated values
    const containerOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslateY = useRef(new Animated.Value(50)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Entrance animation sequence
        const entranceAnimation = Animated.parallel([
            // Fade in the main container
            Animated.timing(containerOpacity, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),

            // Slide up the card
            Animated.timing(cardTranslateY, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }),

            // Scale up the logo
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 1000,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
        ]);

        // Start entrance animation
        entranceAnimation.start();

        // Logo pulse animation that starts after entrance
        const logoPulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(logoScale, {
                    toValue: 1.05,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 2000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        // Start pulse animation after entrance completes
        const pulseTimer = setTimeout(() => {
            logoPulseAnimation.start();
        }, 1000);

        // Cleanup function
        return () => {
            clearTimeout(pulseTimer);
            logoPulseAnimation.stop();
            entranceAnimation.stop();
        };
    }, [containerOpacity, cardTranslateY, logoScale]);

    /**
     * Button press in animation
     */
    const onButtonPressIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.95,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    /**
     * Button press out animation
     */
    const onButtonPressOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    return {
        containerOpacity,
        cardTranslateY,
        logoScale,
        buttonScale,
        onButtonPressIn,
        onButtonPressOut,
    };
};

/**
 * Custom hook for input focus animations
 * @returns {Object} - Animation values and control functions
 */
export const useInputAnimation = () => {
    const focusAnimation = useRef(new Animated.Value(0)).current;
    const shakeAnimation = useRef(new Animated.Value(0)).current;

    const animateFocus = () => {
        Animated.timing(focusAnimation, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false, // We might animate border color or shadow
        }).start();
    };

    const animateBlur = () => {
        Animated.timing(focusAnimation, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    };

    const animateError = () => {
        shakeAnimation.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: -10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const borderColor = focusAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['#D4F0F3', '#05C9B7'],
    });

    const translateX = shakeAnimation;

    return {
        focusAnimation,
        borderColor,
        translateX,
        animateFocus,
        animateBlur,
        animateError,
    };
};

/**
 * Custom hook for loading animations
 * @returns {Object} - Animation values and control functions
 */
export const useLoadingAnimation = () => {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    const startLoadingAnimation = () => {
        const animateDot = (dot, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(dot, {
                        toValue: 1,
                        duration: 600,
                        delay,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0.3,
                        duration: 600,
                        easing: Easing.inOut(Easing.sin),
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        Animated.parallel([
            animateDot(dot1, 0),
            animateDot(dot2, 200),
            animateDot(dot3, 400),
        ]).start();
    };

    const stopLoadingAnimation = () => {
        dot1.stopAnimation();
        dot2.stopAnimation();
        dot3.stopAnimation();
    };

    return {
        dot1,
        dot2,
        dot3,
        startLoadingAnimation,
        stopLoadingAnimation,
    };
};

/**
 * Custom hook for social button hover animations
 * @returns {Object} - Animation values and control functions
 */
export const useSocialButtonAnimation = () => {
    const scaleValue = useRef(new Animated.Value(1)).current;

    const onPressIn = () => {
        Animated.spring(scaleValue, {
            toValue: 0.95,
            tension: 400,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const onPressOut = () => {
        Animated.spring(scaleValue, {
            toValue: 1,
            tension: 400,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    return {
        scaleValue,
        onPressIn,
        onPressOut,
    };
};
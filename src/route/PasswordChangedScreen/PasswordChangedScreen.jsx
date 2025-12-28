import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import TextComponent from '../../components/ui/Text';

const PasswordChangedScreen = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, scaleAnim]);

    const handleBackToLogin = () => {
        // Clear the navigation stack and navigate to Login
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Login' }
                ],
            })
        );
    };

    return (
        <View style={[styles.fullContainer, { backgroundColor: colors.background }]}>
            <StatusBar 
                barStyle={theme.mode === 'dark' ? 'light-content' : 'dark-content'} 
                backgroundColor={colors.background} 
            />
            
            {/* Subtle gradient background */}
            <LinearGradient
                colors={[colors.background, colors.backgroundSecondary, colors.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientBackground}
            />
            
            {/* Decorative accent circles */}
            <View style={[styles.accentCircle1, { backgroundColor: `${colors.info}0A` }]} />
            <View style={[styles.accentCircle2, { backgroundColor: `${colors.info}08` }]} />

            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Animated.View
                        style={[
                            styles.messageContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }]
                            }
                        ]}
                    >
                        <View style={[styles.checkmarkContainer, { 
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary
                        }]}>
                            <Text style={[styles.checkmark, { color: colors.textInverse }]}>✓</Text>
                        </View>

                        <TextComponent variant="title" color={colors.textPrimary} style={styles.title}>Password changed</TextComponent>
                        <TextComponent variant="body" color={colors.textSecondary} style={styles.subtitle}>
                            Your password has been changed successfully.
                        </TextComponent>
                    </Animated.View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.primaryButton, { 
                                backgroundColor: colors.primary,
                                shadowColor: colors.primary
                            }]}
                            onPress={handleBackToLogin}
                        >
                            <TextComponent variant="button" color={colors.textInverse} style={styles.primaryButtonText}>Back to login</TextComponent>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
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
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmarkContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    checkmark: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 40,
        fontWeight: '800',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: -1.2,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 30,
    },
    primaryButton: {
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    primaryButtonText: {
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});

export default PasswordChangedScreen;
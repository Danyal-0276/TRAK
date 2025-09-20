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
import { CommonActions } from '@react-navigation/native';

const PasswordChangedScreen = ({ navigation }) => {
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
                    <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark}>✓</Text>
                    </View>

                    <Text style={styles.title}>Password changed</Text>
                    <Text style={styles.subtitle}>
                        Your password has been changed successfully.
                    </Text>
                </Animated.View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleBackToLogin}
                    >
                        <Text style={styles.primaryButtonText}>Back to login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    checkmark: {
        color: '#fff',
        fontSize: 40,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
        textAlign: 'center',
    },
    buttonContainer: {
        paddingBottom: 30,
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PasswordChangedScreen;
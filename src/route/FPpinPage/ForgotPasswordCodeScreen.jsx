import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
const ForgotPasswordCodeScreen = ({ navigation, route }) => {
    const [code, setCode] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(20);
    const inputRefs = useRef([]);

    const { email } = route.params || {};

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCodeChange = (text, index) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto focus next input
        if (text && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace
        if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const renderKeypad = () => {
        const keys = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['', '0', '⌫'],
        ];

        return (
            <View style={styles.keypadContainer}>
                {keys.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.keypadRow}>
                        {row.map((key, keyIndex) => (
                            <TouchableOpacity
                                key={keyIndex}
                                style={[styles.keypadButton, key === '' && styles.emptyKey]}
                                onPress={() => handleKeypadPress(key)}
                                disabled={key === ''}
                            >
                                <Text style={styles.keypadText}>{key}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        );
    };

    const handleKeypadPress = (key) => {
        if (key === '⌫') {
            // Handle backspace
            const lastFilledIndex = code.findLastIndex(digit => digit !== '');
            if (lastFilledIndex >= 0) {
                const newCode = [...code];
                newCode[lastFilledIndex] = '';
                setCode(newCode);
                inputRefs.current[lastFilledIndex].focus();
            }
        } else {
            // Handle number input
            const firstEmptyIndex = code.findIndex(digit => digit === '');
            if (firstEmptyIndex >= 0) {
                const newCode = [...code];
                newCode[firstEmptyIndex] = key;
                setCode(newCode);

                if (firstEmptyIndex < 3) {
                    inputRefs.current[firstEmptyIndex + 1].focus();
                }
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>‹</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Please check your email</Text>
                <Text style={styles.subtitle}>
                    We've sent a code to {email || 'hello@trak.com'}
                </Text>

                <View style={styles.formContainer}>
                    <View style={styles.codeInputContainer}>
                        {code.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                style={styles.codeInput}
                                value={digit}
                                onChangeText={(text) => handleCodeChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                maxLength={1}
                                keyboardType="numeric"
                                textAlign="center"
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('ResetPassword')}
                    >
                        <Text style={styles.primaryButtonText}>Verify</Text>
                    </TouchableOpacity>

                    <Text style={styles.resendText}>
                        Send code again {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : ''}
                    </Text>

                    {renderKeypad()}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Remember password? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Log in</Text>
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
        paddingTop: 20,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 10,
        marginBottom: 20,
    },
    backButtonText: {
        fontSize: 24,
        color: '#000',
        fontWeight: '300',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
        marginBottom: 40,
    },
    formContainer: {
        flex: 1,
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 30,
    },
    codeInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        backgroundColor: '#fff',
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resendText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 30,
    },
    keypadContainer: {
        flex: 1,
        justifyContent: 'center',
        maxHeight: 300,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    keypadButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyKey: {
        backgroundColor: 'transparent',
    },
    keypadText: {
        fontSize: 24,
        fontWeight: '400',
        color: '#000',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 30,
    },
    footerText: {
        color: '#666',
        fontSize: 14,
    },
    linkText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ForgotPasswordCodeScreen;
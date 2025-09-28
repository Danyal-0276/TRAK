import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import WhiteLogo from '../../assets/images/whiteLogo.svg';

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
        <View style={styles.fullContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <SafeAreaView style={styles.safeContainer}>
                {/* Black Background Section - Minimal for code screen */}
                <View style={styles.blackSection}>
                    {/* Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Logo Section - Small */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <WhiteLogo width={50} height={50} />
                            <Text style={styles.brandName}>TRAK</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* White Bottom Section with Form */}
            <View style={styles.bottomSection}>
                <View style={styles.contentWrapper}>
                    <View style={styles.headerContent}>
                        <Text style={styles.title}>Please check your email</Text>
                        <Text style={styles.subtitle}>
                            We've sent a code to {email || 'hello@trak.com'}
                        </Text>
                    </View>

                    <View style={styles.mainContent}>
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

                        <TouchableOpacity disabled={timer > 0}>
                            <Text style={[styles.resendText, timer > 0 && styles.disabledText]}>
                                {timer > 0 
                                    ? `Send code again 00:${timer.toString().padStart(2, '0')}`
                                    : 'Send code again'
                                }
                            </Text>
                        </TouchableOpacity>

                        {renderKeypad()}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Remember password? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeContainer: {
        backgroundColor: '#000',
        paddingBottom: 0,
    },
    blackSection: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingBottom: 15,
        height: 140, // Much smaller for PIN screen
    },
    header: {
        paddingTop: 10,
        paddingBottom: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    brandName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 3,
        marginTop: 6,
    },
    bottomSection: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 20,
    },
    headerContent: {
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        lineHeight: 20,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    codeInput: {
        width: 55,
        height: 55,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        backgroundColor: '#f8f9fa',
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    resendText: {
        textAlign: 'center',
        color: '#000',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 15,
    },
    disabledText: {
        color: '#666',
    },
    keypadContainer: {
        alignItems: 'center',
        marginBottom: 15,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 200,
        marginBottom: 12,
    },
    keypadButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    emptyKey: {
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    keypadText: {
        fontSize: 20,
        fontWeight: '400',
        color: '#000',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
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
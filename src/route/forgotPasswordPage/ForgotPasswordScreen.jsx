import React, { useState } from 'react';
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

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    return (
        <View style={styles.fullContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <SafeAreaView style={styles.safeContainer}>
                {/* Black Background Section */}
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

                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <WhiteLogo width={80} height={80} />
                            <Text style={styles.brandName}>TRAK</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* White Bottom Section with Form */}
            <View style={styles.bottomSection}>
                <View style={styles.contentWrapper}>
                    <Text style={styles.title}>Forgot password?</Text>
                    <Text style={styles.subtitle}>
                        Don't worry! It happens. Please enter the email associated with your account.
                    </Text>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email address"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('ForgotPasswordCode', { email })}
                        >
                            <Text style={styles.primaryButtonText}>Send code</Text>
                        </TouchableOpacity>
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
        paddingBottom: 20,
        height: 200,
    },
    header: {
        paddingTop: 10,
        paddingBottom: 15,
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 3,
        marginTop: 8,
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
        paddingTop: 30,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
        textAlign: 'left',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        lineHeight: 22,
        marginBottom: 30,
    },
    formContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 25,
    },
    label: {
        fontSize: 14,
        color: '#000',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#f8f9fa',
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 16,
        borderRadius: 25,
        alignItems: 'center',
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

export default ForgotPasswordScreen;
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

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.fullContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <SafeAreaView style={styles.safeContainer}>
                {/* Black Background Section - Smaller */}
                <View style={styles.blackSection}>
                    {/* Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => navigation.navigate('OpeningScreen')}
                        >
                            <ChevronLeft size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Logo Section - Smaller */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <WhiteLogo width={80} height={80} />
                            <Text style={styles.brandName}>TRAK</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* White Bottom Section with Form - No Scroll */}
            <View style={styles.bottomSection}>
                <View style={styles.contentWrapper}>
                    <Text style={styles.title}>Log in</Text>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="hello@trak.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.primaryButton} 
                            onPress={() => navigation.navigate('NewsFeed')}
                        >
                            <Text style={styles.primaryButtonText}>Log in</Text>
                        </TouchableOpacity>

                        <Text style={styles.dividerText}>Or Login with</Text>

                        <View style={styles.socialButtons}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialButtonText}>f</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialButtonText}>G</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialButtonText}>🍎</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                            <Text style={styles.linkText}>Sign up</Text>
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
        height: 220, // Fixed height, slightly larger than SignUp since less content below
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
        fontSize: 20, // Slightly smaller
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
        fontSize: 28, // Keep original size since shorter title
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 25,
        textAlign: 'left',
    },
    formContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 18, // Slightly reduced
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
        paddingVertical: 14, // Slightly smaller
        fontSize: 16,
        color: '#000',
        backgroundColor: '#f8f9fa',
    },
    forgotText: {
        color: '#000',
        fontSize: 14,
        textAlign: 'right',
        marginBottom: 20, // Reduced
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 16, // Slightly smaller
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 25, // Reduced
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
    dividerText: {
        textAlign: 'center',
        color: '#666',
        fontSize: 14,
        marginBottom: 18, // Reduced
    },
    socialButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        marginBottom: 15, // Reduced
    },
    socialButton: {
        width: 45, // Slightly smaller
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    socialButtonText: {
        fontSize: 16, // Slightly smaller
        fontWeight: 'bold',
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

export default LoginScreen;
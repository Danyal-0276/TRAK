import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './components/Header';
import { LogoSection } from './components/LogoSection';
import { SignUpForm } from './components/SignUpForm';
import { Footer } from './components/Footer';
import { mockAuthAPI } from './services/mockAuthAPI';

const SignUpScreen = ({ navigation }) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email address';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await mockAuthAPI.signUp({
                fullName,
                email,
                password,
                confirmPassword
            });

            console.log('Sign up successful:', response);
            
            Alert.alert(
                'Success!',
                'Account created successfully',
                [
                    {
                        text: 'Continue',
                        onPress: () => navigation.navigate('TagSelection')
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignUp = async (provider) => {
        setLoadingProvider(provider);
        
        try {
            const response = await mockAuthAPI.socialSignUp(provider);
            
            console.log(`${provider} sign up successful:`, response);
            
            Alert.alert(
                'Success!',
                `Signed up with ${provider}`,
                [
                    {
                        text: 'Continue',
                        onPress: () => navigation.navigate('TagSelection')
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoadingProvider(null);
        }
    };

    return (
        <View style={styles.fullContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.blackSection}>
                    <Header onBackPress={() => navigation.navigate('OpeningScreen')} />
                    <LogoSection />
                </View>
            </SafeAreaView>

            <View style={styles.bottomSection}>
                <View style={styles.contentWrapper}>
                    <Text style={styles.title}>Create account</Text>

                    <SignUpForm
                        fullName={fullName}
                        setFullName={setFullName}
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        onSignUpPress={handleSignUp}
                        onSocialPress={handleSocialSignUp}
                        loading={loading}
                        loadingProvider={loadingProvider}
                        errors={errors}
                    />

                    <Footer onSignInPress={() => navigation.navigate('Login')} />
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
    bottomSection: {
        flex: 1,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 25,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'left',
    },
});

export default SignUpScreen;
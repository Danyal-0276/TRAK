// src/route/Login/Login.jsx
import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Animated, // Add this import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '@react-native-vector-icons/feather';
// ✅ reverted
import { styles } from './styles';
import { validateEmail, validatePassword, sanitizeInput } from './helper';
import { useLoginAnimation } from './useAnimated';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const passwordInputRef = useRef(null);

    // Use animations
    const {
        containerOpacity,
        cardTranslateY,
        logoScale,
        buttonScale,
        onButtonPressIn,
        onButtonPressOut,
    } = useLoginAnimation();

    const handleEmailChange = (text) => {
        const sanitizedText = sanitizeInput(text);
        setEmail(sanitizedText);
        if (emailError) setEmailError('');
    };

    const handlePasswordChange = (text) => {
        setPassword(text);
        if (passwordError) setPasswordError('');
    };

    const handleLogin = async () => {
        // Validate inputs
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        if (!emailValidation.isValid) {
            setEmailError(emailValidation.error);
            return;
        }

        if (!passwordValidation.isValid) {
            setPasswordError(passwordValidation.error);
            return;
        }

        setIsLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Success - navigate to main app
            Alert.alert('Success', 'Login successful!');
            // navigation.navigate('Home');
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        Alert.alert('Forgot Password', 'Password reset link sent to your email!');
        // navigation.navigate('ForgotPassword');
    };

    const handleSocialLogin = (provider) => {
        Alert.alert('Social Login', `${provider} login coming soon!`);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#BEE1E6" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Background Gradient */}
                    <View style={styles.backgroundGradient} />

                    {/* Animated Container */}
                    <Animated.View style={[styles.animatedContainer, { opacity: containerOpacity }]}>

                        {/* Logo Section */}
                        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
                            <View style={styles.logoWrapper}>
                                <Icon name="shield" size={40} color="#05C9B7" />
                            </View>
                            <Text style={styles.logoText}>Welcome Back</Text>
                            <Text style={styles.subTitle}>Sign in to continue</Text>
                        </Animated.View>

                        {/* Login Card */}
                        <Animated.View style={[styles.card, { transform: [{ translateY: cardTranslateY }] }]}>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={[styles.inputWrapper, emailError ? styles.inputError : null]}>
                                    <Icon name="mail" size={20} color="#617479" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#617479"
                                        value={email}
                                        onChangeText={handleEmailChange}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        returnKeyType="next"
                                        onSubmitEditing={() => passwordInputRef.current?.focus()}
                                    />
                                </View>
                                {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={[styles.inputWrapper, passwordError ? styles.inputError : null]}>
                                    <Icon name="lock" size={20} color="#617479" style={styles.inputIcon} />
                                    <TextInput
                                        ref={passwordInputRef}
                                        style={styles.textInput}
                                        placeholder="Enter your password"
                                        placeholderTextColor="#617479"
                                        value={password}
                                        onChangeText={handlePasswordChange}
                                        secureTextEntry={!showPassword}
                                        returnKeyType="done"
                                        onSubmitEditing={handleLogin}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                        testID="password-toggle"
                                    >
                                        <Icon
                                            name={showPassword ? 'eye-off' : 'eye'}
                                            size={20}
                                            color="#617479"
                                        />
                                    </TouchableOpacity>
                                </View>
                                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
                            </View>

                            {/* Forgot Password */}
                            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotContainer}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                                <TouchableOpacity
                                    style={[
                                        styles.loginButton,
                                        isLoading ? styles.loginButtonLoading : null
                                    ]}
                                    onPress={handleLogin}
                                    onPressIn={onButtonPressIn}
                                    onPressOut={onButtonPressOut}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <View style={styles.loadingContainer}>
                                            <View style={styles.loadingDot} />
                                            <View style={[styles.loadingDot, styles.loadingDotDelay1]} />
                                            <View style={[styles.loadingDot, styles.loadingDotDelay2]} />
                                        </View>
                                    ) : (
                                        <Text style={styles.loginButtonText}>Sign In</Text>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or continue with</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Social Login Buttons */}
                            <View style={styles.socialContainer}>
                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('Google')}
                                >
                                    <Icon name="chrome" size={20} color="#617479" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('Apple')}
                                >
                                    <Icon name="smartphone" size={20} color="#617479" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.socialButton}
                                    onPress={() => handleSocialLogin('Facebook')}
                                >
                                    <Icon name="facebook" size={20} color="#617479" />
                                </TouchableOpacity>
                            </View>

                            {/* Sign Up Link */}
                            <View style={styles.signupContainer}>
                                <Text style={styles.signupText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => Alert.alert('Sign Up', 'Navigate to Sign Up')}>
                                    <Text style={styles.signupLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>

                        </Animated.View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default Login;
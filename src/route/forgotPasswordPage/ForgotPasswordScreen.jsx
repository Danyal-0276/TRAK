import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
} from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

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

                <Text style={styles.title}>Forgot password?</Text>
                <Text style={styles.subtitle}>
                    Don't worry! It happens. Please enter the email associated with your account.
                </Text>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email address"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fff',
        marginBottom: 30,
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

export default ForgotPasswordScreen;
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';

const ResetPasswordScreen = ({ navigation }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleResetPassword = () => {
        // Validate passwords
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        // TODO: Add your password reset API call here
        // try {
        //     await resetPasswordAPI(newPassword);
        //     navigation.navigate('PasswordChanged');
        // } catch (error) {
        //     Alert.alert('Error', 'Failed to reset password. Please try again.');
        // }

        // For now, just navigate to PasswordChanged screen
        navigation.navigate('PasswordChanged');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>‹</Text>
                    </TouchableOpacity>

                    <Text style={styles.title}>Reset password</Text>
                    <Text style={styles.subtitle}>
                        Please type something you'll remember
                    </Text>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="must be 8 characters"
                                placeholderTextColor="#999"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm new password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="repeat password"
                                placeholderTextColor="#999"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={handleResetPassword}
                        >
                            <Text style={styles.primaryButtonText}>Reset password</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        flexGrow: 1,
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
    inputGroup: {
        marginBottom: 20,
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
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fff',
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
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

export default ResetPasswordScreen;
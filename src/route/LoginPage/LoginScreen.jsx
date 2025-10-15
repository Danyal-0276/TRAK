import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from './components/Header';
import { LogoSection } from './components/LogoSection';
import { LoginForm } from './components/LoginForm';
import { Footer } from './components/Footer';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
                    <Text style={styles.title}>Log in</Text>

                    <LoginForm
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        onLoginPress={() => navigation.navigate('NewsFeed')}
                        onForgotPasswordPress={() => navigation.navigate('ForgotPassword')}
                    />

                    <Footer onSignUpPress={() => navigation.navigate('SignUp')} />
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
        height: 220,
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
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 25,
        textAlign: 'left',
    },
});

export default LoginScreen;
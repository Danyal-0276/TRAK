import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import BlackLogo from '../../assets/images/blackLogo.svg';
import WhiteLogo from '../../assets/images/whiteLogo.svg';
import { SafeAreaView } from 'react-native-safe-area-context'; 

const OpeningScreen = ({ navigation }) => {
    return (
        <View style={styles.fullContainer}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            
            <SafeAreaView style={styles.safeContainer}>
                {/* Black Background Section */}
                <View style={styles.blackSection}>
                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            {/* Use WhiteLogo for black background */}
                            <WhiteLogo width={150} height={150} />
                            {/* TRAK Brand Name */}
                            <Text style={styles.brandName}>TRAK</Text>
                        </View>
                    </View>
                </View>
            </SafeAreaView>

            {/* White Bottom Section - Outside SafeAreaView to extend to bottom */}
            <View style={styles.bottomSection}>
                <View style={styles.contentWrapper}>
                    {/* Welcome Text */}
                    <View style={styles.welcomeSection}>
                        <Text style={styles.welcomeTitle}>Welcome</Text>
                        <Text style={styles.welcomeSubtitle}>
                            A world of exceptional news{'\n'}with TRAK news core...
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.primaryButtonText}>login</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('SignUp')}
                        >
                            <Text style={styles.secondaryButtonText}>Sign up</Text>
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
        flex: 1,
        backgroundColor: '#000',
    },
    blackSection: {
        flex: 1,
        backgroundColor: '#000',
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    logoSection: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    brandName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 4,
        marginTop: 15,
    },
    bottomSection: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingBottom: 50, // Extra padding for devices with home indicator
        minHeight: '40%', // Ensure minimum height
    },
    contentWrapper: {
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 20,
    },
    welcomeSection: {
        marginBottom: 30,
        alignItems: 'flex-start',
    },
    welcomeTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 15,
        textAlign: 'left',
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#000',
        textAlign: 'left',
        lineHeight: 24,
        opacity: 0.8,
    },
    buttonContainer: {
        gap: 15,
    },
    primaryButton: {
        backgroundColor: '#000',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 18,
        borderRadius: 25,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    secondaryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OpeningScreen;
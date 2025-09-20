import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
// import BlackLogo from '../assets/images/blackLogo.svg';
import BlackLogo from '../../assets/images/blackLogo.svg';
import { SafeAreaView } from 'react-native-safe-area-context'; 
const OpeningScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.content}>
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <BlackLogo width={150} height={150} />
                    </View>
                </View>

                <View style={styles.buttonSection}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.primaryButtonText}>Sign In</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate('SignUp')}
                    >
                        <Text style={styles.secondaryButtonText}>Create account</Text>
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
    },
    logoSection: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        letterSpacing: 2,
    },
    buttonSection: {
        flex: 1,
        justifyContent: 'flex-start',
        gap: 15,
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
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    secondaryButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OpeningScreen;
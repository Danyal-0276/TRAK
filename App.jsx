// App.js
import React from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './src/route/LoginPage/Login';

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    // Mock navigation object for development
    const mockNavigation = {
        navigate: (routeName) => console.log(`Navigate to: ${routeName}`),
        goBack: () => console.log('Go back'),
        replace: (routeName) => console.log(`Replace with: ${routeName}`),
    };

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <View style={styles.container}>
                <Login navigation={mockNavigation} />
            </View>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;
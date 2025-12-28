import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import AppNavigation from './src/navigation/AppNavigation';
import SplashScreen from 'react-native-splash-screen';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
const App = () => {
    useEffect(() => {
        SplashScreen.hide();
    }, []);
    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <AppNavigation />
            </SafeAreaProvider>
        </ThemeProvider>
    );
};

export default App;
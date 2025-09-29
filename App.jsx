import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import AppNavigation from './src/navigation/AppNavigation';
import SplashScreen from 'react-native-splash-screen';

import { SafeAreaProvider } from 'react-native-safe-area-context';
const App = () => {
    useEffect(() => {
        SplashScreen.hide();
    }, []);
    return (<SafeAreaProvider>
        <AppNavigation />
    </SafeAreaProvider>);
};

export default App;
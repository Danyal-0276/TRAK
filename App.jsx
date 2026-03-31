import 'react-native-reanimated';
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import AppNavigation from './src/navigation/AppNavigation';
import SplashScreen from 'react-native-splash-screen';
import CustomSplashScreen from './src/components/SplashScreen';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [isAppReady, setIsAppReady] = useState(false);
    const [customSplashVisible, setCustomSplashVisible] = useState(false);

    const handleSplashReady = () => {
        // Mark custom splash as visible
        setCustomSplashVisible(true);
        
        // Wait longer to ensure custom splash is fully rendered, painted, and visible
        // Then hide native splash for smooth transition
        // Using multiple delays to ensure the custom splash is definitely visible
        setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    try {
                        SplashScreen.hide();
                    } catch (e) {
                        // Ignore if splash screen library not available
                    }
                });
            });
        }, 300); // Longer delay to ensure custom splash is fully visible
    };

    useEffect(() => {
        // Simulate app loading - wait a bit for navigation to be ready
        const readyTimer = setTimeout(() => {
            setIsAppReady(true);
        }, 1500);

        return () => {
            clearTimeout(readyTimer);
        };
    }, []);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    if (showSplash) {
        return (
            <ThemeProvider>
                <CustomSplashScreen 
                    onFinish={handleSplashFinish} 
                    isReady={isAppReady}
                    onReady={handleSplashReady}
                />
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <AuthProvider>
                    <AppNavigation />
                </AuthProvider>
            </SafeAreaProvider>
        </ThemeProvider>
    );
};

export default App;
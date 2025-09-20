import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens - Only import screens that exist
//import SplashScreen from '../route/SplashPage/SplashScreen.jsx';
import LoginScreen from '../route/LoginPage/LoginScreen.jsx';
import SignUpScreen from '../route/signUpPage/SignUpSCreen.jsx';
import ForgotPasswordScreen from '../route/forgotPasswordPage/ForgotPasswordScreen.jsx'; // Comment out if missing
import OpeningScreen from '../route/openingScreen/OpeningScreen.jsx';
import ForgotPasswordCodeScreen from '../route/FPpinPage/ForgotPasswordCodeScreen.jsx';
import ResetPasswordScreen from '../route/resetPasswordPage/ResetPasswordScreen.jsx';
import PasswordChangedScreen from '../route/PasswordChangedScreen/PasswordChangedScreen.jsx';

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="OpeningScreen"  // Changed from "Login" to "OpeningScreen"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="OpeningScreen" component={OpeningScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ForgotPasswordCode" component={ForgotPasswordCodeScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigation;
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack.jsx';
import MainAppStack from './MainAppStack.jsx';
import {
    EditProfileScreen,
    PrivacyScreen,
    DataScreen,
    CategoriesScreen,
    AboutScreen,
    ProfileScreen,
    AdminScreen,
    LoginScreen,
    SettingsScreen,
    TermsScreen,
} from './config/screenImports.js';

const Stack = createNativeStackNavigator();

const RootStack = () => (
    <Stack.Navigator
        initialRouteName="OpeningScreen"
        screenOptions={{ headerShown: false }}
    >
        {/* Auth Stack - contains OpeningScreen as initial */}
        <Stack.Screen name="OpeningScreen" component={AuthStack} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={AuthStack} />
        <Stack.Screen name="TagSelection" component={AuthStack} />
        <Stack.Screen name="KeywordSelection" component={AuthStack} />
        <Stack.Screen name="ForgotPassword" component={AuthStack} />
        <Stack.Screen name="ForgotPasswordCode" component={AuthStack} />
        <Stack.Screen name="ResetPassword" component={AuthStack} />
        <Stack.Screen name="PasswordChanged" component={AuthStack} />
        
        {/* Main App with Tabs - THIS IS THE KEY! */}
        <Stack.Screen name="NewsFeed" component={MainAppStack} />
        
        {/* Additional Screens */}
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="AdminScreen" component={AdminScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Log In' }} />
        <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} options={{ title: 'Privacy & Security' }} />
        <Stack.Screen name="DataScreen" component={DataScreen} options={{ title: 'Data & Storage' }} />
        <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: 'About' }} />
        <Stack.Screen name="TermsScreen" component={TermsScreen} options={{ title: 'Terms of Service' }} />
    </Stack.Navigator>
);

export default function AppNavigation() {
    return (
        <NavigationContainer>
            <RootStack />
        </NavigationContainer>
    );
}
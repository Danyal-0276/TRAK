import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import TrakLogo from '../components/TrakLogo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack.jsx';
import MainAppStack from './MainAppStack.jsx';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { defaultStackScreenOptions } from './stackScreenOptions';
import { getInitialRouteForUser } from '../utils/authNavigation';
import { bindPushNotificationNavigation, setPushNavigationRef } from '../notifications/pushNavigation';
import { bindForegroundPushMessaging } from '../notifications/pushMessaging';
import { onAuthSessionEnded } from '../utils/authSessionEvents';
import { navigationLinking } from './linking';
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
    TagSelectionScreen,
    KeywordSelectionScreen,
} from './config/screenImports.js';

const Stack = createNativeStackNavigator();

const RootStack = ({ initialRouteName }) => (
    <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={defaultStackScreenOptions}
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
        <Stack.Screen name="SettingsTagSelection" component={TagSelectionScreen} />
        <Stack.Screen name="SettingsKeywordSelection" component={KeywordSelectionScreen} />
        <Stack.Screen name="AboutScreen" component={AboutScreen} options={{ title: 'About' }} />
        <Stack.Screen name="TermsScreen" component={TermsScreen} options={{ title: 'Terms of Service' }} />
    </Stack.Navigator>
);

export default function AppNavigation() {
    const { user, bootstrapped } = useAuth();
    const { theme } = useTheme();
    const navRef = useRef(null);

    useEffect(() => {
        if (!bootstrapped || !user) return undefined;
        setPushNavigationRef(navRef.current);
        bindPushNotificationNavigation();
        const unsubForeground = bindForegroundPushMessaging();
        return () => {
            if (typeof unsubForeground === 'function') unsubForeground();
        };
    }, [bootstrapped, user]);

    useEffect(() => {
        return onAuthSessionEnded((reason) => {
            const nav = navRef.current;
            if (!nav?.reset) return;
            const routeName = reason === 'manual' ? 'OpeningScreen' : 'Login';
            nav.reset({ index: 0, routes: [{ name: routeName }] });
        });
    }, []);
    // Show a fast branded loader instead of a black frame.
    if (!bootstrapped) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.background,
                }}
            >
                <TrakLogo size={56} />
            </View>
        );
    }
    const initialRouteName = getInitialRouteForUser(user);
    return (
        <NavigationContainer ref={navRef} linking={navigationLinking}>
            <RootStack initialRouteName={initialRouteName} />
        </NavigationContainer>
    );
}
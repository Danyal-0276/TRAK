import React, { useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import TrakLogo from '../components/TrakLogo';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
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
import { goBackInNavigationTree } from './appStackNavigation';
import { navigationLinking } from './linking';
import {
    CategoriesScreen,
    ProfileScreen,
    AdminScreen,
    LoginScreen,
} from './config/screenImports.js';

const Stack = createNativeStackNavigator();

const RootStack = ({ initialRouteName }) => (
    <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={defaultStackScreenOptions}
    >
        <Stack.Screen name="OpeningScreen" component={AuthStack} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={AuthStack} />
        <Stack.Screen name="TagSelection" component={AuthStack} />
        <Stack.Screen name="KeywordSelection" component={AuthStack} />
        <Stack.Screen name="ForgotPassword" component={AuthStack} />
        <Stack.Screen name="ForgotPasswordCode" component={AuthStack} />
        <Stack.Screen name="ResetPassword" component={AuthStack} />
        <Stack.Screen name="PasswordChanged" component={AuthStack} />

        <Stack.Screen name="NewsFeed" component={MainAppStack} />

        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="AdminScreen" component={AdminScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Log In' }} />
        <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} options={{ title: 'Manage Categories' }} />
    </Stack.Navigator>
);

export default function AppNavigation() {
    const { user, bootstrapped } = useAuth();
    const { theme } = useTheme();
    const navRef = useNavigationContainerRef();

    useEffect(() => {
        if (!bootstrapped || !user) return undefined;
        setPushNavigationRef(navRef);
        bindPushNotificationNavigation();
        const unsubForeground = bindForegroundPushMessaging();
        return () => {
            if (typeof unsubForeground === 'function') unsubForeground();
        };
    }, [bootstrapped, user, navRef]);

    useEffect(() => {
        return onAuthSessionEnded((reason) => {
            const nav = navRef.current;
            if (!nav?.reset) return;
            const routeName = reason === 'manual' ? 'OpeningScreen' : 'Login';
            nav.reset({ index: 0, routes: [{ name: routeName }] });
        });
    }, [navRef]);

    useEffect(() => {
        if (!bootstrapped || !user) return undefined;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (!navRef.isReady()) return false;
            const nav = navRef.current;
            if (nav && goBackInNavigationTree(nav)) {
                return true;
            }
            return false;
        });
        return () => sub.remove();
    }, [bootstrapped, user, navRef]);

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

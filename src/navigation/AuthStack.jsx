import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
    OpeningScreen,
    LoginScreen,
    SignUpScreen,
    ForgotPasswordScreen,
    ForgotPasswordCodeScreen,
    ResetPasswordScreen,
    PasswordChangedScreen,
    TagSelectionScreen,
    KeywordSelectionScreen,
    TermsScreen,
} from './config/screenImports';

const Stack = createNativeStackNavigator();

const authScreens = [
    { name: 'OpeningScreen', component: OpeningScreen },
    { name: 'Login', component: LoginScreen },
    { name: 'SignUp', component: SignUpScreen },
    { name: 'TagSelection', component: TagSelectionScreen },
    { name: 'KeywordSelection', component: KeywordSelectionScreen },
    { name: 'ForgotPassword', component: ForgotPasswordScreen },
    { name: 'ForgotPasswordCode', component: ForgotPasswordCodeScreen },
    { name: 'ResetPassword', component: ResetPasswordScreen },
    { name: 'PasswordChanged', component: PasswordChangedScreen },
    { name: 'TermsOfService', component: TermsScreen },
];

const AuthStack = () => (
    <Stack.Navigator
        initialRouteName="OpeningScreen"
        screenOptions={{ headerShown: false }}
    >
        {authScreens.map((screen) => (
            <Stack.Screen key={screen.name} {...screen} />
        ))}
    </Stack.Navigator>
);

export default AuthStack;
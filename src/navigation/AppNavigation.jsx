import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import your existing screens
import LoginScreen from '../route/LoginPage/LoginScreen.jsx';
import SignUpScreen from '../route/signUpPage/SignUpSCreen.jsx';
import ForgotPasswordScreen from '../route/forgotPasswordPage/ForgotPasswordScreen.jsx';
import OpeningScreen from '../route/openingScreen/OpeningScreen.jsx';
import ForgotPasswordCodeScreen from '../route/FPpinPage/ForgotPasswordCodeScreen.jsx';
import ResetPasswordScreen from '../route/resetPasswordPage/ResetPasswordScreen.jsx';
import PasswordChangedScreen from '../route/PasswordChangedScreen/PasswordChangedScreen.jsx';
import TagSelectionScreen from '../route/TagSelectionScreen/TagSelectionScreen.jsx';
import KeywordSelectionScreen from '../route/KeywordSelectionScreen/KeywordSelectionScreen.jsx';

// Import icons - using react-native-vector-icons as fallback
import { Home, Search, Bell, User } from 'lucide-react-native';

// Import your SearchScreen
import SearchScreen from '../route/SearchScreen/SearchScreen.jsx';

// Fallback screens for missing components
const FallbackScreen = ({ title, navigation }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>{title}</Text>
        <Text style={{ color: '#666' }}>Create this screen file</Text>
    </View>
);

// Try to import optional screens
let NewsFeedScreen, NotificationsScreen, ProfileScreen;

try {
    NewsFeedScreen = require('../route/NewsFeedScreen/NewsFeedScreen.jsx').default;
} catch (e) {
    NewsFeedScreen = (props) => <FallbackScreen title="News Feed" {...props} />;
}

try {
    NotificationsScreen = require('../route/NotificationsScreen/NotificationsScreen.jsx').default;
} catch (e) {
    NotificationsScreen = (props) => <FallbackScreen title="Notifications" {...props} />;
}

try {
    ProfileScreen = require('../route/ProfileScreen/ProfileScreen.jsx').default;
} catch (e) {
    ProfileScreen = (props) => <FallbackScreen title="Profile" {...props} />;
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let IconComponent;
                    
                    switch (route.name) {
                        case 'Home':
                            IconComponent = Home;
                            break;
                        case 'Search':
                            IconComponent = Search;
                            break;
                        case 'Notifications':
                            IconComponent = Bell;
                            break;
                        case 'Profile':
                            IconComponent = User;
                            break;
                        default:
                            IconComponent = Home;
                    }
                    
                    // Special styling for focused Home tab
                    if (route.name === 'Home' && focused) {
                        return (
                            <View style={{
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: '#1DA1F2',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <IconComponent size={20} color="#fff" />
                            </View>
                        );
                    }
                    
                    return <IconComponent size={size} color={color} />;
                },
                tabBarActiveTintColor: '#1DA1F2',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e1e8ed',
                    paddingVertical: 8,
                    height: 70,
                },
                tabBarShowLabel: false,
            })}
        >
            <Tab.Screen name="Home" component={NewsFeedScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppNavigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="OpeningScreen"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="OpeningScreen" component={OpeningScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="TagSelection" component={TagSelectionScreen} />
                <Stack.Screen name="KeywordSelection" component={KeywordSelectionScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ForgotPasswordCode" component={ForgotPasswordCodeScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="PasswordChanged" component={PasswordChangedScreen} />
                <Stack.Screen name="NewsFeed" component={TabNavigator} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigation;
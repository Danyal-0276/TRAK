import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import SettingsScreen from '../route/SettingsScreen/SettingsScreen.jsx';

// Import your SearchScreen
import SearchScreen from '../route/SearchScreen/SearchScreen.jsx'; 

// IMPORT YOUR ACTUAL ARTICLE DETAIL SCREEN
import ArticleDetailScreen from '../route/ArticleDetailScreen/ArticleDetailScreen.jsx';

// Import icons
import { Home, Search, Bell, User } from 'lucide-react-native';

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



// Custom Tab Bar Component with Bubble Effect
const CustomTabBar = ({ state, descriptors, navigation }) => {
    return (
        <View style={styles.tabBarContainer}>
            {/* Black gradient background with border */}
            <View style={styles.tabBarBackground}>
                <View style={styles.tabBarContent}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;
                        
                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

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

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={[
                                    styles.tabItem,
                                    isFocused && styles.tabItemActive
                                ]}
                                activeOpacity={0.8}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    isFocused && styles.iconContainerActive
                                ]}>
                                    <IconComponent 
                                        size={isFocused ? 22 : 20} 
                                        color={isFocused ? '#fff' : '#888'} 
                                        strokeWidth={2.5}
                                    />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </View>
    );
};

const styles = {
    tabBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 0,
        paddingBottom: 0,
        paddingTop: 10,
    },
    tabBarBackground: {
        backgroundColor: '#2c2c2c', // Dark gradient start
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 1,
        paddingLeft: 1,
        paddingRight: 1,
        paddingBottom: 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    tabBarContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 64,
        overflow: 'visible',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: 48,
        borderRadius: 16,
        position: 'relative',
        zIndex: 1,
    },
    tabItemActive: {
        width: 56,
        height: 56,
        borderRadius: 28,
        transform: [{ translateY: -24 }],
        zIndex: 3,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    iconContainerActive: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#000', // Black instead of pink
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    leftCutout: {
        position: 'absolute',
        bottom: -8,
        left: -24,
        width: 24,
        height: 24,
        backgroundColor: '#fff',
        borderTopRightRadius: 24,
        zIndex: 2,
    },
    rightCutout: {
        position: 'absolute',
        bottom: -8,
        right: -24,
        width: 24,
        height: 24,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        zIndex: 2,
    },
};

// Bottom Tab Navigator with custom tab bar
const TabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen name="Home" component={NewsFeedScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

// Main App Stack with Tabs nested inside
const MainAppStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
             <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
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
                <Stack.Screen name="NewsFeed" component={MainAppStack} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigation;
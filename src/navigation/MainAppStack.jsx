import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationDetailScreen from '../route/NotificationsScreen/components/NotificationDetailScreen';
import TabNavigator from './TabNavigator.jsx';
import {
    ArticleDetailScreen,
    SettingsScreen,
} from './config/screenImports';

const Stack = createNativeStackNavigator();

const MainAppStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen 
  name="NotificationDetail" 
  component={NotificationDetailScreen}
  options={{ headerShown: false }}
/>
    </Stack.Navigator>
);

export default MainAppStack;
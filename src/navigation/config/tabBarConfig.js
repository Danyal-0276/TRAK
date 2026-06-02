import { StyleSheet } from 'react-native';
import { Home, Search, Bell, User, MessageCircle, Shield } from 'lucide-react-native';

export const iconMap = {
    Home: Home,
    Search: Search,
    Notifications: Bell,
    Profile: User,
    Chat: MessageCircle,
    Admin: Shield,
};

export const tabBarStyles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabBarBackground: {
        backgroundColor: '#000',
        borderRadius: 50,
        paddingVertical: 8,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    tabBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    tabItem: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabItemActive: {
        backgroundColor: '#fff',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell } from 'lucide-react-native';

const NotificationsScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Bell size={64} color="#1DA1F2" />
                </View>
                <Text style={styles.title}>Notifications</Text>
                <Text style={styles.subtitle}>
                    Stay updated with your latest notifications
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    iconContainer: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#657786',
        textAlign: 'center',
        lineHeight: 22,
    },
});

export default NotificationsScreen;
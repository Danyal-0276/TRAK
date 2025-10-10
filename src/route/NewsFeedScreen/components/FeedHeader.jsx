// ============================================
// FILE: components/FeedHeader.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings, Bell } from 'lucide-react-native';

export const FeedHeader = ({ navigation }) => (
    <View style={headerStyles.container}>
        <View style={headerStyles.content}>
            <View style={headerStyles.logoContainer}>
                <Text style={headerStyles.logoText}>N</Text>
            </View>
            <Text style={headerStyles.title}>Newsfeed</Text>
        </View>
        <View style={headerStyles.actions}>
            <TouchableOpacity
                style={headerStyles.iconButton}
                onPress={() => { }}
                activeOpacity={0.7}
            >
                <Bell size={20} color="#1F2937" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity
                style={headerStyles.iconButton}
                onPress={() => navigation.navigate("Settings")}
                activeOpacity={0.7}
            >
                <Settings size={20} color="#1F2937" strokeWidth={2} />
            </TouchableOpacity>
        </View>
    </View>
);

const headerStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FF4500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        letterSpacing: -0.3,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#F7F7F7',
    },
});
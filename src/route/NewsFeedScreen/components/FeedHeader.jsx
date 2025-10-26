// ============================================
// FILE: components/FeedHeader.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Settings } from 'lucide-react-native';
import BlackLogo from '../../../assets/images/blackLogo.svg';

export const FeedHeader = ({ navigation }) => {
    return (
        <View style={headerStyles.wrapper}>
            <View style={headerStyles.container}>
                <View style={headerStyles.content}>
                    <View style={headerStyles.logoContainer}>
                        <BlackLogo width={32} height={32} />
                    </View>
                    <Text style={headerStyles.title}>Newsfeed</Text>
                </View>
                <View style={headerStyles.actions}>
                    <TouchableOpacity
                        style={headerStyles.iconButton}
                        onPress={() => navigation.navigate("Settings")}
                        activeOpacity={0.7}
                    >
                        <Settings size={20} color="#1F2937" strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const headerStyles = StyleSheet.create({
    wrapper: {
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
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
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
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
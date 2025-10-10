// ============================================
// FILE: components/FeedHeader.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';
import { SvgXml } from 'react-native-svg';
import BlackLogo from '../../../assets/images/blackLogo.svg';
// If you're using react-native-svg with asset imports, use this instead:
// import BlackLogo from '../assets/blackLogo.svg';

export const FeedHeader = ({ navigation }) => {
    // If you need to load the SVG as a string, you can import it
    // For now, I'll show you how to use it as a component
    
    return (
        <View style={headerStyles.container}>
            <View style={headerStyles.content}>
                <View style={headerStyles.logoContainer}>
                    <BlackLogo width={32} height={32} />
                    {/* Alternative if using SvgXml: */}
                    {/* <SvgXml xml={require('../assets/blackLogo.svg')} width={32} height={32} /> */}
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
    );
};

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
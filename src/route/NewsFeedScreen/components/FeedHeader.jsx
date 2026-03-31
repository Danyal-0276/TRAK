// ============================================
// FILE: components/FeedHeader.jsx
// ============================================
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import BlackLogo from '../../../assets/images/blackLogo.svg';
import TextComponent from '../../../components/ui/Text';

export const FeedHeader = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={[headerStyles.wrapper, { backgroundColor: colors.surface }]}>
            <View style={[headerStyles.container, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
                <View style={headerStyles.content}>
                    <View style={[headerStyles.logoContainer, { backgroundColor: colors.backgroundSecondary }]}>
                        <BlackLogo width={32} height={32} />
                    </View>
                    <TextComponent variant="title" style={[headerStyles.title, { color: colors.textPrimary }]}>
                        Newsfeed
                    </TextComponent>
                </View>
                <View style={headerStyles.actions}>
                    <TouchableOpacity
                        style={[headerStyles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() =>
                            navigation.getParent()?.navigate('MainTabs', { screen: 'Settings' })
                        }
                        activeOpacity={0.7}
                    >
                        <Settings size={20} color={colors.textPrimary} strokeWidth={2} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const headerStyles = StyleSheet.create({
    wrapper: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderRadius: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.3,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        padding: 10,
        borderRadius: 20,
    },
});
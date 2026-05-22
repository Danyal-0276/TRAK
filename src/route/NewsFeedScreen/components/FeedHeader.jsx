import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import PageScreenHeader from '../../../components/ui/PageScreenHeader';

export const FeedHeader = ({ navigation }) => {
    const { theme } = useTheme();
    const { colors } = theme;

    return (
        <PageScreenHeader
            title="Newsfeed"
            paddingTop={0}
            style={headerStyles.noExtraBorder}
            rightAction={
                <TouchableOpacity
                    style={[headerStyles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() =>
                        navigation.getParent()?.navigate('MainTabs', { screen: 'Settings' })
                    }
                    activeOpacity={0.7}
                >
                    <Settings size={20} color={colors.textPrimary} strokeWidth={2} />
                </TouchableOpacity>
            }
        />
    );
};

const headerStyles = StyleSheet.create({
    noExtraBorder: {
        borderBottomWidth: 0,
        paddingBottom: 8,
    },
    iconButton: {
        padding: 10,
        borderRadius: 20,
    },
});

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';
import { navigateToSettings } from '../../../navigation/appStackNavigation';
import PageScreenHeader from '../../../components/ui/PageScreenHeader';

export const FeedHeader = ({ navigation: navigationProp }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigation = useNavigation();
    const nav = navigation.getParent() ?? navigationProp ?? navigation;

    return (
        <PageScreenHeader
            title="Newsfeed"
            safeAreaTop={false}
            paddingTop={10}
            style={headerStyles.noExtraBorder}
            rightAction={
                <TouchableOpacity
                    style={[headerStyles.iconButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => navigateToSettings(nav, { returnTab: 'Home' })}
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

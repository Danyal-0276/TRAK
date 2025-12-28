import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export const Header = ({ onBackPress }) => {
    const { theme } = useTheme();
    const { colors } = theme;
    
    return (
        <View style={styles.header}>
            <TouchableOpacity 
                style={[styles.backButton, { 
                    backgroundColor: colors.backgroundSecondary, 
                    borderColor: colors.border 
                }]}
                onPress={onBackPress}
            >
                <ChevronLeft size={22} color={colors.textPrimary} strokeWidth={2.5} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 4,
        paddingBottom: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
});
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

export function SearchBar({ value, onChangeText }) {
    const { theme } = useTheme();
    const { colors } = theme;
    const [isFocused, setIsFocused] = useState(false);
    const borderColorAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(borderColorAnim, {
            toValue: isFocused ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    }, [isFocused]);

    const borderColor = borderColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.primary],
    });

    return (
        <Animated.View 
            style={[
                styles.searchContainer,
                {
                    backgroundColor: colors.surface,
                    borderColor: borderColor,
                    shadowColor: colors.shadowDark || '#000',
                }
            ]}
        >
            <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search categories..."
                placeholderTextColor={colors.textTertiary}
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: 18,
        paddingVertical: 14,
        marginBottom: 20,
        borderWidth: 1.5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
});

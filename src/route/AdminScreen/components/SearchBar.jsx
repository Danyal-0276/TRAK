import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { Search } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

const SearchBar = ({ value, onChangeText, placeholder = 'Search...' }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View style={[styles.searchBar, {
      backgroundColor: colors.surface,
      borderColor,
    }]}>
      <Search size={18} color={colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: colors.textPrimary }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textTertiary}
        cursorColor={colors.primary}
        onFocus={() => {
          Animated.timing(borderColorAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }}
        onBlur={() => {
          Animated.timing(borderColorAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
  },
});

export default SearchBar;
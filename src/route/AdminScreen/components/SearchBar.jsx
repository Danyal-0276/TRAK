import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Animated } from 'react-native';
import { Search } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import { useTheme } from '../../../theme/ThemeContext';

const SearchBar = ({ value, onChangeText, placeholder = 'Search...', palette: paletteProp }) => {
  const { palette: themePalette } = useAdminTheme();
  const { theme } = useTheme();
  const palette = paletteProp || themePalette;
  const inputTypography = theme.typography.body;
  const borderColorAnim = useRef(new Animated.Value(0)).current;

  const borderColor = borderColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [palette.border, palette.primary],
  });

  return (
    <Animated.View style={[styles.searchBar, {
      backgroundColor: palette.card,
      borderColor,
    }]}>
      <Search size={18} color={palette.textSecondary} />
      <TextInput
        style={[styles.searchInput, inputTypography, { color: palette.textPrimary }]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={palette.textTertiary}
        cursorColor={palette.primary}
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
    marginLeft: 12,
  },
});

export default SearchBar;
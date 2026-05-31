import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useAdminTheme } from '../useAdminTheme';

const ToggleSwitch = ({ value, onValueChange }) => {
  const { palette, isDark } = useAdminTheme();

  const trackOff = isDark ? palette.border : palette.borderLight;
  const trackOn = palette.success;
  const thumb = isDark ? palette.textPrimary : '#ffffff';

  return (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: value ? trackOn : trackOff }]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.85}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View
        style={[
          styles.toggleThumb,
          { backgroundColor: thumb },
          value && styles.toggleThumbActive,
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
});

export default ToggleSwitch;

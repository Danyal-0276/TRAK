import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

const ToggleSwitch = ({ value, onValueChange }) => {
  return (
    <TouchableOpacity
      style={[styles.toggle, value && styles.toggleActive]}
      onPress={() => onValueChange(!value)}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 50,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
});

export default ToggleSwitch;
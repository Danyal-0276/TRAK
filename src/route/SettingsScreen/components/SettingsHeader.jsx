import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

export default function SettingsHeader({ navigation, embeddedInTab = false, onBack }) {
  const { theme } = useTheme();
  const { colors } = theme;

  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
      return;
    }
    navigation?.goBack?.();
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
      {embeddedInTab ? (
        <View style={styles.backBtn} />
      ) : (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} color={colors.textPrimary} strokeWidth={2.25} />
        </TouchableOpacity>
      )}
      <View style={styles.textBlock}>
        <Text variant="title" style={{ color: colors.textPrimary }}>
          Settings
        </Text>
        <Text variant="caption" color={colors.textSecondary}>
          Notifications, interests & app preferences
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
});

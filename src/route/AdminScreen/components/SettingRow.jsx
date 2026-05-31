import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';

const SettingRow = ({ label, children }) => {
  const { palette } = useAdminTheme();

  return (
    <View style={[styles.settingRow, { borderBottomColor: palette.borderLight }]}>
      <Text variant="body" color={palette.textPrimary} style={styles.settingLabel}>
        {label}
      </Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
});

export default SettingRow;

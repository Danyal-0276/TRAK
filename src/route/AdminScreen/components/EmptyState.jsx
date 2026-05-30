import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';

const EmptyState = ({ icon: Icon, title, subtitle }) => {
  const { palette } = useAdminTheme();

  return (
    <View style={[styles.emptyState, { backgroundColor: palette.card, borderColor: palette.border }]}>
      {Icon && (
        <View style={[styles.iconContainer, { backgroundColor: `${palette.primary}10` }]}>
          <Icon size={48} color={palette.textTertiary} strokeWidth={1.5} />
        </View>
      )}
      <Text variant="title" color={palette.textPrimary} style={styles.emptyStateTitle}>
        {title}
      </Text>
      <Text variant="body" color={palette.textSecondary} style={styles.emptyStateText}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default EmptyState;
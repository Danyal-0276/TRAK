import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

/** Horizontal category chip rail with optional count badges. */
const Tabs = ({ categories, activeTab, onTabPress, countsByLabel = {}, loading = false }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  if (loading && (!categories || categories.length <= 1)) {
    return (
      <View style={styles.wrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[styles.skeletonChip, { backgroundColor: colors.borderLight }]}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((cat) => {
          const isActive = activeTab === cat;
          const count = countsByLabel?.[cat];
          const showCount = typeof count === 'number' && count > 0 && cat !== 'All';
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? colors.primary : colors.backgroundSecondary,
                  borderColor: isActive ? colors.primary : colors.borderLight,
                },
              ]}
              onPress={() => onTabPress(cat)}
              activeOpacity={0.85}
            >
              <Text
                variant="body"
                style={[
                  styles.pillText,
                  {
                    color: isActive ? colors.textInverse || '#fff' : colors.textSecondary,
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {cat}
              </Text>
              {showCount ? (
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor: isActive ? 'rgba(255,255,255,0.22)' : `${colors.primary}18`,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    style={{
                      color: isActive ? colors.textInverse || '#fff' : colors.primary,
                      fontWeight: '700',
                      fontSize: 11,
                    }}
                  >
                    {count > 99 ? '99+' : count}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingBottom: 10,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    gap: 6,
  },
  pillText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  countBadge: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonChip: {
    width: 88,
    height: 34,
    borderRadius: 999,
    marginRight: 8,
  },
});

export default Tabs;

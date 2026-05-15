import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

const Tabs = ({ categories, activeTab, onTabPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {categories.map((cat) => {
          const isActive = activeTab === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={styles.tabHit}
              onPress={() => onTabPress(cat)}
              activeOpacity={0.75}
            >
              <Text
                variant="body"
                style={[
                  styles.tabText,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {cat}
              </Text>
              {isActive ? (
                <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
              ) : (
                <View style={styles.indicatorPlaceholder} />
              )}
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
    maxWidth: '100%',
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  tabHit: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    marginRight: 4,
    alignItems: 'center',
    minWidth: 56,
  },
  tabText: {
    fontSize: 14,
    letterSpacing: 0.2,
  },
  indicator: {
    marginTop: 8,
    height: 3,
    width: '100%',
    borderRadius: 2,
  },
  indicatorPlaceholder: {
    marginTop: 8,
    height: 3,
    width: '100%',
    opacity: 0,
  },
});

export default Tabs;

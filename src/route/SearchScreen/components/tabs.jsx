import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';

/** Horizontal pill filters for Discover categories. */
const Tabs = ({ categories, activeTab, onTabPress }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((cat) => {
          const isActive = activeTab === cat;
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
              activeOpacity={0.8}
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
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
});

export default Tabs;

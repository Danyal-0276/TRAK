import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { TrendingUp } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';

/** Compact trending chips — one row, minimal chrome. */
const TrendingTopics = ({ topics, onTopicPress, searchQuery }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  if (searchQuery && searchQuery.trim()) return null;

  const ranked = Array.isArray(topics) ? topics.slice(0, 10) : [];
  if (ranked.length === 0) return null;

  return (
    <View style={[styles.wrap, { borderBottomColor: colors.borderLight }]}>
      <View style={styles.labelRow}>
        <TrendingUp size={14} color={colors.primary} strokeWidth={2.5} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Trending</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {ranked.map((topic, index) => {
          const hot = topic.trending || index < 2;
          return (
            <TouchableOpacity
              key={topic.id || `${topic.name}-${index}`}
              style={[
                styles.chip,
                {
                  backgroundColor: hot ? colors.primary + '12' : colors.backgroundSecondary,
                  borderColor: hot ? colors.primary + '35' : colors.borderLight,
                },
              ]}
              onPress={() => onTopicPress(topic.name)}
              activeOpacity={0.75}
            >
              {index < 3 ? (
                <Text style={[styles.rank, { color: colors.primary }]}>{index + 1}</Text>
              ) : null}
              <Text
                style={[styles.chipText, { color: colors.textPrimary }]}
                numberOfLines={1}
              >
                {topic.name || 'Topic'}
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
    paddingTop: 4,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  scroll: {
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 160,
    marginRight: 8,
  },
  rank: {
    fontSize: 11,
    fontWeight: '800',
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
});

export default TrendingTopics;

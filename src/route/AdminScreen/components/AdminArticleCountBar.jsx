import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Layers, CheckCircle2, Eye } from 'lucide-react-native';
import Text from '../../../components/ui/Text';
import { buildArticleCountDisplay } from '../../../utils/adminArticleFilters';

const STAT_META = {
  unique: { icon: Layers, accentKey: 'sources', short: 'Unique' },
  processed: { icon: CheckCircle2, accentKey: 'processed', short: 'Done' },
  review: { icon: Eye, accentKey: 'failed', short: 'Review' },
  filtered: { icon: Layers, accentKey: 'queue', short: 'Filter' },
};

function accentFromPalette(palette, key) {
  return palette.statAccent?.[key] || palette.primary || palette.info;
}

export default function AdminArticleCountBar({
  counts,
  pipelineFilter,
  displayedCount,
  searchQuery,
  palette,
  loading = false,
}) {
  const { detail, pills } = useMemo(
    () =>
      buildArticleCountDisplay({
        counts,
        pipelineFilter,
        displayedCount,
        searchQuery,
      }),
    [counts, pipelineFilter, displayedCount, searchQuery]
  );

  if (loading && !counts) {
    return (
      <View style={[styles.wrap, { borderColor: palette.border, backgroundColor: palette.card }]}>
        <Text variant="caption" color={palette.textTertiary} style={styles.loading}>
          Loading counts…
        </Text>
      </View>
    );
  }

  if (!counts && !loading) return null;

  return (
    <View style={[styles.wrap, { borderColor: palette.border, backgroundColor: palette.card }]}>
      <View style={styles.statRow}>
        {pills.map((pill) => {
          const meta = STAT_META[pill.key] || STAT_META.unique;
          const Icon = meta.icon;
          const accent = accentFromPalette(palette, meta.accentKey);
          return (
            <View
              key={pill.key}
              style={[
                styles.stat,
                {
                  borderColor: pill.active ? `${accent}55` : palette.borderLight,
                  backgroundColor: pill.active ? `${accent}10` : palette.pageAlt,
                },
              ]}
            >
              <View style={[styles.icon, { backgroundColor: `${accent}18` }]}>
                <Icon size={12} color={accent} strokeWidth={2.25} />
              </View>
              <Text variant="body" color={palette.textPrimary} style={styles.value}>
                {pill.value}
              </Text>
              <Text variant="caption" color={palette.textTertiary} style={styles.label}>
                {meta.short}
              </Text>
            </View>
          );
        })}
      </View>
      {detail ? (
        <Text variant="caption" color={palette.textSecondary} style={[styles.detail, { borderTopColor: palette.borderLight }]}>
          {detail}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  loading: { padding: 10, fontSize: 11 },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 9,
    borderWidth: 1,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: { fontSize: 14, fontWeight: '800', lineHeight: 16 },
  label: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  detail: {
    fontSize: 10,
    lineHeight: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
  },
});

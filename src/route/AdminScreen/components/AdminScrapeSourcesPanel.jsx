import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Rss, Globe, CheckCircle2, XCircle, Settings2 } from 'lucide-react-native';
import Text from '../../../components/ui/Text';

export default function AdminScrapeSourcesPanel({ connections, palette, onManageSettings }) {
  const sources = connections?.sources || [];
  const active = connections?.active ?? 0;
  const total = connections?.total ?? 0;

  return (
    <View style={[styles.section, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <View style={[styles.header, { borderBottomColor: palette.borderLight, backgroundColor: palette.pageAlt }]}>
        <View style={{ flex: 1 }}>
          <Text variant="subtitle" color={palette.textPrimary} style={{ fontWeight: '700' }}>
            Scrape sources
          </Text>
          <Text variant="caption" color={palette.textSecondary} style={{ marginTop: 4 }}>
            {active} of {total} connections active
          </Text>
        </View>
        {onManageSettings ? (
          <TouchableOpacity
            onPress={onManageSettings}
            style={[styles.manageBtn, { borderColor: palette.border, backgroundColor: palette.card }]}
          >
            <Settings2 size={14} color={palette.textPrimary} />
            <Text variant="caption" color={palette.textPrimary} style={{ fontWeight: '600', marginLeft: 6 }}>
              Manage
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.body}>
        {sources.length === 0 ? (
          <Text variant="caption" color={palette.textSecondary}>
            No scrape sources configured.
          </Text>
        ) : (
          sources.map((s) => {
            const on = s.active !== false;
            const Icon = s.kind === 'rss' ? Rss : Globe;
            return (
              <View
                key={s.slug || s.name}
                style={[
                  styles.sourceCard,
                  {
                    borderColor: palette.border,
                    backgroundColor: on ? palette.successBg : palette.pageAlt,
                  },
                ]}
              >
                <View style={[styles.sourceIcon, { backgroundColor: palette.card, borderColor: palette.borderLight }]}>
                  <Icon size={16} color={on ? palette.success : palette.textTertiary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600' }} numberOfLines={1}>
                    {s.name}
                  </Text>
                  <Text variant="caption" color={palette.textTertiary} numberOfLines={1}>
                    {s.source_key || s.slug}
                  </Text>
                </View>
                {on ? (
                  <CheckCircle2 size={16} color={palette.success} strokeWidth={2.5} />
                ) : (
                  <XCircle size={16} color={palette.error} />
                )}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginHorizontal: 20, marginBottom: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  body: { padding: 16, gap: 10 },
  sourceCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  sourceIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

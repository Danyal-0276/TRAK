import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  AlertTriangle,
  Bell,
  Flag,
  MessageSquare,
  Settings,
  User,
  Newspaper,
} from 'lucide-react-native';
import Text from '../../../components/ui/Text';
import {
  getNotificationTypeMeta,
  NOTIFICATION_GROUP_LABELS,
  relativeTime,
  notificationAccentColor,
  notificationReadStatus,
} from '../../../constants/adminNotificationMeta';

const ICONS = {
  alert: AlertTriangle,
  bell: Bell,
  flag: Flag,
  message: MessageSquare,
  settings: Settings,
};

function reporterInitials(row) {
  const email = String(row.meta?.reporter_email || '');
  if (email) return email.slice(0, 2).toUpperCase();
  return 'A';
}

export default function AdminNotificationCard({ item, palette, onPress }) {
  const typeMeta = getNotificationTypeMeta(item.type);
  const readStatus = notificationReadStatus(item);
  const Icon = ICONS[typeMeta.icon] || Bell;
  const excerpt = item.message || item.text || item.details || 'No message';
  const articleTitle = item.meta?.post_title || item.meta?.article_title;
  const reporter = item.meta?.reporter_email || (item.meta?.user_id ? `User #${item.meta.user_id}` : '');

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.accent, { backgroundColor: notificationAccentColor(item) }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${typeMeta.tone}18` }]}>
            <Icon size={16} color={typeMeta.tone} />
          </View>
          <View style={styles.topText}>
            <View style={styles.titleRow}>
              <Text variant="body" color={palette.textPrimary} style={styles.typeLabel} numberOfLines={1}>
                {typeMeta.label}
              </Text>
              <Text variant="caption" color={palette.textTertiary}>
                {relativeTime(item.created_at || item.updated_at)}
              </Text>
            </View>
            <View style={styles.chipRow}>
              <View style={[styles.groupChip, { backgroundColor: palette.pageAlt || palette.backgroundSecondary }]}>
                <Text variant="caption" color={palette.textSecondary} style={styles.chipText}>
                  {NOTIFICATION_GROUP_LABELS[typeMeta.group] || 'Alert'}
                </Text>
              </View>
              {item.important ? (
                <Text variant="caption" style={styles.importantText}>Important</Text>
              ) : null}
            </View>
          </View>
        </View>

        <Text variant="body" color={palette.textSecondary} style={styles.message} numberOfLines={2}>
          {excerpt}
        </Text>

        <View style={styles.footer}>
          {reporter ? (
            <View style={styles.reporter}>
              <View style={[styles.avatar, { backgroundColor: palette.textPrimary }]}>
                <Text variant="caption" color={palette.textInverse || '#fff'} style={styles.avatarText}>
                  {reporterInitials(item)}
                </Text>
              </View>
              <User size={12} color={palette.textSecondary} />
              <Text variant="caption" color={palette.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                {reporter}
              </Text>
            </View>
          ) : null}
          {articleTitle ? (
            <View style={styles.articleRow}>
              <Newspaper size={12} color={palette.textSecondary} />
              <Text variant="caption" color={palette.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                {articleTitle}
              </Text>
            </View>
          ) : null}
          <Text variant="caption" style={{ color: readStatus.color, fontWeight: '700' }}>
            {readStatus.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accent: { width: 4 },
  body: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  typeLabel: { fontWeight: '700', fontSize: 14, flex: 1 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  groupChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  chipText: { fontSize: 11, fontWeight: '600' },
  importantText: { fontSize: 11, fontWeight: '700', color: '#ef4444' },
  message: { fontSize: 13, lineHeight: 20, marginBottom: 10 },
  footer: { gap: 6 },
  reporter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 9, fontWeight: '800' },
  articleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});

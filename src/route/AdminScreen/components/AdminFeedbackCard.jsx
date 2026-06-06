import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  AlertTriangle,
  Eye,
  Shield,
  Copy,
  Ban,
  Scale,
  MessageSquare,
  User,
  Newspaper,
} from 'lucide-react-native';
import Text from '../../../components/ui/Text';
import {
  getFeedbackCategoryMeta,
  formatFeedbackType,
  relativeTime,
  feedbackSubmittedAt,
  FEEDBACK_STATUS_META,
} from '../../../constants/feedbackCategoryMeta';

const ICONS = {
  alert: AlertTriangle,
  eye: Eye,
  shield: Shield,
  copy: Copy,
  ban: Ban,
  scale: Scale,
  message: MessageSquare,
};

function reporterInitials(row) {
  const email = String(row.reporter_email || '');
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

export default function AdminFeedbackCard({ item, palette, onPress }) {
  const cat = getFeedbackCategoryMeta(item.category);
  const status = FEEDBACK_STATUS_META[item.status] || FEEDBACK_STATUS_META.pending;
  const Icon = ICONS[cat.icon] || MessageSquare;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.accent, { backgroundColor: status.color }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: `${cat.tone}18` }]}>
            <Icon size={16} color={cat.tone} />
          </View>
          <View style={styles.topText}>
            <View style={styles.titleRow}>
              <Text variant="body" color={palette.textPrimary} style={styles.catLabel} numberOfLines={1}>
                {cat.label}
              </Text>
              <Text variant="caption" color={palette.textTertiary}>
                {relativeTime(feedbackSubmittedAt(item))}
              </Text>
            </View>
            <View style={[styles.typeChip, { backgroundColor: palette.pageAlt || palette.backgroundSecondary }]}>
              <Text variant="caption" color={palette.textSecondary} style={styles.typeText}>
                {formatFeedbackType(item.type)}
              </Text>
            </View>
          </View>
        </View>

        <Text variant="body" color={palette.textSecondary} style={styles.message} numberOfLines={2}>
          {item.message || item.category_label || 'No message provided'}
        </Text>

        <View style={styles.footer}>
          <View style={styles.reporter}>
            <View style={[styles.avatar, { backgroundColor: palette.textPrimary }]}>
              <Text variant="caption" color={palette.textInverse || '#fff'} style={styles.avatarText}>
                {reporterInitials(item)}
              </Text>
            </View>
            <User size={12} color={palette.textSecondary} />
            <Text variant="caption" color={palette.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
              {item.reporter_email || `User #${item.user_id}`}
            </Text>
          </View>
          {item.article_title ? (
            <View style={styles.articleRow}>
              <Newspaper size={12} color={palette.textSecondary} />
              <Text variant="caption" color={palette.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                {item.article_title}
              </Text>
            </View>
          ) : null}
          <Text variant="caption" style={{ color: status.color, fontWeight: '700' }}>
            {status.label}
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
  catLabel: { fontWeight: '700', fontSize: 14, flex: 1 },
  typeChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  typeText: { fontSize: 11, fontWeight: '600' },
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

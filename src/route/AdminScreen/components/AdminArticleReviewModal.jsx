import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { X, ExternalLink, Eye } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';
import { patchAdminArticle } from '../../../api/adminApi';
import { useFeedback } from '../../../components/ui/FeedbackProvider';
import ArticleInsightBadges, {
  ArticleTopicKeywords,
  ArticleCredibilityIndicator,
} from './ArticleInsightBadges';

const MODERATION_OPTIONS = [
  { value: 'review', label: 'Needs review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function sourceInitials(source) {
  return String(source || 'N').substring(0, 2).toUpperCase();
}

export default function AdminArticleReviewModal({
  visible,
  article,
  onClose,
  onSaved,
  onOpenInApp,
}) {
  const { palette, isDark } = useAdminTheme();
  const { success, error: notifyError } = useFeedback();
  const [status, setStatus] = useState('review');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (article) setStatus(article.moderation_status || 'review');
  }, [article]);

  if (!article) return null;

  const avatarBg = isDark ? palette.statAccent?.sources || palette.info : palette.textPrimary;
  const avatarText = isDark ? palette.textInverse : '#ffffff';
  const factHits = Array.isArray(article.fact_check_hits) ? article.fact_check_hits : [];

  const handleSave = async () => {
    setSaving(true);
    try {
      await patchAdminArticle(article.scope, article.id, { status });
      success('Review saved.');
      onSaved?.({ ...article, moderation_status: status });
      onClose?.();
    } catch (e) {
      notifyError(e?.message || 'Could not save review.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: palette.page }]}>
        <View style={[styles.header, { backgroundColor: palette.card, borderBottomColor: palette.border }]}>
          <View style={styles.headerTop}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={[styles.avatarText, { color: avatarText }]}>
                {sourceInitials(article.source || article.source_key)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color={palette.textSecondary}>
                {article.scope} · {article.time || article.date || '—'}
              </Text>
              <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '700' }} numberOfLines={2}>
                {article.title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: palette.pageAlt }]}>
              <X size={20} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>
          <ArticleCredibilityIndicator article={article} />
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          {article.image_url ? (
            <Image
              source={{ uri: article.image_url }}
              style={[styles.hero, { backgroundColor: palette.inputBg }]}
              resizeMode="cover"
            />
          ) : null}

          <ArticleInsightBadges article={article} palette={palette} />
          <ArticleTopicKeywords
            keywords={article.topic_keywords}
            textSecondary={palette.textSecondary}
            isDark={isDark}
            borderColor={palette.border}
          />

          {article.ai_summary ? (
            <View style={styles.section}>
              <Text variant="caption" color={palette.textSecondary} style={styles.sectionLabel}>
                AI summary
              </Text>
              <Text variant="body" color={palette.textPrimary}>{article.ai_summary}</Text>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text variant="caption" color={palette.textSecondary} style={styles.sectionLabel}>
              Full article
            </Text>
            <View style={[styles.contentBox, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
              <Text variant="body" color={palette.textPrimary} style={{ lineHeight: 22 }}>
                {article.fullContent || article.content || article.excerpt || 'No content available.'}
              </Text>
            </View>
          </View>

          {article.fact_check_verdict || factHits.length ? (
            <View style={styles.section}>
              <Text variant="caption" color={palette.textSecondary} style={styles.sectionLabel}>
                Fact check
              </Text>
              <Text variant="body" color={palette.textPrimary}>
                Verdict: {article.fact_check_verdict || '—'}
              </Text>
              {factHits.slice(0, 5).map((hit, i) => (
                <Text key={i} variant="caption" color={palette.textSecondary} style={{ marginTop: 4 }}>
                  · {typeof hit === 'string' ? hit : hit?.title || hit?.claim || '—'}
                </Text>
              ))}
            </View>
          ) : null}

          <Text variant="caption" color={palette.textSecondary} style={[styles.sectionLabel, { marginTop: 8 }]}>
            Moderation
          </Text>
          <View style={styles.statusRow}>
            {MODERATION_OPTIONS.map((opt) => {
              const active = status === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.statusChip,
                    {
                      borderColor: active ? palette.primary : palette.border,
                      backgroundColor: active ? `${palette.primary}18` : palette.card,
                    },
                  ]}
                  onPress={() => setStatus(opt.value)}
                >
                  <Text variant="caption" color={active ? palette.primary : palette.textSecondary}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: palette.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text variant="body" color={isDark ? palette.textInverse : '#ffffff'} style={{ fontWeight: '700' }}>
              {saving ? 'Saving…' : 'Save review'}
            </Text>
          </TouchableOpacity>

          <View style={styles.linkRow}>
            {article.canonical_url ? (
              <TouchableOpacity
                style={[styles.linkBtn, { borderColor: palette.border }]}
                onPress={() => Linking.openURL(article.canonical_url)}
              >
                <ExternalLink size={14} color={palette.primary} />
                <Text variant="caption" color={palette.primary} style={{ marginLeft: 6 }}>
                  Source
                </Text>
              </TouchableOpacity>
            ) : null}
            {onOpenInApp ? (
              <TouchableOpacity
                style={[styles.linkBtn, { borderColor: palette.border }]}
                onPress={() => onOpenInApp(article)}
              >
                <Eye size={14} color={palette.primary} />
                <Text variant="caption" color={palette.primary} style={{ marginLeft: 6 }}>
                  In app
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700' },
  closeBtn: { padding: 8, borderRadius: 8 },
  body: { padding: 16, paddingBottom: 40 },
  hero: { width: '100%', height: 180, borderRadius: 10, marginBottom: 14 },
  section: { marginTop: 14 },
  sectionLabel: { fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  contentBox: { padding: 14, borderRadius: 10, borderWidth: 1 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  saveBtn: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  linkRow: { flexDirection: 'row', gap: 10 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  AppState,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { MessageSquare } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import EmptyState from '../components/EmptyState';
import Text from '../../../components/ui/Text';
import AdminFeedbackCard from '../components/AdminFeedbackCard';
import AdminArticleReviewModal from '../components/AdminArticleReviewModal';
import { getAdminFeedback, patchAdminFeedback, getAdminArticleById } from '../../../api/adminApi';
import { useFeedback } from '../../../components/ui/FeedbackProvider';
import { FEEDBACK_POLL_INTERVAL_MS, adminFilledButtonColors } from '../adminTheme';
import { subscribeAdminFeedbackRefresh } from '../../../utils/adminNotificationsEvents';
import { FEEDBACK_STATUS_META } from '../../../constants/feedbackCategoryMeta';
import { buildArticleDetailParams } from '../../../utils/articleNavigation';

const STATUS_CHIPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'all', label: 'All' },
];

const FeedbackTab = ({ navigation, isActive = true }) => {
  const { palette } = useAdminTheme();
  const actionBtn = adminFilledButtonColors(palette);
  const { success, error: notifyError } = useFeedback();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, dismissed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [reviewArticle, setReviewArticle] = useState(null);
  const [articleLoading, setArticleLoading] = useState(false);
  const [articleError, setArticleError] = useState('');

  const loadRows = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const status = statusTab === 'all' ? '' : statusTab;
      const data = await getAdminFeedback({ status, limit: 100 });
      setRows(data.results || []);
      setStats(data.stats || { pending: 0, reviewed: 0, dismissed: 0, total: 0 });
    } catch {
      if (!silent) setRows([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  useEffect(() => {
    if (!isActive) return undefined;
    const poll = () => {
      if (AppState.currentState === 'active') loadRows({ silent: true });
    };
    const id = setInterval(poll, FEEDBACK_POLL_INTERVAL_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') loadRows({ silent: true });
    });
    const unsubRefresh = subscribeAdminFeedbackRefresh(() => loadRows({ silent: true }));
    return () => {
      clearInterval(id);
      sub.remove();
      unsubRefresh();
    };
  }, [loadRows, isActive]);

  const saveDetail = async (status) => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await patchAdminFeedback(selected.id, { status, admin_notes: adminNotes });
      success('Feedback updated.');
      setSelected(null);
      loadRows({ silent: true });
    } catch (e) {
      notifyError(e?.message || 'Could not update.');
    } finally {
      setSaving(false);
    }
  };

  const openArticleReview = async () => {
    if (!selected?.article_id) return;
    setArticleLoading(true);
    setArticleError('');
    try {
      const article = await getAdminArticleById(selected.article_id);
      setReviewArticle(article);
    } catch (e) {
      setArticleError(e?.message || 'Could not load article.');
      if (selected.url) Linking.openURL(selected.url).catch(() => {});
    } finally {
      setArticleLoading(false);
    }
  };

  const selectedStatus = selected ? FEEDBACK_STATUS_META[selected.status] : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}15` }]}>
          <MessageSquare size={20} color={palette.primary} />
        </View>
        <Text variant="title" color={palette.textPrimary} style={styles.title}>
          User feedback
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {STATUS_CHIPS.map(({ key, label }) => {
          const count = key === 'all' ? stats.total : stats[key];
          const active = statusTab === key;
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.chip,
                {
                  borderColor: active ? palette.primary : palette.border,
                  backgroundColor: active ? `${palette.primary}15` : palette.card,
                },
              ]}
              onPress={() => setStatusTab(key)}
            >
              <Text variant="caption" color={active ? palette.primary : palette.textSecondary}>
                {label}{count != null ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <AdminFeedbackCard
            item={item}
            palette={palette}
            onPress={(row) => {
              setSelected(row);
              setAdminNotes(row.admin_notes || '');
              setArticleError('');
            }}
          />
        )}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadRows} />}
        ListEmptyComponent={
          !loading ? (
            <EmptyState icon={MessageSquare} title="No feedback" subtitle="Nothing in this view yet." />
          ) : null
        }
        contentContainerStyle={styles.list}
      />

      <Modal visible={Boolean(selected)} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="title" color={palette.textPrimary} style={styles.modalTitle}>
                Feedback detail
              </Text>
              <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 12 }}>
                {selected?.category_label}
                {selectedStatus ? (
                  <Text variant="caption" style={{ color: selectedStatus.color, fontWeight: '700' }}>
                    {` · ${selectedStatus.label}`}
                  </Text>
                ) : null}
              </Text>
              <Text variant="body" color={palette.textPrimary} style={{ marginBottom: 12 }}>
                {selected?.message || '(No additional message)'}
              </Text>
              <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 12 }}>
                From: {selected?.reporter_email || selected?.user_id}
              </Text>

              {selected?.article_id ? (
                <View style={[styles.articleBox, { borderColor: palette.border, backgroundColor: palette.pageAlt }]}>
                  <Text variant="caption" color={palette.textSecondary}>Linked article</Text>
                  <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600', marginVertical: 6 }}>
                    {selected.article_title || 'Article'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.reviewBtn, { backgroundColor: actionBtn.background }]}
                    onPress={openArticleReview}
                    disabled={articleLoading}
                  >
                    {articleLoading ? (
                      <ActivityIndicator color={actionBtn.foreground} size="small" />
                    ) : (
                      <Text variant="body" color={actionBtn.foreground} style={{ fontWeight: '700' }}>
                        Review article
                      </Text>
                    )}
                  </TouchableOpacity>
                  {articleError ? (
                    <Text variant="caption" color={palette.error || '#ef4444'} style={{ marginTop: 8 }}>
                      {articleError}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <TextInput
                value={adminNotes}
                onChangeText={setAdminNotes}
                multiline
                placeholder="Admin notes"
                placeholderTextColor={palette.textTertiary}
                style={[
                  styles.notesInput,
                  { borderColor: palette.border, color: palette.textPrimary, backgroundColor: palette.pageAlt },
                ]}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: actionBtn.background }]}
                  onPress={() => saveDetail('reviewed')}
                  disabled={saving}
                >
                  <Text variant="body" color={actionBtn.foreground} style={{ fontWeight: '700' }}>
                    Mark reviewed
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { borderWidth: 1, borderColor: palette.border }]}
                  onPress={() => saveDetail('dismissed')}
                  disabled={saving}
                >
                  <Text variant="body" color={palette.textSecondary}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text variant="body" color={palette.textTertiary}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <AdminArticleReviewModal
        visible={Boolean(reviewArticle)}
        article={reviewArticle}
        onClose={() => setReviewArticle(null)}
        onSaved={() => loadRows({ silent: true })}
        onOpenInApp={(article) => {
          navigation?.navigate?.('ArticleDetail', buildArticleDetailParams(article));
        }}
        feedbackBanner={
          selected
            ? `Reviewing article linked to report — ${selected.category_label || selected.category}`
            : ''
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700' },
  chips: { maxHeight: 44, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  list: { paddingBottom: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 20, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 4 },
  articleBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  reviewBtn: { paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  notesInput: { minHeight: 80, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, textAlignVertical: 'top' },
  modalActions: { gap: 10 },
  actionBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});

export default FeedbackTab;

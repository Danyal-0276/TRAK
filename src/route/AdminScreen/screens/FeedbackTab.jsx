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
} from 'react-native';
import { MessageSquare, Flag, User } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import EmptyState from '../components/EmptyState';
import Text from '../../../components/ui/Text';
import { getAdminFeedback, patchAdminFeedback } from '../../../api/adminApi';
import { useFeedback } from '../../../components/ui/FeedbackProvider';

const STATUS_CHIPS = [
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'dismissed', label: 'Dismissed' },
  { key: 'all', label: 'All' },
];

const FeedbackTab = ({ navigation }) => {
  const { palette } = useAdminTheme();
  const { success, error: notifyError } = useFeedback();
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ pending: 0, reviewed: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState('pending');
  const [selected, setSelected] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const loadRows = useCallback(async () => {
    try {
      setLoading(true);
      const status = statusTab === 'all' ? '' : statusTab;
      const data = await getAdminFeedback({ status, limit: 100 });
      setRows(data.results || []);
      setStats(data.stats || {});
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [statusTab]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const saveDetail = async (status) => {
    if (!selected?.id) return;
    setSaving(true);
    try {
      await patchAdminFeedback(selected.id, { status, admin_notes: adminNotes });
      success('Feedback updated.');
      setSelected(null);
      loadRows();
    } catch (e) {
      notifyError(e?.message || 'Could not update.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
      onPress={() => {
        setSelected(item);
        setAdminNotes(item.admin_notes || '');
      }}
    >
      <View style={styles.cardHeader}>
        <Flag size={14} color={palette.primary} />
        <Text variant="caption" color={palette.primary} style={styles.badge}>
          {item.category_label || item.category}
        </Text>
        <Text variant="caption" color={palette.textTertiary} style={styles.date}>
          {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
        </Text>
      </View>
      <Text variant="body" color={palette.textPrimary} style={styles.message} numberOfLines={2}>
        {item.message || item.category_label}
      </Text>
      <View style={styles.meta}>
        <User size={12} color={palette.textSecondary} />
        <Text variant="caption" color={palette.textSecondary}>
          {item.reporter_email || `User #${item.user_id}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        renderItem={renderItem}
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
            <Text variant="title" color={palette.textPrimary} style={styles.modalTitle}>
              Feedback detail
            </Text>
            <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 12 }}>
              {selected?.category_label} · {selected?.status}
            </Text>
            <Text variant="body" color={palette.textPrimary} style={{ marginBottom: 12 }}>
              {selected?.message || '(No additional message)'}
            </Text>
            <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 12 }}>
              From: {selected?.reporter_email || selected?.user_id}
            </Text>
            {selected?.article_id ? (
              <TouchableOpacity
                onPress={() => {
                  setSelected(null);
                  navigation?.navigate?.('ArticleDetail', { articleId: selected.article_id });
                }}
                style={{ marginBottom: 12 }}
              >
                <Text variant="body" color={palette.primary} style={{ fontWeight: '600' }}>
                  View article
                </Text>
              </TouchableOpacity>
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
                style={[styles.actionBtn, { backgroundColor: palette.primary }]}
                onPress={() => saveDetail('reviewed')}
                disabled={saving}
              >
                <Text variant="body" color="#fff" style={{ fontWeight: '700' }}>
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
          </View>
        </View>
      </Modal>
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
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: { fontWeight: '700', textTransform: 'uppercase' },
  date: { marginLeft: 'auto' },
  message: { fontWeight: '600', marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 20, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 4 },
  notesInput: { minHeight: 80, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16, textAlignVertical: 'top' },
  modalActions: { gap: 10 },
  actionBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});

export default FeedbackTab;

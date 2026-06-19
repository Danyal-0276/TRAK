import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
  Linking,
  Pressable,
} from 'react-native';
import { Bell, ExternalLink } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import { adminFilledButtonColors } from '../adminTheme';
import AdminNotificationCard from '../components/AdminNotificationCard';
import EmptyState from '../components/EmptyState';
import Text from '../../../components/ui/Text';
import AdminListRowSkeleton from '../components/skeletons/AdminListRowSkeleton';
import { markAdminNotificationRead } from '../../../api/adminApi';
import { dispatchAdminNotificationRead } from '../../../utils/adminNotificationsEvents';
import {
  NOTIFICATION_FILTER_TABS,
  countNotificationsByFilter,
  matchesNotificationFilter,
  getNotificationTypeMeta,
  notificationReadStatus,
} from '../../../constants/adminNotificationMeta';

const NotificationsTab = ({ notifications, onSwitchTab, loading = false, onNotificationRead }) => {
  const { palette } = useAdminTheme();
  const actionBtn = adminFilledButtonColors(palette);
  const [activeTab, setActiveTab] = useState('all');
  const [selected, setSelected] = useState(null);

  const counts = useMemo(() => countNotificationsByFilter(notifications), [notifications]);
  const filtered = useMemo(
    () => notifications.filter((n) => matchesNotificationFilter(n, activeTab)),
    [notifications, activeTab]
  );

  const openDetail = async (row) => {
    setSelected(row);
    if (!row.read && row.id) {
      try {
        await markAdminNotificationRead(row.id);
        onNotificationRead?.(row.id);
        dispatchAdminNotificationRead(row.id);
      } catch {
        // keep modal open
      }
    }
  };

  const selectedType = selected ? getNotificationTypeMeta(selected.type) : null;
  const selectedRead = selected ? notificationReadStatus(selected) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${palette.primary}15` }]}>
          <Bell size={20} color={palette.primary} />
        </View>
        <Text variant="title" color={palette.textPrimary} style={styles.title}>
          Notifications
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {NOTIFICATION_FILTER_TABS.map(({ key, label }) => {
          const active = activeTab === key;
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
              onPress={() => setActiveTab(key)}
            >
              <Text variant="caption" color={active ? palette.primary : palette.textSecondary}>
                {label} ({counts[key] ?? 0})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <AdminListRowSkeleton palette={palette} count={4} />
      ) : (
        <FlatList
          style={styles.listScroll}
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <AdminNotificationCard item={item} palette={palette} onPress={openDetail} />
          )}
          ListEmptyComponent={
            <EmptyState icon={Bell} title="No notifications" subtitle="Nothing in this view yet." />
          }
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={Boolean(selected)} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSelected(null)} accessibilityLabel="Close notification" />
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text variant="title" color={palette.textPrimary} style={styles.modalTitle}>
                Notification detail
              </Text>
              <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 12 }}>
                {selectedType?.label}
                {selectedRead ? (
                  <Text variant="caption" style={{ color: selectedRead.color, fontWeight: '700' }}>
                    {` · ${selectedRead.label}`}
                  </Text>
                ) : null}
                {selected?.important ? (
                  <Text variant="caption" style={{ color: '#ef4444', fontWeight: '700' }}>
                    {' · Important'}
                  </Text>
                ) : null}
              </Text>

              <Text variant="body" color={palette.textPrimary} style={styles.headline}>
                {selected?.text || selected?.message || '(No headline)'}
              </Text>
              {selected?.details ? (
                <Text variant="body" color={palette.textSecondary} style={{ marginBottom: 12, lineHeight: 22 }}>
                  {selected.details}
                </Text>
              ) : null}

              {selected?.meta?.reporter_email || selected?.meta?.user_id ? (
                <Text variant="caption" color={palette.textSecondary} style={{ marginBottom: 12 }}>
                  From: {selected.meta.reporter_email || `User #${selected.meta.user_id}`}
                </Text>
              ) : null}

              {selected?.meta?.post_title ? (
                <View style={[styles.articleBox, { borderColor: palette.border, backgroundColor: palette.pageAlt }]}>
                  <Text variant="caption" color={palette.textSecondary}>Linked article</Text>
                  <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600', marginTop: 6 }}>
                    {selected.meta.post_title}
                  </Text>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                {selected?.meta?.feedback_id && onSwitchTab ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: actionBtn.background }]}
                    onPress={() => {
                      setSelected(null);
                      onSwitchTab('feedback');
                    }}
                  >
                    <Text variant="body" color={actionBtn.foreground} style={{ fontWeight: '700' }}>
                      Open feedback
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {selected?.meta?.canonical_url || selected?.meta?.url ? (
                  <TouchableOpacity
                    style={[styles.actionBtn, { borderWidth: 1, borderColor: palette.border, flexDirection: 'row', justifyContent: 'center', gap: 6 }]}
                    onPress={() => Linking.openURL(selected.meta.canonical_url || selected.meta.url).catch(() => {})}
                  >
                    <ExternalLink size={14} color={palette.primary} />
                    <Text variant="body" color={palette.primary} style={{ fontWeight: '600' }}>
                      Source
                    </Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity onPress={() => setSelected(null)}>
                  <Text variant="body" color={palette.textTertiary}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
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
  listScroll: { flex: 1 },
  list: { paddingBottom: 100 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 20, maxHeight: '85%' },
  modalTitle: { fontWeight: '700', marginBottom: 4 },
  headline: { fontWeight: '600', marginBottom: 12, lineHeight: 22 },
  articleBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  modalActions: { gap: 10, marginTop: 8 },
  actionBtn: { paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
});

export default NotificationsTab;

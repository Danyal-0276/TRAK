import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Shield, Plus, Trash2, Calendar } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import { useAuth } from '../../../context/AuthContext';
import SearchBar from '../components/SearchBar';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';
import { useFeedback } from '../../../components/ui/FeedbackProvider';
import AdminListRowSkeleton from '../components/skeletons/AdminListRowSkeleton';
import { ADMIN_TEXT_STYLE } from '../adminTypography';
import { adminFilledButtonColors } from '../adminTheme';
import { formatCalendarDate } from '../../../utils/formatCalendarDate';

function isAdminActive(admin) {
  if (typeof admin?.is_active === 'boolean') return admin.is_active;
  return admin?.status === 'active';
}

const AdminsTab = ({
  admins,
  searchQuery,
  onSearchChange,
  onDelete,
  deletingId = null,
  onCreate,
  loading = false,
}) => {
  const { palette } = useAdminTheme();
  const actionBtn = adminFilledButtonColors(palette);
  const { isSuperAdmin } = useAuth();
  const { confirm } = useFeedback();
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!onCreate) return;
    setCreating(true);
    try {
      await onCreate(email.trim(), password);
      setShowCreate(false);
      setEmail('');
      setPassword('');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (admin) => {
    if (!onDelete || admin.is_super_admin) return;
    const ok = await confirm({
      title: 'Delete admin?',
      message: `Remove ${admin.email}?`,
      confirmText: 'Delete',
      danger: true,
    });
    if (ok) onDelete(admin.id);
  };

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${palette.primary}15` }]}>
            <Shield size={20} color={palette.primary} />
          </View>
          <Text variant="subtitle" color={palette.textPrimary} style={ADMIN_TEXT_STYLE.sectionTitle}>
            Administrators
          </Text>
        </View>
        {isSuperAdmin ? (
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={[styles.addBtn, { backgroundColor: actionBtn.background }]}
          >
            <Plus size={18} color={actionBtn.foreground} />
          </TouchableOpacity>
        ) : null}
      </View>

      <SearchBar value={searchQuery} onChangeText={onSearchChange} placeholder="Search admins..." palette={palette} />

      {loading ? (
        <AdminListRowSkeleton palette={palette} count={5} />
      ) : admins.length === 0 ? (
        <EmptyState icon={Shield} title="No admins found" subtitle="No administrator accounts" />
      ) : (
        admins.map((admin) => {
          const active = isAdminActive(admin);
          const created = formatCalendarDate(admin.created_at);
          const statusColor = active ? palette.success || '#16a34a' : palette.textSecondary;
          return (
            <View
              key={admin.id}
              style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
            >
              <View style={[styles.avatar, { backgroundColor: `${palette.primary}18` }]}>
                <Shield size={22} color={palette.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '700' }} numberOfLines={1}>
                  {admin.email}
                </Text>
                <View style={styles.metaRow}>
                  <View style={[styles.statusBadge, { backgroundColor: `${statusColor}18` }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text variant="caption" style={{ color: statusColor, fontWeight: '600' }}>
                      {active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  {created ? (
                    <View style={styles.dateRow}>
                      <Calendar size={12} color={palette.textSecondary} />
                      <Text variant="caption" color={palette.textSecondary}>
                        {created}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {admin.is_super_admin ? (
                  <Text variant="caption" style={{ color: palette.primary, fontWeight: '700', marginTop: 4 }}>
                    Super Admin
                  </Text>
                ) : null}
              </View>
              {isSuperAdmin && !admin.is_super_admin ? (
                <TouchableOpacity
                  onPress={() => handleDelete(admin)}
                  style={[styles.deleteBtn, { opacity: String(deletingId) === String(admin.id) ? 0.5 : 1 }]}
                  disabled={String(deletingId) === String(admin.id)}
                >
                  {String(deletingId) === String(admin.id) ? (
                    <ActivityIndicator size="small" color={palette.error || '#ef4444'} />
                  ) : (
                    <Trash2 size={18} color={palette.error || '#ef4444'} />
                  )}
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })
      )}

      <Modal visible={showCreate} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
            <Text variant="subtitle" color={palette.textPrimary} style={{ marginBottom: 16 }}>
              Create admin
            </Text>
            <TextInput
              placeholder="Email"
              placeholderTextColor={palette.textSecondary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, { borderColor: palette.border, color: palette.textPrimary }]}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor={palette.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={[styles.input, { borderColor: palette.border, color: palette.textPrimary }]}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setShowCreate(false)} disabled={creating}>
                <Text variant="body" color={palette.textSecondary}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreate}
                disabled={creating || !email.trim() || password.length < 6}
                style={[styles.createBtn, { backgroundColor: actionBtn.background }]}
              >
                {creating ? (
                  <ActivityIndicator color={actionBtn.foreground} />
                ) : (
                  <Text variant="body" style={{ color: actionBtn.foreground, fontWeight: '600' }}>
                    Create
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: { paddingHorizontal: 20, paddingTop: 8 },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtn: { padding: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: { borderRadius: 16, padding: 20, borderWidth: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  createBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, minWidth: 88, alignItems: 'center' },
});

export default React.memo(AdminsTab);

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Shield, Plus, Trash2 } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import { useAuth } from '../../../context/AuthContext';
import SearchBar from '../components/SearchBar';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';
import { useFeedback } from '../../../components/ui/FeedbackProvider';

const AdminsTab = ({
  admins,
  searchQuery,
  onSearchChange,
  onDelete,
  onCreate,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
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
          <Text variant="title" color={palette.textPrimary} style={styles.sectionTitle}>
            Administrators
          </Text>
        </View>
        {isSuperAdmin ? (
          <TouchableOpacity
            onPress={() => setShowCreate(true)}
            style={[styles.addBtn, { backgroundColor: palette.primary }]}
          >
            <Plus size={18} color="#fff" />
          </TouchableOpacity>
        ) : null}
      </View>

      <SearchBar value={searchQuery} onChangeText={onSearchChange} placeholder="Search admins..." palette={palette} />

      {admins.length === 0 ? (
        <EmptyState icon={Shield} title="No admins found" subtitle="No administrator accounts" />
      ) : (
        admins.map((admin) => (
          <View
            key={admin.id}
            style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="body" color={palette.textPrimary} style={{ fontWeight: '600' }}>
                {admin.email}
              </Text>
              <Text variant="caption" color={palette.textSecondary} style={{ marginTop: 4 }}>
                {admin.is_active ? 'Active' : 'Inactive'}
                {admin.is_super_admin ? ' · Super Admin' : ''}
              </Text>
            </View>
            {isSuperAdmin && !admin.is_super_admin ? (
              <TouchableOpacity onPress={() => handleDelete(admin)} style={styles.deleteBtn}>
                <Trash2 size={18} color={palette.error || '#ef4444'} />
              </TouchableOpacity>
            ) : null}
          </View>
        ))
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
                style={[styles.createBtn, { backgroundColor: palette.primary }]}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text variant="body" style={{ color: '#fff', fontWeight: '600' }}>
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
  sectionTitle: { fontSize: 20, fontWeight: '700' },
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

export default AdminsTab;

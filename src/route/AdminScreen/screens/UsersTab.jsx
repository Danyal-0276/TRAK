import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import SearchBar from '../components/SearchBar';
import UserCard from '../components/UserCard';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';
import AdminListRowSkeleton from '../components/skeletons/AdminListRowSkeleton';
import { ADMIN_TEXT_STYLE } from '../adminTypography';

const UsersTab = ({ users, searchQuery, onSearchChange, onEdit, onDelete, deletingId = null, loading = false }) => {
  const { palette } = useAdminTheme();

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${palette.primary}15` }]}>
            <Users size={20} color={palette.primary} />
          </View>
          <Text variant="subtitle" color={palette.textPrimary} style={ADMIN_TEXT_STYLE.sectionTitle}>
            Users Management
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search users..."
        palette={palette}
      />

      {loading ? (
        <AdminListRowSkeleton palette={palette} count={6} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          subtitle={searchQuery ? "Try a different search term" : "No users available"}
        />
      ) : (
        users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            deletingId={deletingId}
            palette={palette}
          />
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  managementSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  managementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(UsersTab);

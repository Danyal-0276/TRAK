import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import SearchBar from '../components/SearchBar';
import UserCard from '../components/UserCard';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';

const UsersTab = ({ users, searchQuery, onSearchChange, onEdit, onDelete }) => {
  const { palette } = useAdminTheme();

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${palette.primary}15` }]}>
            <Users size={20} color={palette.primary} />
          </View>
          <Text variant="title" color={palette.textPrimary} style={styles.sectionTitle}>
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

      {users.length === 0 ? (
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
  sectionTitle: {
    fontWeight: '700',
  },
});

export default UsersTab;

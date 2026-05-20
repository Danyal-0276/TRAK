import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Users } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import SearchBar from '../components/SearchBar';
import UserCard from '../components/UserCard';
import Text from '../../../components/ui/Text';
import EmptyState from '../components/EmptyState';

const UsersTab = ({ users, searchQuery, onSearchChange, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={styles.managementSection}>
      <View style={styles.managementHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Users size={20} color={colors.primary} />
          </View>
          <Text variant="title" color={colors.textPrimary} style={styles.sectionTitle}>
            Users Management
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder="Search users..."
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
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});

export default UsersTab;
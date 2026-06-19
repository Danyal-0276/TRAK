import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Edit2, Trash2, User } from 'lucide-react-native';
import { useAdminTheme } from '../useAdminTheme';
import Text from '../../../components/ui/Text';
import LinearGradient from 'react-native-linear-gradient';

const UserCard = ({ user, onEdit, onDelete, deletingId = null, palette: paletteProp }) => {
  const { palette: themePalette } = useAdminTheme();
  const palette = paletteProp || themePalette;
  const isActive = user.status === 'active';
  const isDeleting = deletingId != null && String(deletingId) === String(user.id);

  return (
    <View style={[styles.itemCard, {
      backgroundColor: palette.card,
      borderColor: palette.border,
    }]}>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: `${palette.primary}15` }]}>
            <User size={20} color={palette.primary} />
          </View>
          <View style={styles.itemTitleContainer}>
            <Text variant="body" color={palette.textPrimary} style={styles.itemTitle}>
              {user.name}
            </Text>
            <Text variant="caption" color={palette.textSecondary} style={styles.itemSubtitle}>
              {user.email}
            </Text>
          </View>
        </View>
        <View style={styles.itemMeta}>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: isActive ? `${palette.primary}20` : `${palette.textSecondary}20` }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isActive ? palette.primary : palette.textSecondary }
            ]} />
            <Text variant="caption" style={[
              styles.statusText,
              { color: isActive ? palette.primary : palette.textSecondary }
            ]}>
              {user.status}
            </Text>
          </View>
          {user.isAdmin ? (
            <View style={[styles.statusBadge, { backgroundColor: `${palette.error}18` }]}>
              <Text variant="caption" style={[styles.statusText, { color: palette.error }]}>Admin</Text>
            </View>
          ) : null}
          <Text variant="caption" color={palette.textTertiary} style={styles.itemDate}>
            Joined: {user.joinDate}
          </Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: `${palette.primary}15` }]} 
          onPress={() => onEdit(user)}
          activeOpacity={0.7}
        >
          <Edit2 size={18} color={palette.primary} />
        </TouchableOpacity>
        {onDelete ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: `${palette.error}15`, opacity: isDeleting ? 0.6 : 1 }]} 
            onPress={() => onDelete(user.id)}
            activeOpacity={0.7}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={palette.error} />
            ) : (
              <Trash2 size={18} color={palette.error} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitleContainer: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  itemSubtitle: {},
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  itemDate: {},
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default UserCard;
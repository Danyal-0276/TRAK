import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, Settings, LogOut, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';
import { formatCalendarDate } from '../../../utils/formatCalendarDate';

const ActionRow = ({ icon: Icon, label, onPress, colors, accent, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.actionRow, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
  >
    <View style={[styles.actionIcon, { backgroundColor: danger ? 'rgba(239,68,68,0.1)' : accent }]}>
      <Icon size={18} color={danger ? '#ef4444' : colors.primary || '#0f172a'} strokeWidth={2.25} />
    </View>
    <Text style={[styles.actionLabel, { color: danger ? '#ef4444' : colors.textPrimary }]}>{label}</Text>
    <ChevronRight size={18} color={colors.textTertiary} />
  </TouchableOpacity>
);

const InfoRow = ({ label, value, colors }) => (
  <View style={styles.infoRow}>
    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: colors.textPrimary }]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

export default function AdminProfileView({ user, isSuperAdmin, onOpenSettings, onLogout }) {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const accentSoft = colors.primary
    ? `${colors.primary}18`
    : isDark
      ? 'rgba(129,140,248,0.14)'
      : '#eff6ff';

  const email = user?.email || '';
  const initial = (email || 'A').charAt(0).toUpperCase();
  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Administrator';
  const memberSince = formatCalendarDate(user?.created_at || user?.date_joined, { month: 'long' }) || '—';

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <View style={styles.identity}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isDark ? colors.backgroundSecondary : colors.primary,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: isDark ? colors.textPrimary : '#fff' }]}>{initial}</Text>
          </View>
          <View style={styles.identityText}>
            <Text style={[styles.email, { color: colors.textPrimary }]} numberOfLines={1}>
              {email}
            </Text>
            <View style={styles.roleRow}>
              <Shield size={14} color={colors.primary} />
              <Text style={[styles.role, { color: colors.textSecondary }]}>{roleLabel}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { borderTopColor: colors.borderLight }]}>
          <InfoRow label="Role" value={user?.role || 'admin'} colors={colors} />
          <InfoRow label="Member since" value={memberSince} colors={colors} />
        </View>
      </View>

      <ActionRow
        icon={Settings}
        label="Admin settings"
        onPress={onOpenSettings}
        colors={colors}
        accent={accentSoft}
      />
      {onLogout ? (
        <ActionRow icon={LogOut} label="Log out" onPress={onLogout} colors={colors} accent="rgba(239,68,68,0.1)" danger />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    marginBottom: 6,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  email: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  role: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
});

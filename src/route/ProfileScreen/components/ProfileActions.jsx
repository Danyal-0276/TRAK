import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Edit, Settings, Shield, ChevronRight, LogOut } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import Text from '../../../components/ui/Text';

const ActionRow = ({ icon: Icon, label, subtitle, onPress, colors, accent, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.75}
    style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
  >
    <View
      style={[
        styles.iconWrap,
        {
          backgroundColor: danger ? 'rgba(239,68,68,0.1)' : accent,
        },
      ]}
    >
      <Icon size={18} color={danger ? '#ef4444' : colors.primary || '#0f172a'} strokeWidth={2.25} />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowLabel, { color: danger ? '#ef4444' : colors.textPrimary }]}>{label}</Text>
      {subtitle ? (
        <Text style={[styles.rowSub, { color: colors.textSecondary }]} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>
    <ChevronRight size={18} color={colors.textTertiary} />
  </TouchableOpacity>
);

const ProfileActions = ({ navigation, onLogout }) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { isAdmin } = useAuth();
  const isDark = theme.mode === 'dark';
  const accentSoft = colors.primary
    ? `${colors.primary}18`
    : isDark
      ? 'rgba(129,140,248,0.14)'
      : '#eff6ff';

  const openSettings = () => navigation.navigate('SettingsScreen');

  const openAdmin = () => navigation.navigate('AdminScreen');

  return (
    <View style={styles.wrap}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Account</Text>
      <ActionRow
        icon={Edit}
        label="Edit profile"
        subtitle="Name, bio, avatar, contact info"
        onPress={() => navigation.navigate('EditProfileScreen')}
        colors={colors}
        accent={accentSoft}
      />
      <ActionRow
        icon={Settings}
        label="Settings"
        subtitle="Notifications, interests, privacy"
        onPress={openSettings}
        colors={colors}
        accent={accentSoft}
      />
      {isAdmin ? (
        <ActionRow
          icon={Shield}
          label="Admin dashboard"
          subtitle="Manage users, articles, pipeline"
          onPress={openAdmin}
          colors={colors}
          accent={accentSoft}
        />
      ) : null}
      {onLogout ? (
        <ActionRow
          icon={LogOut}
          label="Log out"
          subtitle="Sign out of this device"
          onPress={onLogout}
          colors={colors}
          accent="rgba(239,68,68,0.1)"
          danger
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
});

export default ProfileActions;

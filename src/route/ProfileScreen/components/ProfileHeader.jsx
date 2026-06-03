import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CheckCircle2, Mail, Phone, Calendar, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react-native';
import { useTheme } from '../../../theme/ThemeContext';
import Text from '../../../components/ui/Text';
import ProfileAvatar from './ProfileAvatar';

function formatJoined(dateStr) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

const ProfileHeader = ({
  name,
  username,
  bio,
  avatarUri,
  verified,
  email,
  phone,
  emailVerified,
  phoneVerified,
  dateJoined,
  stats,
  onPressAvatar,
  onLongPressAvatar,
  onStatPress,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const accent = colors.primary;
  const accentSoft = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
  const joined = formatJoined(dateJoined);

  const statItems = [
    { key: 'liked', label: 'Liked', value: String(stats?.liked ?? 0), Icon: ThumbsUp },
    { key: 'disliked', label: 'Disliked', value: String(stats?.disliked ?? 0), Icon: ThumbsDown },
    { key: 'saved', label: 'Saved', value: String(stats?.saved ?? 0), Icon: BookOpen },
  ];

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={[styles.heroBand, { backgroundColor: accentSoft }]}>
        <View style={[styles.heroGlow, { backgroundColor: accent }]} />
      </View>

      <TouchableOpacity
        style={styles.avatarTouch}
        activeOpacity={0.9}
        onPress={onPressAvatar}
        onLongPress={onLongPressAvatar}
      >
        <ProfileAvatar
          uri={avatarUri}
          name={name}
          accent={accent}
          surfaceColor={colors.surface}
        />
        {verified ? (
          <View style={[styles.verifiedBadge, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <CheckCircle2 size={16} color={colors.success || '#16a34a'} fill={colors.success || '#16a34a'} />
          </View>
        ) : null}
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[styles.username, { color: colors.textSecondary }]} numberOfLines={1}>
          {username}
        </Text>
        <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={4}>
          {bio}
        </Text>

        <View style={styles.chips}>
          {email ? (
            <View style={[styles.chip, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
              <Mail size={13} color={colors.textSecondary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                {email}
              </Text>
              <Text style={[styles.chipStatus, { color: emailVerified ? '#16a34a' : colors.textTertiary }]}>
                {emailVerified ? '✓' : '·'}
              </Text>
            </View>
          ) : null}
          {phone ? (
            <View style={[styles.chip, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
              <Phone size={13} color={colors.textSecondary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]} numberOfLines={1}>
                {phone}
              </Text>
              <Text style={[styles.chipStatus, { color: phoneVerified ? '#16a34a' : colors.textTertiary }]}>
                {phoneVerified ? '✓' : '·'}
              </Text>
            </View>
          ) : null}
          {joined ? (
            <View style={[styles.chip, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}>
              <Calendar size={13} color={colors.textSecondary} />
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>Joined {joined}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          {statItems.map((item) => {
            const StatWrap = onStatPress ? TouchableOpacity : View;
            return (
              <StatWrap
                key={item.key}
                style={[styles.statCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.borderLight }]}
                {...(onStatPress
                  ? {
                      activeOpacity: 0.75,
                      onPress: () => onStatPress(item.key),
                      accessibilityRole: 'button',
                      accessibilityLabel: `${item.label}, ${item.value}`,
                    }
                  : {})}
              >
                {item.Icon ? (
                  <View style={{ marginBottom: 4 }}>
                    <item.Icon size={16} color={colors.textSecondary} />
                  </View>
                ) : null}
                <Text style={[styles.statValue, { color: colors.textPrimary }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.label}</Text>
              </StatWrap>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'visible',
    marginBottom: 16,
  },
  heroBand: {
    height: 92,
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  heroGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -60,
    right: -20,
    opacity: 0.12,
  },
  avatarTouch: {
    alignSelf: 'center',
    marginTop: -44,
    marginBottom: 8,
    zIndex: 2,
    paddingHorizontal: 16,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  chips: {
    width: '100%',
    marginTop: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  chipStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 18,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});

export default ProfileHeader;

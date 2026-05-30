import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Heart, Newspaper, Users } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import Text from '../../components/ui/Text';
import {
  ABOUT_META,
  ABOUT_STATS,
  ABOUT_FEATURES,
  ABOUT_TEAM,
} from './aboutContent';

const AboutScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const isDark = theme.mode === 'dark';

  const accent = colors.primary;
  const accentSoft = colors.primary ? `${colors.primary}18` : isDark ? 'rgba(129,140,248,0.14)' : '#eff6ff';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: Math.max(insets.top, 8), paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { borderColor: colors.borderLight, backgroundColor: colors.surface }]}>
          <View style={[styles.heroGlow, { backgroundColor: accentSoft }]} />
          <View style={styles.heroRow}>
            <View style={[styles.heroIcon, { backgroundColor: accent }]}>
              <Newspaper size={26} color="#fff" strokeWidth={2} />
            </View>
            <View style={styles.heroCopy}>
              <View style={styles.heroTitleRow}>
                <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>TRAK</Text>
                <View style={[styles.versionPill, { backgroundColor: accentSoft, borderColor: colors.borderLight }]}>
                  <Text style={[styles.versionText, { color: accent }]}>v{ABOUT_META.version}</Text>
                </View>
              </View>
              <Text style={[styles.tagline, { color: colors.textPrimary }]}>{ABOUT_META.tagline}</Text>
              <Text style={[styles.intro, { color: colors.textSecondary }]}>{ABOUT_META.intro}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {ABOUT_STATS.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            >
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: colors.textPrimary }]} numberOfLines={1}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>What you can do</Text>
        {ABOUT_FEATURES.map((feature) => (
          <View
            key={feature.key}
            style={[styles.featureCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          >
            <Text style={styles.featureEmoji}>{feature.emoji}</Text>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>{feature.title}</Text>
            <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.description}</Text>
          </View>
        ))}

        {/* Team */}
        <View style={styles.teamHeader}>
          <Users size={20} color={accent} strokeWidth={2.25} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>Built by</Text>
        </View>
        {ABOUT_TEAM.map((member) => (
          <View
            key={member.name}
            style={[styles.teamCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
          >
            <View style={[styles.avatar, { backgroundColor: accent }]}>
              <Text style={styles.avatarText}>{member.initials}</Text>
            </View>
            <View style={styles.teamCopy}>
              <Text style={[styles.memberName, { color: colors.textPrimary }]}>{member.name}</Text>
              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.footerRow}>
            <Heart size={16} color="#ef4444" fill="#ef4444" />
            <Text style={[styles.footerTitle, { color: colors.textPrimary }]}>Made with care</Text>
          </View>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Thank you for using TRAK. We are improving feeds, discovery, and trust signals every release.
          </Text>
          <Text style={[styles.copyright, { color: colors.textSecondary }]}>
            © {ABOUT_META.year} TRAK
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 16,
  },
  hero: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: { flex: 1, minWidth: 0 },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  versionPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  featureCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  featureEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    marginBottom: 12,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  teamCopy: { flex: 1 },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  copyright: {
    fontSize: 12,
    marginTop: 12,
    opacity: 0.8,
  },
});

export default AboutScreen;

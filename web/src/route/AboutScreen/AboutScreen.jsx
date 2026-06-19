import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Newspaper, Users, Shield, Database } from 'lucide-react';
import {
  ABOUT_META,
  ABOUT_FEATURES,
  ABOUT_TEAM,
} from './aboutContent';
import { getAboutStats } from '../../utils/Service/api';
import { formatDateTime } from '../../utils/formatDateTime';
import { useTheme } from '../../theme/ThemeContext';
import { useResponsive } from '../../hooks/useResponsive';
import { useLanguage } from '../../context/LanguageContext';

const AboutScreen = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const isDark = theme.mode === 'dark';
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getAboutStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const liveStats = [
    {
      label: t('about.articlesIndexed'),
      value: statsLoading ? '…' : (stats?.article_count != null ? Number(stats.article_count).toLocaleString() : '—'),
    },
    {
      label: t('about.trustedSources'),
      value: statsLoading ? '…' : (stats?.source_count != null ? Number(stats.source_count).toLocaleString() : '—'),
    },
    {
      label: t('about.categories'),
      value: statsLoading ? '…' : (stats?.category_count != null ? String(stats.category_count) : '—'),
    },
  ];

  const backgroundColor = colors.background;
  const cardBackground = isDark ? colors.surfaceElevated : colors.surface;
  const textPrimary = colors.textPrimary;
  const textSecondary = colors.textSecondary;
  const borderColor = colors.border;
  const accent = colors.primary;
  const iconTileBg = isDark ? colors.backgroundTertiary : colors.primary;
  const iconTileFg = isDark ? colors.textPrimary : colors.textOnPrimary;
  const avatarBg = isDark ? colors.backgroundTertiary : colors.primary;
  const avatarFg = isDark ? colors.textPrimary : colors.textOnPrimary;
  const accentSoft = isDark ? 'rgba(255, 255, 255, 0.06)' : '#eff6ff';
  const versionPillStyle = isDark
    ? {
        color: colors.textSecondary,
        background: colors.backgroundTertiary,
        border: `1px solid ${borderColor}`,
      }
    : {
        color: colors.primary,
        background: '#dbeafe',
        border: '1px solid #bfdbfe',
      };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor,
        paddingBottom: 48,
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: '0 auto',
          width: '100%',
          padding: isMobile ? '0 16px 24px' : '0 24px 32px',
        }}
      >
        {/* Hero */}
        <div
          style={{
            marginTop: 0,
            marginBottom: 28,
            padding: isMobile ? '24px 20px' : '32px 28px',
            borderRadius: 20,
            border: `1px solid ${borderColor}`,
            background: isDark
              ? `linear-gradient(145deg, ${colors.surfaceElevated} 0%, ${colors.background} 100%)`
              : 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -40,
              right: -40,
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: accentSoft,
              pointerEvents: 'none',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: iconTileBg,
                border: isDark ? `1px solid ${borderColor}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Newspaper size={28} color={iconTileFg} strokeWidth={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <h1
                  style={{
                    fontSize: isMobile ? 26 : 32,
                    fontWeight: 800,
                    color: textPrimary,
                    margin: 0,
                    letterSpacing: '-0.6px',
                  }}
                >
                  About TRAK
                </h1>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                    ...versionPillStyle,
                  }}
                >
                  v{ABOUT_META.version}
                </span>
              </div>
              <p
                style={{
                  fontSize: isMobile ? 16 : 18,
                  fontWeight: 600,
                  color: textPrimary,
                  margin: '0 0 10px',
                  lineHeight: 1.4,
                }}
              >
                {ABOUT_META.tagline}
              </p>
              <p style={{ fontSize: 15, color: textSecondary, margin: 0, lineHeight: 1.65, maxWidth: 640 }}>
                {ABOUT_META.intro}
              </p>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {liveStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                padding: '16px 18px',
                borderRadius: 14,
                border: `1px solid ${borderColor}`,
                backgroundColor: cardBackground,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: textSecondary,
                  textTransform: 'uppercase',
                  letterSpacing: 0.6,
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: textPrimary }}>{stat.value}</div>
            </div>
          ))}
        </div>

        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: '0 0 12px' }}>
            {t('about.missionTitle')}
          </h2>
          <p style={{ fontSize: 15, color: textSecondary, margin: 0, lineHeight: 1.65 }}>
            {t('about.missionBody')}
          </p>
          {stats?.last_updated ? (
            <p style={{ fontSize: 13, color: textSecondary, margin: '12px 0 0', opacity: 0.9 }}>
              {t('about.lastUpdated')}: {formatDateTime(stats.last_updated)}
            </p>
          ) : null}
        </section>

        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Shield size={20} color={accent} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0 }}>{t('about.trustTitle')}</h2>
          </div>
          <p style={{ fontSize: 15, color: textSecondary, margin: 0, lineHeight: 1.65 }}>
            {t('about.trustBody')}
          </p>
        </section>

        {/* Features */}
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: '0 0 16px' }}>What you can do</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 12,
            }}
          >
            {ABOUT_FEATURES.map((feature) => (
              <div
                key={feature.key}
                style={{
                  padding: 18,
                  borderRadius: 14,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardBackground,
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary;
                  e.currentTarget.style.boxShadow = isDark
                    ? '0 8px 24px rgba(0,0,0,0.25)'
                    : '0 8px 24px rgba(15, 23, 42, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: 26, lineHeight: 1, marginBottom: 12 }}>{feature.emoji}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: '0 0 6px' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: 14, color: textSecondary, margin: 0, lineHeight: 1.55 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Database size={20} color={accent} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0 }}>{t('about.techTitle')}</h2>
          </div>
          <p style={{ fontSize: 14, color: textSecondary, margin: 0, lineHeight: 1.6 }}>
            React · Django · MongoDB · Resend · Credibility ML pipeline
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => navigate('/privacy')} style={{ background: 'none', border: 'none', color: accent, cursor: 'pointer', fontWeight: 600 }}>
              {t('sidebar.privacy')}
            </button>
            <button type="button" onClick={() => navigate('/terms')} style={{ background: 'none', border: 'none', color: accent, cursor: 'pointer', fontWeight: 600 }}>
              {t('sidebar.terms')}
            </button>
            <button type="button" onClick={() => navigate('/help')} style={{ background: 'none', border: 'none', color: accent, cursor: 'pointer', fontWeight: 600 }}>
              {t('sidebar.help')}
            </button>
          </div>
        </section>

        {/* Team */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Users size={22} color={isDark ? colors.textSecondary : accent} strokeWidth={2.25} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0 }}>Built by</h2>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {ABOUT_TEAM.map((member) => (
              <div
                key={member.name}
                style={{
                  padding: 22,
                  borderRadius: 14,
                  border: `1px solid ${borderColor}`,
                  backgroundColor: cardBackground,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor: avatarBg,
                    color: avatarFg,
                    border: isDark ? `1px solid ${borderColor}` : 'none',
                    fontSize: 22,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  {member.initials}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 4 }}>
                  {member.name}
                </div>
                <div style={{ fontSize: 13, color: textSecondary, fontWeight: 500 }}>{member.role}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div
          style={{
            padding: 24,
            borderRadius: 16,
            border: `1px solid ${borderColor}`,
            background: cardBackground,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
            }}
          >
            <Heart size={18} color="#ef4444" fill="#ef4444" />
            <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>Made with care</span>
          </div>
          <p style={{ fontSize: 14, color: textSecondary, margin: 0, lineHeight: 1.55 }}>
            Thank you for using TRAK. We are improving feeds, discovery, and trust signals every release.
          </p>
          <p style={{ fontSize: 12, color: textSecondary, margin: '14px 0 0', opacity: 0.85 }}>
            © {ABOUT_META.year} TRAK · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutScreen;

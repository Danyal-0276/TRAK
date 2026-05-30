import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    ChevronDown,
    Compass,
    Hash,
    Heart,
    LayoutGrid,
    MessageCircle,
    Search,
    Settings,
    User,
    Bell,
    Bookmark,
} from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

const tutorialSteps = [
    {
        icon: LayoutGrid,
        title: 'Home feed',
        body: 'Open News feed from the header. Use the For you, Bookmarks, and Trending tabs to switch views. For you is personalized when you pick categories and keywords.',
    },
    {
        icon: Hash,
        title: 'Topics & keywords',
        body: 'During signup you choose news categories. You can add custom keywords in Keyword selection (from settings or onboarding). Your topics appear in the right sidebar and shape your feed.',
    },
    {
        icon: Search,
        title: 'Search & discover',
        body: 'Use Search to query headlines and text across articles. Filters and tabs help narrow results. Click a card to read the full article.',
    },
    {
        icon: Heart,
        title: 'Likes & dislikes',
        body: 'Use the up and down controls on cards to agree or disagree. Counts update for everyone and help surface what readers find useful.',
    },
    {
        icon: Bookmark,
        title: 'Bookmarks',
        body: 'Save articles with the bookmark icon. Open Bookmarks from the menu or sidebar to see everything you saved in one place.',
    },
    {
        icon: Bell,
        title: 'Notifications',
        body: 'Check Notifications for alerts about your account, keywords, and activity. Adjust delivery in Settings.',
    },
    {
        icon: User,
        title: 'Profile',
        body: 'Profile shows your stats and saved articles. Edit profile to change your name, bio, and avatar.',
    },
    {
        icon: Settings,
        title: 'Settings',
        body: 'Configure theme, notification preferences, language, and more. Log out from the bottom of Settings when you are done.',
    },
];

const faqs = [
    {
        q: 'Why is my For you feed empty?',
        a: 'For you needs at least one interest: complete tag selection or add keywords. Then refresh the feed. If it stays empty, check that personalization is enabled in Settings.',
    },
    {
        q: 'How do I change my password?',
        a: 'Use Forgot password on the login screen if you are signed out. When signed in, password changes depend on your deployment; check Settings or contact support if you do not see an option.',
    },
    {
        q: 'Where do saved bookmarks go?',
        a: 'They sync to your account. Open Bookmarks in the sidebar or from the feed tab to see them. Removing a bookmark here removes it from the server for your user.',
    },
    {
        q: 'What do credibility labels mean?',
        a: 'Labels reflect automated analysis of the article text. They are hints, not legal verdicts. Always cross-check important stories with trusted sources.',
    },
    {
        q: 'How do I use the assistant?',
        a: 'Open the chat widget (if enabled). Ask in plain language; it uses your recent feed context to suggest relevant articles.',
    },
    {
        q: 'Who can access the admin panel?',
        a: 'Only accounts with the admin role. If you need access, an existing administrator must grant it in your backend or user database.',
    },
];

const HelpScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const [openFaq, setOpenFaq] = useState(null);

    const backgroundColor = colors.background;
    const cardBackground = colors.surface;
    const textPrimary = colors.textPrimary;
    const textSecondary = colors.textSecondary;
    const borderColor = colors.border;
    const accent = colors.primary;

    return (
        <div style={{ minHeight: '100vh', backgroundColor, marginTop: 0, paddingTop: 0 }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '0 24px 48px 24px' }}>
                <div style={{ marginBottom: '28px', paddingTop: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: isDark ? colors.surfaceElevated : '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: `1px solid ${borderColor}`,
                            }}
                        >
                            <Compass size={22} color={accent} />
                        </div>
                        <div>
                            <h1
                                style={{
                                    fontSize: '28px',
                                    fontWeight: 700,
                                    color: textPrimary,
                                    margin: 0,
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                Help center
                            </h1>
                            <p style={{ fontSize: '15px', color: textSecondary, margin: '4px 0 0 0', lineHeight: 1.5 }}>
                                Quick tutorial and answers about TRAK
                            </p>
                        </div>
                    </div>
                </div>

                <section style={{ marginBottom: '36px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <BookOpen size={20} color={accent} />
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: textPrimary, margin: 0 }}>App tutorial</h2>
                    </div>
                    <p style={{ fontSize: '14px', color: textSecondary, lineHeight: 1.6, margin: '0 0 20px 0' }}>
                        Follow these steps to get the most out of TRAK on web.
                    </p>
                    <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                        {tutorialSteps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <li
                                    key={step.title}
                                    style={{
                                        display: 'flex',
                                        gap: '16px',
                                        marginBottom: index < tutorialSteps.length - 1 ? '16px' : 0,
                                        padding: '16px',
                                        backgroundColor: cardBackground,
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '12px',
                                    }}
                                >
                                    <div
                                        style={{
                                            flexShrink: 0,
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '8px',
                                            backgroundColor: isDark ? colors.surfaceElevated : '#f8fafc',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Icon size={18} color={accent} />
                                    </div>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                fontWeight: 700,
                                                color: textSecondary,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.04em',
                                                marginBottom: '4px',
                                            }}
                                        >
                                            Step {index + 1}
                                        </div>
                                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: textPrimary, margin: '0 0 8px 0' }}>
                                            {step.title}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: textSecondary, lineHeight: 1.65, margin: 0 }}>
                                            {step.body}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                </section>

                <section style={{ marginBottom: '36px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <MessageCircle size={20} color={accent} />
                        <h2 style={{ fontSize: '20px', fontWeight: 700, color: textPrimary, margin: 0 }}>FAQs</h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {faqs.map((item, i) => {
                            const open = openFaq === i;
                            return (
                                <div
                                    key={item.q}
                                    style={{
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        backgroundColor: cardBackground,
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaq(open ? null : i)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            padding: '14px 16px',
                                            border: 'none',
                                            background: open
                                                ? isDark
                                                    ? colors.surfaceElevated
                                                    : '#f8fafc'
                                                : 'transparent',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <span style={{ fontSize: '15px', fontWeight: 600, color: textPrimary }}>{item.q}</span>
                                        <ChevronDown
                                            size={18}
                                            color={textSecondary}
                                            style={{
                                                flexShrink: 0,
                                                transform: open ? 'rotate(180deg)' : 'none',
                                                transition: 'transform 0.2s ease',
                                            }}
                                        />
                                    </button>
                                    {open ? (
                                        <div
                                            style={{
                                                padding: '0 16px 16px 16px',
                                                fontSize: '14px',
                                                color: textSecondary,
                                                lineHeight: 1.65,
                                                borderTop: `1px solid ${borderColor}`,
                                                paddingTop: '12px',
                                            }}
                                        >
                                            {item.a}
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                </section>

                <section
                    style={{
                        padding: '20px',
                        borderRadius: '12px',
                        border: `1px solid ${borderColor}`,
                        backgroundColor: isDark ? colors.surfaceElevated : '#f8fafc',
                    }}
                >
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: textPrimary, margin: '0 0 10px 0' }}>More resources</h3>
                    <p style={{ fontSize: '14px', color: textSecondary, lineHeight: 1.6, margin: '0 0 14px 0' }}>
                        Legal information and product details live on these pages.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {[
                            { label: 'Settings', path: '/settings' },
                            { label: 'About TRAK', path: '/about' },
                            { label: 'Privacy', path: '/privacy' },
                            { label: 'Terms', path: '/terms' },
                        ].map((l) => (
                            <button
                                key={l.path}
                                type="button"
                                onClick={() => navigate(l.path)}
                                style={{
                                    padding: '8px 14px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: isDark ? '#fff' : '#fff',
                                    backgroundColor: accent,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                {l.label}
                            </button>
                        ))}
                    </div>
                </section>
            </div>
            <style>{`
                h1 {
                    margin-top: 0 !important;
                    padding-top: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default HelpScreen;

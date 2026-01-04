import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { 
    Info, 
    Users, 
    Code, 
    Sparkles, 
    Shield, 
    Heart,
    Mail,
    Github,
    Linkedin
} from 'lucide-react';

const AboutScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';

    const backgroundColor = isDark ? colors.background || '#0F172A' : '#ffffff';
    const cardBackground = isDark ? colors.surface || '#1E293B' : '#ffffff';
    const textPrimary = isDark ? colors.textPrimary || '#F1F5F9' : '#0f172a';
    const textSecondary = isDark ? colors.textSecondary || '#CBD5E1' : '#64748b';
    const borderColor = isDark ? colors.border || '#334155' : '#e5e7eb';

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: backgroundColor,
            paddingTop: '0',
            marginTop: '0',
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%',
                padding: '0 24px 24px 24px',
            }}>
                {/* Header Section */}
                <div style={{
                    marginTop: '0',
                    marginBottom: '24px',
                    paddingTop: '0',
                }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 8px 0',
                        paddingTop: '0',
                        letterSpacing: '-0.5px',
                    }}>
                        About TRAK
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Your personalized news aggregation platform
                    </p>
                </div>

                {/* Main Description */}
                <div style={{
                    backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '24px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Info size={24} color="#ffffff" />
                        </div>
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0',
                        }}>
                            What is TRAK?
                        </h2>
                    </div>
                    <p style={{
                        fontSize: '16px',
                        lineHeight: '1.7',
                        color: isDark ? colors.textSecondary || '#CBD5E1' : '#374151',
                        margin: '0',
                    }}>
                        TRAK is a modern news aggregation platform designed to help you stay informed with the latest news and updates from around the world. Our platform provides a personalized experience with intelligent content curation, allowing you to discover articles that matter most to you.
                    </p>
                </div>

                {/* Features Grid */}
                <div style={{
                    marginBottom: '24px',
                }}>
                    <h2 style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: '0 0 16px 0',
                    }}>
                        Key Features
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '12px',
                    }}>
                        <div style={{
                            padding: '20px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            backgroundColor: cardBackground,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                            e.currentTarget.style.boxShadow = isDark 
                                ? '0 2px 8px rgba(129, 140, 248, 0.3)' 
                                : '0 2px 8px rgba(0, 0, 0, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                            <Sparkles size={24} color={isDark ? colors.primary || '#818CF8' : '#0f172a'} style={{ marginBottom: '12px' }} />
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: textPrimary,
                                margin: '0 0 8px 0',
                            }}>
                                Personalized Feed
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: textSecondary,
                                margin: '0',
                                lineHeight: '1.5',
                            }}>
                                Get articles tailored to your interests and preferences
                            </p>
                        </div>

                        <div style={{
                            padding: '20px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            backgroundColor: cardBackground,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                            e.currentTarget.style.boxShadow = isDark 
                                ? '0 2px 8px rgba(129, 140, 248, 0.3)' 
                                : '0 2px 8px rgba(0, 0, 0, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                            <Shield size={24} color={isDark ? colors.primary || '#818CF8' : '#0f172a'} style={{ marginBottom: '12px' }} />
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: textPrimary,
                                margin: '0 0 8px 0',
                            }}>
                                Verified Sources
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: textSecondary,
                                margin: '0',
                                lineHeight: '1.5',
                            }}>
                                All articles are from trusted and verified news sources
                            </p>
                        </div>

                        <div style={{
                            padding: '20px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            backgroundColor: cardBackground,
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = isDark ? colors.primary || '#818CF8' : '#0f172a';
                            e.currentTarget.style.boxShadow = isDark 
                                ? '0 2px 8px rgba(129, 140, 248, 0.3)' 
                                : '0 2px 8px rgba(0, 0, 0, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = borderColor;
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        >
                            <Code size={24} color={isDark ? colors.primary || '#818CF8' : '#0f172a'} style={{ marginBottom: '12px' }} />
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: textPrimary,
                                margin: '0 0 8px 0',
                            }}>
                                Modern Interface
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: textSecondary,
                                margin: '0',
                                lineHeight: '1.5',
                            }}>
                                Clean, intuitive design for the best reading experience
                            </p>
                        </div>
                    </div>
                </div>

                {/* Version & Info */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                    marginBottom: '24px',
                }}>
                    <div style={{
                        padding: '24px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        backgroundColor: cardBackground,
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '8px',
                        }}>
                            Version
                        </div>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: textPrimary,
                        }}>
                            1.0.0
                        </div>
                    </div>

                    <div style={{
                        padding: '24px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '8px',
                        backgroundColor: cardBackground,
                    }}>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '8px',
                        }}>
                            Release Date
                        </div>
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: textPrimary,
                        }}>
                            2024
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div style={{
                    marginBottom: '24px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px',
                    }}>
                        <Users size={24} color={textPrimary} />
                        <h2 style={{
                            fontSize: '22px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: '0',
                        }}>
                            Development Team
                        </h2>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px',
                    }}>
                        <div style={{
                            padding: '20px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            backgroundColor: cardBackground,
                            textAlign: 'center',
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '0 auto 12px',
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#ffffff',
                            }}>
                                SB
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: textPrimary,
                                marginBottom: '4px',
                            }}>
                                Shahroz Butt
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: textSecondary,
                            }}>
                                Developer
                            </div>
                        </div>

                        <div style={{
                            padding: '20px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            backgroundColor: cardBackground,
                            textAlign: 'center',
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '0 auto 12px',
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#ffffff',
                            }}>
                                D
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: textPrimary,
                                marginBottom: '4px',
                            }}>
                                Danyal
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: textSecondary,
                            }}>
                                Developer
                            </div>
                        </div>

                        <div style={{
                            padding: '20px',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '8px',
                            backgroundColor: cardBackground,
                            textAlign: 'center',
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: isDark ? colors.primary || '#818CF8' : '#0f172a',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: '0 auto 12px',
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#ffffff',
                            }}>
                                A
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: textPrimary,
                                marginBottom: '4px',
                            }}>
                                Abdullah
                            </div>
                            <div style={{
                                fontSize: '13px',
                                color: textSecondary,
                            }}>
                                Developer
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Message */}
                <div style={{
                    padding: '24px',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    backgroundColor: isDark ? colors.surfaceElevated || '#334155' : '#f9fafb',
                    textAlign: 'center',
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                    }}>
                        <Heart size={18} color="#ef4444" fill="#ef4444" />
                        <span style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: textPrimary,
                        }}>
                            Made with passion
                        </span>
                    </div>
                    <p style={{
                        fontSize: '14px',
                        color: textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Thank you for using TRAK. We're constantly working to improve your experience.
                    </p>
                </div>
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

export default AboutScreen;

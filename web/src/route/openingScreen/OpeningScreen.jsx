import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import TrakLogo from '../../components/TrakLogo';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Text from '../../components/ui/Text';
import { useAuth } from '../../context/AuthContext';

const OpeningScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const action = filledActionColors(colors, isDark);
    const navigate = useNavigate();
    const { user, loading, isAdmin } = useAuth();

    useEffect(() => {
        if (loading) return;
        if (user?.role === 'admin' || isAdmin) {
            navigate('/admin/dashboard', { replace: true });
        } else if (user) {
            navigate('/newsfeed', { replace: true });
        }
    }, [user, loading, isAdmin, navigate]);
    const [logoScale, setLogoScale] = useState(0);
    const [logoOpacity, setLogoOpacity] = useState(0);
    const [welcomeOpacity, setWelcomeOpacity] = useState(0);
    const [welcomeY, setWelcomeY] = useState(30);
    const [buttonOpacity, setButtonOpacity] = useState(0);
    const [buttonY, setButtonY] = useState(20);
    const [backgroundOpacity, setBackgroundOpacity] = useState(0);

    useEffect(() => {
        // Staggered animations
        const timer1 = setTimeout(() => {
            setLogoScale(1);
            setLogoOpacity(1);
        }, 100);

        const timer2 = setTimeout(() => {
            setWelcomeOpacity(1);
            setWelcomeY(0);
        }, 650);

        const timer3 = setTimeout(() => {
            setButtonOpacity(1);
            setButtonY(0);
        }, 950);

        const timer4 = setTimeout(() => {
            setBackgroundOpacity(1);
        }, 300);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#000000',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Animated Background Circles */}
            <div style={{
                position: 'absolute',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.03)',
                top: '-200px',
                right: '-200px',
                opacity: backgroundOpacity,
                transition: 'opacity 1s ease-out',
            }} />
            <div style={{
                position: 'absolute',
                width: '400px',
                height: '400px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.02)',
                bottom: '-100px',
                left: '-100px',
                opacity: backgroundOpacity,
                transition: 'opacity 1s ease-out',
            }} />

            {/* Top Section - Logo and Brand */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px',
                position: 'relative',
                zIndex: 1,
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}>
                    {/* Logo — full TRAK wordmark (SVG includes brand mark + name) */}
                    <div style={{
                        opacity: logoOpacity,
                        transform: `scale(${logoScale})`,
                        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        filter: 'drop-shadow(0 8px 24px rgba(255, 255, 255, 0.12))',
                    }}>
                        <TrakLogo size={220} variant="dark" />
                    </div>
                </div>
            </div>

            {/* Bottom Section - Welcome and Buttons */}
            <div style={{
                borderTopLeftRadius: '40px',
                borderTopRightRadius: '40px',
                backgroundColor: colors.background,
                padding: '60px',
                paddingBottom: '80px',
                position: 'relative',
                zIndex: 1,
                boxShadow: '0 -4px 40px rgba(0, 0, 0, 0.2)',
            }}>
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    width: '100%',
                }}>
                    {/* Welcome Text Animation - Subtle and Clean */}
                    <div style={{
                        opacity: welcomeOpacity,
                        transform: `translateY(${welcomeY}px)`,
                        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        marginBottom: '48px',
                    }}>
                        <Text variant="body" style={{
                            fontSize: '18px',
                            color: colors.textPrimary,
                            lineHeight: '1.7',
                            fontWeight: '400',
                            letterSpacing: '0.2px',
                            display: 'block',
                        }}>
                            Welcome to a world of exceptional news{'\n'}
                            <span style={{ color: colors.textSecondary }}>
                                curated by TRAK at its core.
                            </span>
                        </Text>
                    </div>

                    {/* Buttons Animation */}
                    <div style={{
                        opacity: buttonOpacity,
                        transform: `translateY(${buttonY}px)`,
                        transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                    }}>
                        <button
                            onClick={() => navigate('/signup')}
                            style={{
                                width: '100%',
                                padding: '18px 32px',
                                backgroundColor: action.background,
                                color: action.foreground,
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '17px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.92';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Create Account
                            <ArrowRight size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                width: '100%',
                                padding: '18px 32px',
                                backgroundColor: colors.surface,
                                color: colors.textPrimary,
                                border: `2px solid ${colors.border}`,
                                borderRadius: '12px',
                                fontSize: '17px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = colors.surface;
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OpeningScreen;

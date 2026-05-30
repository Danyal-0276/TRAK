import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import Text from '../../components/ui/Text';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { requestPasswordReset } from '../../api/authPasswordApi';

const ForgotPasswordScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const action = filledActionColors(colors, isDark);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        
        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }));
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors(prev => ({ ...prev, email: 'Invalid email address' }));
            return;
        }

        setLoading(true);
        try {
            const res = await requestPasswordReset(email.trim());
            navigate('/forgot-password-code', {
                state: {
                    email: email.trim().toLowerCase(),
                    emailSent: res?.email_sent !== false,
                },
            });
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                email: err?.message || 'Could not start reset. Try again.',
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
            padding: '24px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <NewsBackgroundAnimation />
            <div style={{
                width: '100%',
                maxWidth: '420px',
                position: 'relative',
                zIndex: 1,
            }}>
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0',
                        border: 'none',
                        background: 'transparent',
                        color: colors.textSecondary,
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginBottom: '40px',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                {/* Logo */}
                <div style={{ marginBottom: '48px', textAlign: 'left' }}>
                    <img 
                        src="/images/whiteLogo.svg" 
                        alt="TRAK" 
                        style={{ 
                            width: '32px', 
                            height: '32px',
                            filter: 'invert(1)',
                            marginBottom: '40px',
                        }} 
                    />
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2',
                    }}>
                        Reset your password
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Enter your email to receive reset instructions
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '8px',
                        }}>
                            Email address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '15px',
                                border: errors.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                borderRadius: '6px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                color: colors.textPrimary,
                                backgroundColor: colors.background,
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = colors.primary;
                                e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
                            }}
                            onBlur={(e) => {
                                if (!errors.email) {
                                    e.target.style.borderColor = '#cbd5e1';
                                    e.target.style.boxShadow = 'none';
                                }
                            }}
                        />
                        {errors.email && (
                            <p style={{ 
                                color: '#ef4444', 
                                fontSize: '13px', 
                                margin: '6px 0 0 0',
                            }}>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: action.background,
                            color: action.foreground,
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.6 : 1,
                            marginBottom: '32px',
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = colors.primaryDark;
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = colors.primary;
                            }
                        }}
                    >
                        {loading ? 'Sending…' : (
                            <>
                                Send reset code
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: '15px', 
                        color: colors.textSecondary,
                        margin: '0',
                    }}>
                        Remember your password?{' '}
                        <Link to="/login" style={{
                            color: colors.textPrimary,
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;

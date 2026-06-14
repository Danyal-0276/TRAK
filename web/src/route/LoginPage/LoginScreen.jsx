import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { getPostAuthPath, getLoginRedirectPath } from '../../utils/authNavigation';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import TrakLogo from '../../components/TrakLogo';

const LoginScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const returnTo = location.state?.from || searchParams.get('next') || '';
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const action = filledActionColors(colors, isDark);
    const { login, completeSocialLogin, loginWithGoogle } = useAuth();
    const { error: showError } = useUIFeedback();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);

    useEffect(() => {
        const ticket = searchParams.get('social_ticket');
        if (!ticket) return;
        const consume = async () => {
            setLoading(true);
            try {
                const userData = await completeSocialLogin(ticket);
                navigate(
                    getLoginRedirectPath({ user: userData }, returnTo),
                    { replace: true }
                );
            } catch (error) {
                setErrors((prev) => ({ ...prev, password: error.message || 'Social login completion failed' }));
            } finally {
                setLoading(false);
            }
        };
        consume();
    }, [searchParams, completeSocialLogin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        setLoading(true);
        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: 'Email is required' }));
            setLoading(false);
            return;
        }
        if (!password) {
            setErrors(prev => ({ ...prev, password: 'Password is required' }));
            setLoading(false);
            return;
        }
        try {
            const userData = await login(email, password);
            navigate(getLoginRedirectPath({ user: userData }, returnTo), { replace: true });
        } catch (error) {
            const fieldErrors = error.fields || {};
            if (fieldErrors.email) {
                setErrors(prev => ({ ...prev, email: fieldErrors.email }));
            } else if (fieldErrors.password) {
                setErrors(prev => ({ ...prev, password: fieldErrors.password }));
            } else {
                setErrors(prev => ({ ...prev, password: error.message || 'Incorrect email or password. Please try again.' }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                input[type="password"]::-webkit-textfield-decoration-container {
                    display: none !important;
                }
                input[type="password"]::-webkit-credentials-auto-fill-button {
                    display: none !important;
                }
                input[type="password"]::-ms-reveal {
                    display: none !important;
                }
                input[type="password"]::-ms-clear {
                    display: none !important;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes authCardEnter {
                    from { opacity: 0; transform: translateY(24px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .auth-form-card {
                    animation: authCardEnter 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
                }
            `}</style>
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
            <div className="auth-form-card" style={{
                width: '100%',
                maxWidth: '420px',
                position: 'relative',
                zIndex: 1,
            }}>
                <div style={{ marginBottom: '48px', textAlign: 'left' }}>
                    <div style={{ marginBottom: '40px' }}>
                        <TrakLogo size={36} />
                    </div>
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: '600',
                        color: colors.textPrimary,
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2',
                    }}>
                        Sign in to your account
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Enter your email and password to continue
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
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
                                border: errors.email ? '1px solid #ef4444' : `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                color: colors.textPrimary,
                                backgroundColor: colors.backgroundSecondary,
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = colors.primary;
                                e.target.style.boxShadow = isDark ? '0 0 0 3px rgba(255,255,255,0.08)' : '0 0 0 3px rgba(0,0,0,0.08)';
                            }}
                            onBlur={(e) => {
                                if (!errors.email) {
                                    e.target.style.borderColor = colors.border;
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

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '8px' 
                        }}>
                            <label style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: colors.textPrimary,
                            }}>
                                Password
                            </label>
                            <Link to="/forgot-password" style={{
                                fontSize: '14px',
                                color: colors.textPrimary,
                                textDecoration: 'none',
                                fontWeight: '500',
                            }}>
                                Forgot password?
                            </Link>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                style={{
                                    width: '100%',
                                    padding: '11px 45px 11px 14px',
                                    fontSize: '15px',
                                    border: errors.password ? '1px solid #ef4444' : `1px solid ${colors.border}`,
                                    borderRadius: '6px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    color: colors.textPrimary,
                                    backgroundColor: colors.backgroundSecondary,
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = colors.primary;
                                    e.target.style.boxShadow = isDark ? '0 0 0 3px rgba(255,255,255,0.08)' : '0 0 0 3px rgba(0,0,0,0.08)';
                                }}
                                onBlur={(e) => {
                                    if (!errors.password) {
                                        e.target.style.borderColor = colors.border;
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: colors.textSecondary,
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p style={{ 
                                color: '#ef4444', 
                                fontSize: '13px', 
                                margin: '6px 0 0 0',
                            }}>
                                {errors.password}
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
                                e.currentTarget.style.opacity = '0.92';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.opacity = '1';
                            }
                        }}
                    >
                        {loading ? 'Signing in...' : (
                            <>
                                Sign in
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '32px 0',
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
                    <span style={{ 
                        padding: '0 16px', 
                        fontSize: '14px', 
                        color: colors.textTertiary,
                    }}>
                        Or continue with
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
                </div>

                    <div style={{ marginBottom: '32px' }}>
                    <button
                                onClick={async () => {
                                    setSocialLoading('google');
                                    try {
                                        const session = await loginWithGoogle({ returnTo });
                                        if (session) {
                                            navigate(getLoginRedirectPath(session, returnTo), { replace: true });
                                        }
                                    } catch (error) {
                                        showError(error.message || 'Social login failed');
                                    } finally {
                                        setSocialLoading(null);
                                    }
                                }}
                                disabled={socialLoading !== null}
                                style={{
                                    width: '100%',
                                    padding: '11px 16px',
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: '6px',
                                    backgroundColor: colors.backgroundSecondary,
                                    cursor: socialLoading !== null ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: '500',
                                    color: colors.textPrimary,
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: socialLoading !== null && socialLoading !== 'google' ? 0.6 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (socialLoading === null) {
                                        e.currentTarget.style.borderColor = colors.textTertiary;
                                        e.currentTarget.style.backgroundColor = colors.surface;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (socialLoading === null) {
                                        e.currentTarget.style.borderColor = colors.border;
                                        e.currentTarget.style.backgroundColor = colors.backgroundSecondary;
                                    }
                                }}
                            >
                                {socialLoading === 'google' ? (
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #e2e8f0',
                                        borderTop: `2px solid ${colors.textPrimary}`,
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                )}
                                {socialLoading === 'google' ? 'Signing in...' : 'Google'}
                            </button>
                    </div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: '15px', 
                        color: colors.textSecondary,
                        margin: '0',
                    }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{
                            color: colors.textPrimary,
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}>
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
};

export default LoginScreen;

import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { startSocialOAuth } from '../../utils/Service/api';
import { useUIFeedback } from '../../components/ui/UIFeedback';

const LoginScreen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login, sendOtp, verifyOtp, socialLogin, completeSocialLogin } = useAuth();
    const { error: showError } = useUIFeedback();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);
    const [authMode, setAuthMode] = useState('email');
    const [otpMeta, setOtpMeta] = useState({ message: '', devCode: '' });

    useEffect(() => {
        const ticket = searchParams.get('social_ticket');
        if (!ticket) return;
        const consume = async () => {
            setLoading(true);
            try {
                const userData = await completeSocialLogin(ticket);
                navigate(userData.role === 'admin' ? '/admin/dashboard' : '/newsfeed', { replace: true });
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
        if (authMode === 'email') {
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
                navigate(userData.role === 'admin' ? '/admin/dashboard' : '/newsfeed');
            } catch (error) {
                setErrors(prev => ({ ...prev, password: error.message || 'Invalid email or password' }));
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: 'Phone is required' }));
            setLoading(false);
            return;
        }
        if (!password.trim()) {
            setErrors(prev => ({ ...prev, password: 'Verification code is required' }));
            setLoading(false);
            return;
        }
        try {
            const userData = await verifyOtp(email.trim(), password.trim());
            navigate(userData.role === 'admin' ? '/admin/dashboard' : '/newsfeed');
        } catch (error) {
            setErrors(prev => ({ ...prev, password: error.message || 'Invalid code' }));
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async () => {
        if (!email.trim()) {
            setErrors(prev => ({ ...prev, email: 'Phone is required' }));
            return;
        }
        if (!/^\+?[\d\s\-()]{7,20}$/.test(email.trim())) {
            setErrors(prev => ({ ...prev, email: 'Enter a valid phone number' }));
            return;
        }
        setErrors({});
        setOtpMeta({ message: '', devCode: '' });
        setLoading(true);
        try {
            const payload = await sendOtp(email.trim());
            setOtpMeta({
                message: payload?.detail || 'Verification code sent.',
                devCode: payload?.dev_code ? String(payload.dev_code) : '',
            });
            setErrors(prev => ({ ...prev, password: '' }));
        } catch (error) {
            setErrors(prev => ({ ...prev, password: error.message }));
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
            `}</style>
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
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
                        color: '#0f172a',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2',
                    }}>
                        Sign in to your account
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: '#64748b',
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        {authMode === 'email'
                            ? 'Enter your email and password to continue'
                            : 'Enter phone and verification code to continue'}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                    <button
                        type="button"
                        onClick={() => { setAuthMode('email'); setErrors({}); }}
                        style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: authMode === 'email' ? '1px solid #0f172a' : '1px solid #cbd5e1',
                            backgroundColor: authMode === 'email' ? '#0f172a' : '#ffffff',
                            color: authMode === 'email' ? '#ffffff' : '#0f172a',
                            fontWeight: '500',
                            cursor: 'pointer',
                        }}
                    >
                        Login with Email
                    </button>
                    <button
                        type="button"
                        onClick={() => { setAuthMode('phone'); setErrors({}); setOtpMeta({ message: '', devCode: '' }); }}
                        style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: authMode === 'phone' ? '1px solid #0f172a' : '1px solid #cbd5e1',
                            backgroundColor: authMode === 'phone' ? '#0f172a' : '#ffffff',
                            color: authMode === 'phone' ? '#ffffff' : '#0f172a',
                            fontWeight: '500',
                            cursor: 'pointer',
                        }}
                    >
                        Login with Phone
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#0f172a',
                            marginBottom: '8px',
                        }}>
                            {authMode === 'email' ? 'Email address' : 'Phone number'}
                        </label>
                        <input
                            type={authMode === 'email' ? 'email' : 'text'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={authMode === 'email' ? 'you@example.com' : '+923001234567'}
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '15px',
                                border: errors.email ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                borderRadius: '6px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                color: '#0f172a',
                                backgroundColor: '#ffffff',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#0f172a';
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
                        {authMode === 'phone' && otpMeta.message ? (
                            <p style={{ color: '#166534', fontSize: '13px', margin: '6px 0 0 0' }}>
                                {otpMeta.message}
                                {otpMeta.devCode ? ` Test code: ${otpMeta.devCode}` : ''}
                            </p>
                        ) : null}
                    </div>

                    {/* Password/Code Field */}
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
                                color: '#0f172a',
                            }}>
                                {authMode === 'email' ? 'Password' : 'Verification Code'}
                            </label>
                            {authMode === 'email' ? (
                                <Link to="/forgot-password" style={{
                                    fontSize: '14px',
                                    color: '#0f172a',
                                    textDecoration: 'none',
                                    fontWeight: '500',
                                }}>
                                    Forgot password?
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleRequestOtp}
                                    style={{ fontSize: '14px', color: '#0f172a', background: 'transparent', border: 'none', fontWeight: '500', cursor: 'pointer' }}
                                >
                                    Send code
                                </button>
                            )}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={authMode === 'email' ? (showPassword ? 'text' : 'password') : 'text'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={authMode === 'email' ? 'Enter your password' : 'Enter 6-digit code'}
                                autoComplete={authMode === 'email' ? 'current-password' : 'one-time-code'}
                                style={{
                                    width: '100%',
                                    padding: '11px 45px 11px 14px',
                                    fontSize: '15px',
                                    border: errors.password ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    color: '#0f172a',
                                    backgroundColor: '#ffffff',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#0f172a';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
                                }}
                                onBlur={(e) => {
                                    if (!errors.password) {
                                        e.target.style.borderColor = '#cbd5e1';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            {authMode === 'email' ? (
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
                                        color: '#64748b',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            ) : null}
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

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 20px',
                            backgroundColor: '#0f172a',
                            color: '#ffffff',
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
                                e.currentTarget.style.backgroundColor = '#1e293b';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.currentTarget.style.backgroundColor = '#0f172a';
                            }
                        }}
                    >
                        {loading ? 'Signing in...' : (
                            <>
                                {authMode === 'email' ? 'Sign in' : 'Verify & Sign in'}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '32px 0',
                }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                    <span style={{ 
                        padding: '0 16px', 
                        fontSize: '14px', 
                        color: '#94a3b8',
                    }}>
                        Or continue with
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                </div>

                    {/* Social Buttons */}
                    <div style={{ 
                        display: 'flex',
                        gap: '12px', 
                        marginBottom: '32px' 
                    }}>
                    {[
                        { 
                            name: 'Google', 
                            key: 'google',
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                            )
                        },
                        { 
                            name: 'GitHub', 
                            key: 'github',
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#000000">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                                </svg>
                            )
                        },
                        { 
                            name: 'Twitter', 
                            key: 'twitter',
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1DA1F2">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                            )
                        },
                    ].map((provider) => {
                        const isLoading = socialLoading === provider.key;
                        return (
                            <button 
                                key={provider.key}
                                onClick={async () => {
                                    setSocialLoading(provider.key);
                                    try {
                                        if (provider.key === 'google' || provider.key === 'github') {
                                            startSocialOAuth(provider.key);
                                            return;
                                        }
                                        throw new Error('This social provider is not available yet.');
                                    } catch (error) {
                                        showError(error.message || 'Social login failed');
                                    } finally {
                                        setSocialLoading(null);
                                    }
                                }}
                                disabled={socialLoading !== null || provider.key === 'twitter'}
                                style={{
                                    flex: 1,
                                    padding: '11px 16px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    backgroundColor: '#ffffff',
                                    cursor: socialLoading !== null ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: '500',
                                    color: '#0f172a',
                                    fontSize: '14px',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    opacity: socialLoading !== null && !isLoading ? 0.6 : (provider.key === 'twitter' ? 0.5 : 1),
                                }}
                                onMouseEnter={(e) => {
                                    if (socialLoading === null) {
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (socialLoading === null) {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                    }
                                }}
                            >
                                {isLoading ? (
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #e2e8f0',
                                        borderTop: '2px solid #0f172a',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                ) : (
                                    provider.icon
                                )}
                                {isLoading ? 'Signing in...' : provider.name}
                            </button>
                        );
                    })}
                    </div>

                {/* Sign Up Link */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: '15px', 
                        color: '#64748b',
                        margin: '0',
                    }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{
                            color: '#0f172a',
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

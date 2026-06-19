import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { getPostAuthPath, getPostAuthState } from '../../utils/authNavigation';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import TrakLogo from '../../components/TrakLogo';

const SignUpScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const action = filledActionColors(colors, isDark);
    const { register, loginWithGoogle } = useAuth();
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [agreed, setAgreed] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [socialLoading, setSocialLoading] = useState(null);

    const validateForm = () => {
        const newErrors = {};
        
        if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }
        
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Invalid email address';
        }
        const phoneDigits = phone.trim().replace(/\D/g, '');
        if (phone.trim() && (phoneDigits.length < 8 || phoneDigits.length > 15)) {
            newErrors.phone = 'Invalid phone number';
        }
        
        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!agreed) {
            newErrors.agreed = 'You must agree to the terms';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setErrors({});
        try {
            const normalizedPhone = phone.trim().replace(/\D/g, '');
            const sessionUser = await register(email, password, confirmPassword, fullName, normalizedPhone);
            if (sessionUser?.verification_required && sessionUser?.email_sent === false) {
                setErrors((prev) => ({
                    ...prev,
                    email:
                        sessionUser?.email_error === 'resend_domain_not_verified'
                            ? 'We could not send the verification email. Email service is not fully configured yet.'
                            : 'We could not send the verification email. Check your address and try again, or use Resend code.',
                }));
                return;
            }
            if (sessionUser?.email_verified) {
                navigate('/tag-selection', { state: { fromSignup: true } });
            } else {
                navigate('/verify-email', { state: { email, fromSignup: true } });
            }
        } catch (error) {
            const fieldErrors = error.fields || {};
            if (Object.keys(fieldErrors).length > 0) {
                const mapped = {};
                for (const [key, val] of Object.entries(fieldErrors)) {
                    if (key === 'email') mapped.email = val;
                    else if (key === 'password') mapped.password = val;
                    else if (key === 'password_confirm') mapped.confirmPassword = val;
                    else if (key === 'full_name') mapped.fullName = val;
                    else if (key === 'phone') mapped.phone = val;
                    else mapped.email = val;
                }
                setErrors((prev) => ({ ...prev, ...mapped }));
            } else {
                setErrors((prev) => ({ ...prev, email: error.message || 'Sign up failed. Please try again.' }));
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
                {/* Logo */}
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
                        Create your account
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: '#64748b',
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Sign up to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Full Name Field */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '8px',
                        }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '15px',
                                border: errors.fullName ? '1px solid #ef4444' : `1px solid ${colors.border}`,
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
                                if (!errors.fullName) {
                                    e.target.style.borderColor = colors.border;
                                    e.target.style.boxShadow = 'none';
                                }
                            }}
                        />
                        {errors.fullName && (
                            <p style={{ 
                                color: '#ef4444', 
                                fontSize: '13px', 
                                margin: '6px 0 0 0',
                            }}>
                                {errors.fullName}
                            </p>
                        )}
                    </div>

                    {/* Email Field */}
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
                            placeholder="name@company.com"
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '15px',
                                border: errors.email ? '1px solid #ef4444' : `1px solid ${colors.border}`,
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

                    {/* Password Fields */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '8px',
                        }}>
                            Phone number (optional)
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+923001234567"
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '15px',
                                border: errors.phone ? '1px solid #ef4444' : `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                color: colors.textPrimary,
                                backgroundColor: colors.background,
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                            }}
                        />
                        {errors.phone && (
                            <p style={{ color: '#ef4444', fontSize: '13px', margin: '6px 0 0 0' }}>
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Password Fields */}
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '20px',
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: colors.textPrimary,
                                marginBottom: '8px',
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        autoComplete="new-password"
                                        style={{
                                            width: '100%',
                                            padding: '11px 45px 11px 14px',
                                            fontSize: '15px',
                                            border: errors.password ? '1px solid #ef4444' : `1px solid ${colors.border}`,
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
                                        color: '#64748b',
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
                                    fontSize: '12px', 
                                    margin: '6px 0 0 0',
                                }}>
                                    {errors.password}
                                </p>
                            )}
                        </div>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: colors.textPrimary,
                                marginBottom: '8px',
                            }}>
                                Confirm
                            </label>
                            <div style={{ position: 'relative' }}>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm"
                                        autoComplete="new-password"
                                        style={{
                                            width: '100%',
                                            padding: '11px 45px 11px 14px',
                                            fontSize: '15px',
                                            border: errors.confirmPassword ? '1px solid #ef4444' : `1px solid ${colors.border}`,
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
                                        if (!errors.confirmPassword) {
                                            e.target.style.borderColor = colors.border;
                                            e.target.style.boxShadow = 'none';
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p style={{ 
                                    color: '#ef4444', 
                                    fontSize: '12px', 
                                    margin: '6px 0 0 0',
                                }}>
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Terms Agreement */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            cursor: 'pointer',
                        }}>
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    marginTop: '2px',
                                    cursor: 'pointer',
                                    accentColor: colors.primary,
                                    flexShrink: 0,
                                }}
                            />
                            <span style={{
                                fontSize: '14px',
                                color: '#64748b',
                                lineHeight: '1.5',
                            }}>
                                I agree to the{' '}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowTermsModal(true);
                                    }}
                                    style={{
                                        color: colors.textPrimary,
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        fontSize: '14px',
                                    }}
                                >
                                    Terms
                                </button>
                                {' '}and{' '}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowPrivacyModal(true);
                                    }}
                                    style={{
                                        color: colors.textPrimary,
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        fontSize: '14px',
                                    }}
                                >
                                    Privacy Policy
                                </button>
                            </span>
                        </label>
                        {errors.agreed && (
                            <p style={{ 
                                color: '#ef4444', 
                                fontSize: '13px', 
                                margin: '6px 0 0 26px',
                            }}>
                                {errors.agreed}
                            </p>
                        )}
                    </div>

                    {errors.form && (
                        <p style={{
                            color: '#ef4444',
                            fontSize: '14px',
                            margin: '0 0 12px 0',
                        }}>
                            {errors.form}
                        </p>
                    )}

                    {/* Submit Button */}
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
                            if (!loading) e.currentTarget.style.opacity = '0.92';
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.currentTarget.style.opacity = '1';
                        }}
                    >
                        {loading ? 'Creating account...' : (
                            <>
                                Create account
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
                    <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
                    <span style={{ 
                        padding: '0 16px', 
                        fontSize: '14px', 
                        color: '#94a3b8',
                    }}>
                        Or continue with
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: colors.border }} />
                </div>

                {/* Social Buttons */}
                <div style={{ marginBottom: '32px' }}>
                    <button
                        onClick={async () => {
                            setSocialLoading('google');
                            try {
                                const session = await loginWithGoogle();
                                if (!session) return;
                                const path = getPostAuthPath(session, { fromSignup: true });
                                navigate(path, {
                                    replace: true,
                                    state: getPostAuthState(path, {
                                        fromSignup: true,
                                        email: session?.user?.email || '',
                                    }),
                                });
                            } catch (error) {
                                setErrors((prev) => ({ ...prev, email: error.message || 'Social signup failed' }));
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
                            backgroundColor: colors.background,
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
                                e.currentTarget.style.backgroundColor = '#f8fafc';
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
                                border: `2px solid ${colors.border}`,
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

                {/* Sign In Link */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: '15px', 
                        color: '#64748b',
                        margin: '0',
                    }}>
                        Already have an account?{' '}
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

            {/* Terms Modal */}
            {showTermsModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                }}
                onClick={() => setShowTermsModal(false)}
                >
                    <div style={{
                        backgroundColor: colors.background,
                        borderRadius: '8px',
                        maxWidth: '700px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            backgroundColor: colors.background,
                            zIndex: 10,
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: colors.textPrimary,
                                margin: 0,
                            }}>
                                Terms of Service
                            </h2>
                            <button
                                onClick={() => setShowTermsModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <X size={24} color="#64748b" />
                            </button>
                        </div>
                        <div style={{
                            padding: '24px',
                            fontSize: '14px',
                            color: '#334155',
                            lineHeight: '1.6',
                        }}>
                            <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>
                                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>1. Acceptance of Terms</h3>
                                <p style={{ margin: '0 0 12px 0' }}>By accessing and using TRAK, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>2. Use License</h3>
                                <p style={{ margin: '0 0 12px 0' }}>Permission is granted to temporarily access the materials on TRAK's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                                <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '6px' }}>Modify or copy the materials</li>
                                    <li style={{ marginBottom: '6px' }}>Use the materials for any commercial purpose or for any public display</li>
                                    <li style={{ marginBottom: '6px' }}>Attempt to reverse engineer any software contained on TRAK's website</li>
                                    <li style={{ marginBottom: '6px' }}>Remove any copyright or other proprietary notations from the materials</li>
                                </ul>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>3. User Accounts</h3>
                                <p style={{ margin: '0 0 12px 0' }}>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>4. Contact Information</h3>
                                <p style={{ margin: '0' }}>If you have any questions about these Terms of Service, please contact us at support@trak.com</p>
                            </section>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Modal */}
            {showPrivacyModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px',
                }}
                onClick={() => setShowPrivacyModal(false)}
                >
                    <div style={{
                        backgroundColor: colors.background,
                        borderRadius: '8px',
                        maxWidth: '700px',
                        width: '100%',
                        maxHeight: '90vh',
                        overflow: 'auto',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{
                            padding: '24px',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'sticky',
                            top: 0,
                            backgroundColor: colors.background,
                            zIndex: 10,
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: colors.textPrimary,
                                margin: 0,
                            }}>
                                Privacy Policy
                            </h2>
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <X size={24} color="#64748b" />
                            </button>
                        </div>
                        <div style={{
                            padding: '24px',
                            fontSize: '14px',
                            color: '#334155',
                            lineHeight: '1.6',
                        }}>
                            <p style={{ margin: '0 0 16px 0', color: '#64748b' }}>
                                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>1. Information We Collect</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We collect information that you provide directly to us, including account information (name, email address, password), profile information and preferences, content you save, share, or interact with, and search queries and browsing history.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>2. How We Use Your Information</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We use the information we collect to provide, maintain, and improve our services, personalize your experience, send you technical notices and updates, and respond to your comments and questions.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>3. Information Sharing</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We do not sell, trade, or rent your personal information to third parties. We may share your information only with your consent, with service providers who perform services on our behalf, or to comply with legal obligations.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>4. Data Security</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.textPrimary, margin: '0 0 12px 0' }}>5. Contact Us</h3>
                                <p style={{ margin: '0' }}>If you have any questions about this Privacy Policy, please contact us at privacy@trak.com</p>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default SignUpScreen;

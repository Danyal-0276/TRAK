import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Text from '../../components/ui/Text';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { confirmPasswordReset, confirmPasswordResetWithOtp } from '../../api/authPasswordApi';

const ResetPasswordScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';
    const action = filledActionColors(colors, isDark);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const otpEmail = (location.state?.email || '').trim().toLowerCase();
    const resetToken = location.state?.resetToken || '';
    const fromOtp = Boolean(location.state?.fromOtp && otpEmail && resetToken);
    const [uid, setUid] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const hasTokenParams = Boolean(uid.trim() && token.trim());

    useEffect(() => {
        if (fromOtp) return;
        const u = searchParams.get('uid') || '';
        const t = searchParams.get('token') || '';
        setUid(u);
        setToken(t);
    }, [searchParams, fromOtp]);

    useEffect(() => {
        if (location.state?.fromOtp && (!otpEmail || !resetToken)) {
            navigate('/forgot-password-code', {
                replace: true,
                state: otpEmail ? { email: otpEmail } : undefined,
            });
        }
    }, [fromOtp, otpEmail, resetToken, navigate, location.state?.fromOtp]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!fromOtp) {
            if (!uid.trim()) {
                setErrors((prev) => ({ ...prev, uid: 'Paste the code from your reset email (uid)' }));
                return;
            }
            if (!token.trim()) {
                setErrors((prev) => ({ ...prev, token: 'Paste the token from your reset link' }));
                return;
            }
        }
        if (!newPassword) {
            setErrors(prev => ({ ...prev, newPassword: 'Password is required' }));
            return;
        }
        if (newPassword.length < 8) {
            setErrors(prev => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
            return;
        }
        if (!confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
            return;
        }

        setLoading(true);
        try {
            if (fromOtp) {
                await confirmPasswordResetWithOtp({
                    email: otpEmail,
                    reset_token: resetToken,
                    password: newPassword,
                    password_confirm: confirmPassword,
                });
            } else {
                await confirmPasswordReset({
                    uid: uid.trim(),
                    token: token.trim(),
                    password: newPassword,
                    password_confirm: confirmPassword,
                });
            }
            navigate('/password-changed');
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                form: err?.message || 'Could not reset password. The link may have expired.',
            }));
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
                        Create new password
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: colors.textSecondary,
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        Please type something you'll remember
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        {fromOtp ? (
                            <p style={{
                                fontSize: '13px',
                                color: '#166534',
                                margin: '0 0 12px 0',
                                lineHeight: '1.5',
                            }}>
                                Code verified for {otpEmail}. Choose your new password below.
                            </p>
                        ) : !hasTokenParams ? (
                            <p style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                margin: '0 0 12px 0',
                                lineHeight: '1.5',
                            }}>
                                Open this page directly from the reset link sent to your email. You can also paste uid/token manually.
                            </p>
                        ) : (
                            <p style={{
                                fontSize: '13px',
                                color: '#166534',
                                margin: '0 0 12px 0',
                                lineHeight: '1.5',
                            }}>
                                Reset link verified. Create your new password below.
                            </p>
                        )}
                        {!fromOtp ? (
                        <details style={{ marginBottom: '16px' }}>
                            <summary style={{ cursor: 'pointer', color: colors.textSecondary, fontSize: '13px' }}>Show manual uid/token fields</summary>
                            <div style={{ marginTop: '10px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '8px',
                        }}>
                            Reset code (uid)
                        </label>
                        <input
                            type="text"
                            value={uid}
                            onChange={(e) => setUid(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="From email link"
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '15px',
                                border: errors.uid ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                borderRadius: '6px',
                                outline: 'none',
                                color: colors.textPrimary,
                                backgroundColor: colors.background,
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                marginBottom: errors.uid ? '6px' : '16px',
                            }}
                        />
                        {errors.uid && (
                            <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 12px 0' }}>{errors.uid}</p>
                        )}
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '8px',
                        }}>
                            Token
                        </label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            autoComplete="off"
                            spellCheck={false}
                            placeholder="From email link"
                            style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '15px',
                                border: errors.token ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                borderRadius: '6px',
                                outline: 'none',
                                color: colors.textPrimary,
                                backgroundColor: colors.background,
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                marginBottom: errors.token ? '6px' : '20px',
                            }}
                        />
                        {errors.token && (
                            <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 20px 0' }}>{errors.token}</p>
                        )}
                            </div>
                        </details>
                        ) : null}
                    </div>

                    {/* New Password */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '8px',
                        }}>
                            New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Must be at least 8 characters"
                                autoComplete="new-password"
                                style={{
                                    width: '100%',
                                    padding: '11px 45px 11px 14px',
                                    fontSize: '15px',
                                    border: errors.newPassword ? '1px solid #ef4444' : '1px solid #cbd5e1',
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
                                    if (!errors.newPassword) {
                                        e.target.style.borderColor = '#cbd5e1';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
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
                                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.newPassword && (
                            <p style={{ 
                                color: '#ef4444', 
                                fontSize: '13px', 
                                margin: '6px 0 0 0',
                            }}>
                                {errors.newPassword}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: colors.textPrimary,
                            marginBottom: '8px',
                        }}>
                            Confirm New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                autoComplete="new-password"
                                style={{
                                    width: '100%',
                                    padding: '11px 45px 11px 14px',
                                    fontSize: '15px',
                                    border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #cbd5e1',
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
                                        e.target.style.borderColor = '#cbd5e1';
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
                                    color: colors.textSecondary,
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
                                fontSize: '13px', 
                                margin: '6px 0 0 0',
                            }}>
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {errors.form && (
                        <p style={{
                            color: '#ef4444',
                            fontSize: '14px',
                            margin: '0 0 16px 0',
                            lineHeight: '1.4',
                        }}>
                            {errors.form}
                        </p>
                    )}

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
                        {loading ? 'Resetting...' : (
                            <>
                                Reset password
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
        </>
    );
};

export default ResetPasswordScreen;

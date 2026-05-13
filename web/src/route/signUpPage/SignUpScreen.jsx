import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { startSocialOAuth } from '../../utils/Service/api';

const SignUpScreen = () => {
    const navigate = useNavigate();
    const { register, socialLogin } = useAuth();
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
        if (phone.trim() && !/^\+?[0-9]{8,15}$/.test(phone.trim())) {
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
            await register(email, password, confirmPassword, fullName, phone);
            navigate('/tag-selection', { state: { fromSignup: true } });
        } catch (error) {
            const msg = error.message || 'Signup failed';
            const isPasswordError = msg.toLowerCase().includes('password');
            setErrors((prev) => ({ ...prev, [isPasswordError ? 'password' : 'email']: msg }));
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
                            color: '#0f172a',
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
                                border: errors.fullName ? '1px solid #ef4444' : '1px solid #cbd5e1',
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
                                if (!errors.fullName) {
                                    e.target.style.borderColor = '#cbd5e1';
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
                            color: '#0f172a',
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
                    </div>

                    {/* Password Fields */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#0f172a',
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
                                border: errors.phone ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                borderRadius: '6px',
                                outline: 'none',
                                transition: 'all 0.2s',
                                color: '#0f172a',
                                backgroundColor: '#ffffff',
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
                                color: '#0f172a',
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
                                color: '#0f172a',
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
                                            border: errors.confirmPassword ? '1px solid #ef4444' : '1px solid #cbd5e1',
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
                                    accentColor: '#0f172a',
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
                                        color: '#0f172a',
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
                                        color: '#0f172a',
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
                            name: 'Apple', 
                            key: 'apple',
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                </svg>
                            )
                        },
                        { 
                            name: 'Facebook', 
                            key: 'facebook',
                            icon: (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
                                        if (['google', 'apple', 'facebook'].includes(provider.key)) {
                                            startSocialOAuth(provider.key);
                                            return;
                                        }
                                        throw new Error('This social provider is not available yet.');
                                    } catch (error) {
                                        setErrors((prev) => ({ ...prev, email: error.message || 'Social signup failed' }));
                                    } finally {
                                        setSocialLoading(null);
                                    }
                                }}
                                disabled={socialLoading !== null}
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
                                    opacity: socialLoading !== null && !isLoading ? 0.6 : 1,
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

                {/* Sign In Link */}
                <div style={{ textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: '15px', 
                        color: '#64748b',
                        margin: '0',
                    }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{
                            color: '#0f172a',
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
                        backgroundColor: '#ffffff',
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
                            backgroundColor: '#ffffff',
                            zIndex: 10,
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#0f172a',
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
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>1. Acceptance of Terms</h3>
                                <p style={{ margin: '0 0 12px 0' }}>By accessing and using TRAK, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>2. Use License</h3>
                                <p style={{ margin: '0 0 12px 0' }}>Permission is granted to temporarily access the materials on TRAK's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
                                <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px' }}>
                                    <li style={{ marginBottom: '6px' }}>Modify or copy the materials</li>
                                    <li style={{ marginBottom: '6px' }}>Use the materials for any commercial purpose or for any public display</li>
                                    <li style={{ marginBottom: '6px' }}>Attempt to reverse engineer any software contained on TRAK's website</li>
                                    <li style={{ marginBottom: '6px' }}>Remove any copyright or other proprietary notations from the materials</li>
                                </ul>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>3. User Accounts</h3>
                                <p style={{ margin: '0 0 12px 0' }}>When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>4. Contact Information</h3>
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
                        backgroundColor: '#ffffff',
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
                            backgroundColor: '#ffffff',
                            zIndex: 10,
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#0f172a',
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
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>1. Information We Collect</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We collect information that you provide directly to us, including account information (name, email address, password), profile information and preferences, content you save, share, or interact with, and search queries and browsing history.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>2. How We Use Your Information</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We use the information we collect to provide, maintain, and improve our services, personalize your experience, send you technical notices and updates, and respond to your comments and questions.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>3. Information Sharing</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We do not sell, trade, or rent your personal information to third parties. We may share your information only with your consent, with service providers who perform services on our behalf, or to comply with legal obligations.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>4. Data Security</h3>
                                <p style={{ margin: '0 0 12px 0' }}>We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                            </section>
                            <section style={{ marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: '0 0 12px 0' }}>5. Contact Us</h3>
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

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail } from 'lucide-react';
import Text from '../../components/ui/Text';

const ForgotPasswordCodeScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'hello@trak.com';
    const [code, setCode] = useState(['', '', '', '']);
    const [timer, setTimer] = useState(60);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCodeChange = (text, index) => {
        const newCode = [...code];
        newCode[index] = text.replace(/[^0-9]/g, '');
        setCode(newCode);

        if (newCode[index] && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto submit when all digits filled
        if (newCode.every(digit => digit !== '') && index === 3) {
            handleVerify();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        if (code.some(digit => !digit)) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate('/reset-password');
        }, 1000);
    };

    const handleResend = () => {
        if (timer === 0) {
            setTimer(60);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            padding: '24px',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
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
                        color: '#64748b',
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
                        color: '#0f172a',
                        margin: '0 0 8px 0',
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2',
                    }}>
                        Enter verification code
                    </h1>
                    <p style={{
                        fontSize: '15px',
                        color: '#64748b',
                        margin: '0',
                        lineHeight: '1.5',
                    }}>
                        We've sent a 4-digit code to{' '}
                        <span style={{ fontWeight: '500', color: '#0f172a' }}>{email}</span>
                    </p>
                </div>

                {/* Code Inputs */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    marginBottom: '32px',
                }}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            style={{
                                width: '64px',
                                height: '64px',
                                border: digit ? '2px solid #0f172a' : '1px solid #cbd5e1',
                                borderRadius: '8px',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#0f172a',
                                backgroundColor: '#ffffff',
                                textAlign: 'center',
                                outline: 'none',
                                transition: 'all 0.2s',
                                fontFamily: 'inherit',
                                padding: '0',
                                boxSizing: 'border-box',
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#0f172a';
                                e.target.style.borderWidth = '2px';
                                e.target.style.boxShadow = '0 0 0 3px rgba(15, 23, 42, 0.1)';
                            }}
                            onBlur={(e) => {
                                if (!digit) {
                                    e.target.style.borderColor = '#cbd5e1';
                                    e.target.style.borderWidth = '1px';
                                    e.target.style.boxShadow = 'none';
                                } else {
                                    e.target.style.borderWidth = '2px';
                                }
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={loading || code.some(digit => !digit)}
                    style={{
                        width: '100%',
                        padding: '12px 20px',
                        backgroundColor: code.every(digit => digit) ? '#0f172a' : '#e2e8f0',
                        color: code.every(digit => digit) ? '#ffffff' : '#94a3b8',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: (loading || code.some(digit => !digit)) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        marginBottom: '24px',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                        if (!loading && code.every(digit => digit)) {
                            e.currentTarget.style.backgroundColor = '#1e293b';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!loading && code.every(digit => digit)) {
                            e.currentTarget.style.backgroundColor = '#0f172a';
                        }
                    }}
                >
                    {loading ? 'Verifying...' : (
                        <>
                            Verify code
                            <ArrowRight size={18} />
                        </>
                    )}
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <button
                        onClick={handleResend}
                        disabled={timer > 0}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: timer > 0 ? 'not-allowed' : 'pointer',
                            padding: 0,
                        }}
                    >
                        <span style={{
                            fontSize: '15px',
                            color: timer > 0 ? '#94a3b8' : '#0f172a',
                            fontWeight: '500',
                        }}>
                            {timer > 0 
                                ? `Resend code in 00:${timer.toString().padStart(2, '0')}`
                                : 'Resend code'
                            }
                        </span>
                    </button>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <p style={{ 
                        fontSize: '15px', 
                        color: '#64748b',
                        margin: '0',
                    }}>
                        Remember your password?{' '}
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
        </div>
    );
};

export default ForgotPasswordCodeScreen;

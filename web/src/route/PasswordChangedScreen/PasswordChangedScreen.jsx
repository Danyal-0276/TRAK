import React from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Text from '../../components/ui/Text';

const PasswordChangedScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
            padding: '24px',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
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
                </div>

                {/* Success Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    border: '2px solid #bbf7d0',
                }}>
                    <CheckCircle size={48} color="#10b981" fill="#10b981" />
                </div>

                <h1 style={{
                    fontSize: '30px',
                    fontWeight: '600',
                    color: colors.textPrimary,
                    margin: '0 0 12px 0',
                    letterSpacing: '-0.5px',
                    lineHeight: '1.2',
                }}>
                    Password changed
                </h1>
                <p style={{
                    fontSize: '15px',
                    color: colors.textSecondary,
                    margin: '0 0 40px 0',
                    lineHeight: '1.5',
                }}>
                    Your password has been changed successfully. You can now sign in with your new password.
                </p>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        width: '100%',
                        padding: '12px 20px',
                        backgroundColor: colors.primary,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primaryDark;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = colors.primary;
                    }}
                >
                    Back to login
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default PasswordChangedScreen;

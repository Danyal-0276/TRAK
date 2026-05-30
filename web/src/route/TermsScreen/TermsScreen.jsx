import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { themedPageRoot } from '../../theme/themePageStyles';

const TermsScreen = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { colors } = theme;
    const isDark = theme.mode === 'dark';

    return (
        <div style={{
            ...themedPageRoot(colors),
            padding: '24px',
        }}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
            }}>
                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 0',
                        border: 'none',
                        background: 'transparent',
                        color: colors.textSecondary,
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        marginBottom: '32px',
                    }}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>

                <img 
                    src="/images/whiteLogo.svg" 
                    alt="TRAK" 
                    style={{ 
                        width: '32px', 
                        height: '32px',
                        filter: isDark ? 'none' : 'invert(1)',
                        marginBottom: '40px',
                    }} 
                />

                <h1 style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: colors.textPrimary,
                    margin: '0 0 16px 0',
                    letterSpacing: '-0.5px',
                }}>
                    Terms of Service
                </h1>
                <p style={{
                    fontSize: '15px',
                    color: colors.textSecondary,
                    margin: '0 0 48px 0',
                }}>
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {/* Content */}
                <div style={{
                    lineHeight: '1.8',
                    color: colors.textSecondary,
                }}>
                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            1. Acceptance of Terms
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            By accessing and using TRAK, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            2. Use License
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            Permission is granted to temporarily access the materials on TRAK's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                            paddingLeft: '24px',
                        }}>
                            <li style={{ marginBottom: '8px' }}>Modify or copy the materials</li>
                            <li style={{ marginBottom: '8px' }}>Use the materials for any commercial purpose or for any public display</li>
                            <li style={{ marginBottom: '8px' }}>Attempt to reverse engineer any software contained on TRAK's website</li>
                            <li style={{ marginBottom: '8px' }}>Remove any copyright or other proprietary notations from the materials</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            3. User Accounts
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                        </p>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            4. Content
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            Our service allows you to access and view content, including news articles, information, and other materials. The content is provided for your personal, non-commercial use only.
                        </p>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            You may not copy, reproduce, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content for any other purposes without the prior written consent of TRAK or the respective licensors of the content.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            5. Prohibited Uses
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            You may not use our service:
                        </p>
                        <ul style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                            paddingLeft: '24px',
                        }}>
                            <li style={{ marginBottom: '8px' }}>In any way that violates any applicable national or international law or regulation</li>
                            <li style={{ marginBottom: '8px' }}>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                            <li style={{ marginBottom: '8px' }}>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
                            <li style={{ marginBottom: '8px' }}>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            6. Termination
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            7. Disclaimer
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, TRAK excludes all representations, warranties, and conditions relating to our website and the use of this website.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            8. Contact Information
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            If you have any questions about these Terms of Service, please contact us at support@trak.com
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsScreen;


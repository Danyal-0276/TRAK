import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';
import { themedPageRoot } from '../../theme/themePageStyles';

const PrivacyScreen = () => {
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
                    Privacy Policy
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
                            1. Information We Collect
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We collect information that you provide directly to us, including:
                        </p>
                        <ul style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                            paddingLeft: '24px',
                        }}>
                            <li style={{ marginBottom: '8px' }}>Account information (name, email address, password)</li>
                            <li style={{ marginBottom: '8px' }}>Profile information and preferences</li>
                            <li style={{ marginBottom: '8px' }}>Content you save, share, or interact with</li>
                            <li style={{ marginBottom: '8px' }}>Search queries and browsing history</li>
                        </ul>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We also automatically collect certain information about your device and how you interact with our service, including IP address, browser type, and usage data.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            2. How We Use Your Information
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We use the information we collect to:
                        </p>
                        <ul style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                            paddingLeft: '24px',
                        }}>
                            <li style={{ marginBottom: '8px' }}>Provide, maintain, and improve our services</li>
                            <li style={{ marginBottom: '8px' }}>Personalize your experience and deliver content relevant to your interests</li>
                            <li style={{ marginBottom: '8px' }}>Send you technical notices, updates, and support messages</li>
                            <li style={{ marginBottom: '8px' }}>Respond to your comments, questions, and requests</li>
                            <li style={{ marginBottom: '8px' }}>Monitor and analyze trends, usage, and activities</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            3. Information Sharing and Disclosure
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                        </p>
                        <ul style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                            paddingLeft: '24px',
                        }}>
                            <li style={{ marginBottom: '8px' }}>With your consent or at your direction</li>
                            <li style={{ marginBottom: '8px' }}>With service providers who perform services on our behalf</li>
                            <li style={{ marginBottom: '8px' }}>To comply with legal obligations or respond to legal requests</li>
                            <li style={{ marginBottom: '8px' }}>To protect the rights, property, or safety of TRAK, our users, or others</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            4. Data Security
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
                        </p>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            Your account information is protected by a password. It is important that you protect against unauthorized access to your account and password by selecting a strong password and limiting access to your computer and browser.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            5. Your Rights and Choices
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            You have the right to:
                        </p>
                        <ul style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                            paddingLeft: '24px',
                        }}>
                            <li style={{ marginBottom: '8px' }}>Access and update your personal information through your account settings</li>
                            <li style={{ marginBottom: '8px' }}>Delete your account and associated data</li>
                            <li style={{ marginBottom: '8px' }}>Opt-out of certain communications from us</li>
                            <li style={{ marginBottom: '8px' }}>Request a copy of your personal data</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            6. Cookies and Tracking Technologies
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier.
                        </p>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            7. Children's Privacy
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            8. Changes to This Privacy Policy
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                        </p>
                    </section>

                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '600',
                            color: colors.textPrimary,
                            margin: '0 0 16px 0',
                        }}>
                            9. Contact Us
                        </h2>
                        <p style={{
                            fontSize: '15px',
                            color: colors.textSecondary,
                            margin: '0 0 16px 0',
                        }}>
                            If you have any questions about this Privacy Policy, please contact us at privacy@trak.com
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyScreen;

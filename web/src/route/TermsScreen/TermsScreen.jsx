import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TrakLogo from '../../components/TrakLogo';

const TermsScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="trak-auth-page">
            <div className="trak-auth-bg" aria-hidden />
            <div className="trak-auth-panel-wide">
                <button type="button" className="trak-auth-back" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div className="trak-auth-brand">
                    <TrakLogo size={32} variant="auto" />
                    <span className="trak-logo-word">TR<em>A</em>K</span>
                </div>
                <h1 className="trak-pg-title">Terms of Service</h1>
                <p className="trak-pg-sub" style={{ marginBottom: 32 }}>
                    Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="trak-auth-legal">
                    <section>
                        <h2>
                            1. Acceptance of Terms
                        </h2>
                        <p>
                            By accessing and using TRAK, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2>
                            2. Use License
                        </h2>
                        <p>
                            Permission is granted to temporarily access the materials on TRAK's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul>
                            <li>Modify or copy the materials</li>
                            <li style={{ marginBottom: '8px' }}>Use the materials for any commercial purpose or for any public display</li>
                            <li style={{ marginBottom: '8px' }}>Attempt to reverse engineer any software contained on TRAK's website</li>
                            <li style={{ marginBottom: '8px' }}>Remove any copyright or other proprietary notations from the materials</li>
                        </ul>
                    </section>

                    <section>
                        <h2>
                            3. User Accounts
                        </h2>
                        <p>
                            When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
                        </p>
                        <p>
                            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                        </p>
                    </section>

                    <section>
                        <h2>
                            4. Content
                        </h2>
                        <p>
                            Our service allows you to access and view content, including news articles, information, and other materials. The content is provided for your personal, non-commercial use only.
                        </p>
                        <p>
                            You may not copy, reproduce, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content for any other purposes without the prior written consent of TRAK or the respective licensors of the content.
                        </p>
                    </section>

                    <section>
                        <h2>
                            5. Prohibited Uses
                        </h2>
                        <p>
                            You may not use our service:
                        </p>
                        <ul>
                            <li>In any way that violates any applicable national or international law or regulation</li>
                            <li style={{ marginBottom: '8px' }}>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
                            <li style={{ marginBottom: '8px' }}>To impersonate or attempt to impersonate the company, a company employee, another user, or any other person or entity</li>
                            <li style={{ marginBottom: '8px' }}>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
                        </ul>
                    </section>

                    <section>
                        <h2>
                            6. Termination
                        </h2>
                        <p>
                            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                        </p>
                    </section>

                    <section>
                        <h2>
                            7. Disclaimer
                        </h2>
                        <p>
                            The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, TRAK excludes all representations, warranties, and conditions relating to our website and the use of this website.
                        </p>
                    </section>

                    <section>
                        <h2>
                            8. Contact Information
                        </h2>
                        <p>
                            If you have any questions about these Terms of Service, please contact us at support@trak.com
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsScreen;


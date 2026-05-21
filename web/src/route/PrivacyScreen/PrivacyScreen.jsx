import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TrakLogo from '../../components/TrakLogo';

const PrivacyScreen = () => {
  const navigate = useNavigate();
  const updated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

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
        <h1 className="trak-pg-title">Privacy Policy</h1>
        <p className="trak-pg-sub" style={{ marginBottom: 32 }}>Last updated: {updated}</p>
        <div className="trak-auth-legal">
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly, including account information (name, email, password),
              profile information and preferences, content you save or interact with, and search queries.
            </p>
          </section>
          <section>
            <h2>2. How We Use Your Information</h2>
            <p>
              We use collected information to provide, maintain, and improve our services, personalize your
              experience, send technical notices, and respond to your questions.
            </p>
          </section>
          <section>
            <h2>3. Information Sharing</h2>
            <p>
              We do not sell your personal information. We may share data with service providers, with your consent,
              or to comply with legal obligations.
            </p>
          </section>
          <section>
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information.
            </p>
          </section>
          <section>
            <h2>5. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, contact us at privacy@trak.com</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyScreen;

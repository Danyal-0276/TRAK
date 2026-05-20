import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { startSocialOAuth } from '../../utils/Service/api';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthModal from '../../components/auth/AuthModal';
import {
  PasswordInputStyles,
  AuthField,
  AuthInput,
  AuthPasswordInput,
  AuthPrimaryButton,
  AuthDivider,
  AuthSocialButtons,
  AuthFooter,
  AuthLink,
} from '../../components/auth/AuthForm';

const SignUpScreen = () => {
  const navigate = useNavigate();
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
    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    if (phone.trim() && !/^\+?[0-9]{8,15}$/.test(phone.trim())) newErrors.phone = 'Invalid phone number';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!agreed) newErrors.agreed = 'You must agree to the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setErrors({});
    try {
      const sessionUser = await register(email, password, confirmPassword, fullName, phone);
      if (sessionUser?.email_verified) {
        navigate('/tag-selection', { state: { fromSignup: true } });
      } else {
        navigate('/verify-email', { state: { email, fromSignup: true } });
      }
    } catch (error) {
      const msg = error.message || 'Signup failed';
      const isPasswordError = msg.toLowerCase().includes('password');
      setErrors((prev) => ({ ...prev, [isPasswordError ? 'password' : 'email']: msg }));
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (key) => {
    setSocialLoading(key);
    try {
      if (key === 'google') {
        const userData = await loginWithGoogle();
        if (userData.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
        navigate('/tag-selection', { state: { fromSignup: true }, replace: true });
        return;
      }
      if (['apple', 'facebook'].includes(key)) {
        startSocialOAuth(key);
        return;
      }
      throw new Error('This social provider is not available yet.');
    } catch (error) {
      setErrors((prev) => ({ ...prev, email: error.message || 'Social signup failed' }));
    } finally {
      setSocialLoading(null);
    }
  };

  const legalDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <PasswordInputStyles />
      <AuthLayout
        title="Create your account"
        subtitle="Sign up to get started with TRAK"
        footer={
          <AuthFooter>
            Already have an account?{' '}
            <Link to="/login" className="trak-auth-link">
              Sign in
            </Link>
          </AuthFooter>
        }
      >
        <form onSubmit={handleSubmit}>
          <AuthField label="Full name" error={errors.fullName}>
            <AuthInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" error={errors.fullName} />
          </AuthField>
          <AuthField label="Email address" error={errors.email}>
            <AuthInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" error={errors.email} />
          </AuthField>
          <AuthField label="Phone number (optional)" error={errors.phone}>
            <AuthInput type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" error={errors.phone} />
          </AuthField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 }}>
            <AuthField label="Password" error={errors.password}>
              <AuthPasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                show={showPassword}
                onToggleShow={() => setShowPassword(!showPassword)}
                autoComplete="new-password"
                error={errors.password}
              />
            </AuthField>
            <AuthField label="Confirm" error={errors.confirmPassword}>
              <AuthPasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm"
                show={showConfirmPassword}
                onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                autoComplete="new-password"
                error={errors.confirmPassword}
              />
            </AuthField>
          </div>
          <label className="trak-auth-check">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              I agree to the{' '}
              <AuthLink onClick={() => setShowTermsModal(true)}>Terms</AuthLink>
              {' '}and{' '}
              <AuthLink onClick={() => setShowPrivacyModal(true)}>Privacy Policy</AuthLink>
            </span>
          </label>
          {errors.agreed && <p className="trak-auth-error">{errors.agreed}</p>}
          {errors.form && <p className="trak-auth-error">{errors.form}</p>}
          <AuthPrimaryButton loading={loading} loadingText="Creating account…">
            Create account
          </AuthPrimaryButton>
        </form>
        <AuthDivider />
        <AuthSocialButtons onProviderClick={handleSocial} loadingKey={socialLoading} />
      </AuthLayout>

      {showTermsModal && (
        <AuthModal title="Terms of Service" onClose={() => setShowTermsModal(false)}>
          <p style={{ color: 'var(--trak-ink4)', marginBottom: 16 }}>Last updated: {legalDate}</p>
          <section>
            <h3>1. Acceptance of Terms</h3>
            <p>By accessing and using TRAK, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>
          <section>
            <h3>2. Use License</h3>
            <p>Permission is granted to temporarily access the materials on TRAK for personal, non-commercial transitory viewing only.</p>
          </section>
          <section>
            <h3>3. User Accounts</h3>
            <p>You must provide information that is accurate, complete, and current. You are responsible for safeguarding your password.</p>
          </section>
        </AuthModal>
      )}

      {showPrivacyModal && (
        <AuthModal title="Privacy Policy" onClose={() => setShowPrivacyModal(false)}>
          <p style={{ color: 'var(--trak-ink4)', marginBottom: 16 }}>Last updated: {legalDate}</p>
          <section>
            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly, including account and profile information and preferences.</p>
          </section>
          <section>
            <h3>2. How We Use Your Information</h3>
            <p>We use collected information to provide, maintain, and improve our services and personalize your experience.</p>
          </section>
          <section>
            <h3>3. Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information.</p>
          </section>
        </AuthModal>
      )}
    </>
  );
};

export default SignUpScreen;

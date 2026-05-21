import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  AuthField,
  AuthInput,
  AuthPrimaryButton,
  AuthFooter,
} from '../../components/auth/AuthForm';
import { requestPasswordReset } from '../../api/authPasswordApi';

const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Invalid email address' });
      return;
    }
    setLoading(true);
    try {
      const res = await requestPasswordReset(email.trim());
      navigate('/forgot-password-code', {
        state: {
          email: email.trim().toLowerCase(),
          debugResetPreview: res?.debug_reset_preview || null,
        },
      });
    } catch {
      setErrors({ email: 'Could not start reset. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send a verification code to your email"
      backTo="/login"
      footer={
        <AuthFooter>
          Remember your password?{' '}
          <Link to="/login" className="trak-auth-link">
            Sign in
          </Link>
        </AuthFooter>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthField label="Email address" error={errors.email} htmlFor="reset-email">
          <AuthInput
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
          />
        </AuthField>
        <AuthPrimaryButton loading={loading} loadingText="Sending…">
          Send code
        </AuthPrimaryButton>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordScreen;

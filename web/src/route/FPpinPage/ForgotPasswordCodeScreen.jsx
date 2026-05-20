import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  PasswordInputStyles,
  AuthField,
  AuthInput,
  AuthPasswordInput,
  AuthPrimaryButton,
  AuthFooter,
} from '../../components/auth/AuthForm';
import { requestPasswordReset, confirmPasswordResetWithOtp } from '../../api/authPasswordApi';

const ForgotPasswordCodeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state?.email || '').trim().toLowerCase();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [timer, setTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) navigate('/forgot-password', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Enter the code from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitLoading(true);
    try {
      await confirmPasswordResetWithOtp({
        email,
        code: code.trim(),
        password,
        password_confirm: passwordConfirm,
      });
      navigate('/password-changed');
    } catch (err) {
      setError(err?.message || 'Could not reset password.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <PasswordInputStyles />
      <AuthLayout
        title="Enter your code"
        subtitle={
          <>
            We sent a code to{' '}
            <strong style={{ color: 'var(--trak-ink)' }}>{email || 'your email'}</strong>. Enter it below with your new password.
          </>
        }
        backTo="/forgot-password"
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
          <AuthField label="Verification code" error={error && !password ? error : undefined}>
            <AuthInput
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
              placeholder="6-digit code"
            />
          </AuthField>
          <AuthField label="New password">
            <AuthPasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              show={showPw}
              onToggleShow={() => setShowPw(!showPw)}
              autoComplete="new-password"
            />
          </AuthField>
          <AuthField label="Confirm password">
            <AuthPasswordInput
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Repeat password"
              show={showPw}
              onToggleShow={() => setShowPw(!showPw)}
              autoComplete="new-password"
            />
          </AuthField>
          {error && <p className="trak-auth-error">{error}</p>}
          <AuthPrimaryButton loading={submitLoading} loadingText="Saving…">
            Reset password
          </AuthPrimaryButton>
        </form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            type="button"
            className="trak-auth-link"
            disabled={timer > 0 || !email || resendLoading}
            onClick={async () => {
              if (timer > 0 || !email || resendLoading) return;
              setResendLoading(true);
              try {
                await requestPasswordReset(email);
                setTimer(60);
              } finally {
                setResendLoading(false);
              }
            }}
          >
            {resendLoading
              ? 'Sending…'
              : timer > 0
                ? `Resend code in 0:${timer.toString().padStart(2, '0')}`
                : 'Resend code'}
          </button>
        </div>
      </AuthLayout>
    </>
  );
};

export default ForgotPasswordCodeScreen;

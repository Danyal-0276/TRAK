import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  PasswordInputStyles,
  AuthField,
  AuthInput,
  AuthPasswordInput,
  AuthPrimaryButton,
  AuthFooter,
} from '../../components/auth/AuthForm';
import { confirmPasswordReset } from '../../api/authPasswordApi';

const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const hasTokenParams = Boolean(uid.trim() && token.trim());

  useEffect(() => {
    setUid(searchParams.get('uid') || '');
    setToken(searchParams.get('token') || '');
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!uid.trim()) {
      setErrors({ uid: 'Paste the code from your reset email (uid)' });
      return;
    }
    if (!token.trim()) {
      setErrors({ token: 'Paste the token from your reset link' });
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset({
        uid: uid.trim(),
        token: token.trim(),
        password: newPassword,
        password_confirm: confirmPassword,
      });
      navigate('/password-changed');
    } catch (err) {
      setErrors({ form: err?.message || 'Could not reset password. The link may have expired.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PasswordInputStyles />
      <AuthLayout
        title="Create new password"
        subtitle="Choose a strong password you'll remember"
        onBack={() => navigate(-1)}
        footer={
          <AuthFooter>
            Remember your password?{' '}
            <Link to="/login" className="trak-auth-link">
              Sign in
            </Link>
          </AuthFooter>
        }
      >
        {hasTokenParams ? (
          <p style={{ fontSize: 13, color: 'var(--trak-green)', marginBottom: 16 }}>
            Reset link verified. Create your new password below.
          </p>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--trak-ink3)', marginBottom: 16 }}>
            Open this page from the reset link in your email, or paste uid/token manually below.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <details style={{ marginBottom: 16 }}>
            <summary style={{ cursor: 'pointer', color: 'var(--trak-ink3)', fontSize: 13 }}>
              Show manual uid/token fields
            </summary>
            <div style={{ marginTop: 12 }}>
              <AuthField label="Reset code (uid)" error={errors.uid}>
                <AuthInput value={uid} onChange={(e) => setUid(e.target.value)} placeholder="From email link" error={errors.uid} />
              </AuthField>
              <AuthField label="Token" error={errors.token}>
                <AuthInput value={token} onChange={(e) => setToken(e.target.value)} placeholder="From email link" error={errors.token} />
              </AuthField>
            </div>
          </details>

          <AuthField label="New password" error={errors.newPassword}>
            <AuthPasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              show={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
              autoComplete="new-password"
              error={errors.newPassword}
            />
          </AuthField>
          <AuthField label="Confirm new password" error={errors.confirmPassword}>
            <AuthPasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirmPassword}
            />
          </AuthField>
          {errors.form && <p className="trak-auth-error">{errors.form}</p>}
          <AuthPrimaryButton loading={loading} loadingText="Resetting…">
            Reset password
          </AuthPrimaryButton>
        </form>
      </AuthLayout>
    </>
  );
};

export default ResetPasswordScreen;

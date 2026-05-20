import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resendEmailVerification } from '../../api/authEmailApi';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  AuthOtpInput,
  AuthPrimaryButton,
  AuthFooter,
  AuthLink,
} from '../../components/auth/AuthForm';

const VerifyEmailScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, verifyEmail, isAuthenticated } = useAuth();
  const email = (location.state?.email || user?.email || '').trim().toLowerCase();
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = code.replace(/\D/g, '');
    if (trimmed.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(trimmed);
      navigate('/tag-selection', { state: { fromSignup: true }, replace: true });
    } catch (err) {
      setError(err?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResendLoading(true);
    setError('');
    try {
      const data = await resendEmailVerification();
      if (data.dev_code) setCode(data.dev_code);
      setTimer(60);
    } catch (err) {
      setError(err?.message || 'Could not resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        <>
          We sent a 6-digit code to{' '}
          <strong style={{ color: 'var(--trak-ink)' }}>{email || 'your email'}</strong>
        </>
      }
      backTo="/signup"
      footer={
        <AuthFooter>
          <AuthLink onClick={() => navigate('/tag-selection', { state: { fromSignup: true } })}>
            Skip for now
          </AuthLink>
        </AuthFooter>
      }
    >
      <form onSubmit={handleVerify}>
        <AuthOtpInput value={code} onChange={setCode} />
        {error && <p className="trak-auth-error" style={{ textAlign: 'center' }}>{error}</p>}
        <AuthPrimaryButton loading={loading} loadingText="Verifying…">
          Verify email
        </AuthPrimaryButton>
      </form>
      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button
          type="button"
          className="trak-auth-link"
          disabled={timer > 0 || resendLoading}
          onClick={handleResend}
          style={{
            opacity: timer > 0 ? 0.6 : 1,
            cursor: timer > 0 ? 'not-allowed' : 'pointer',
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
  );
};

export default VerifyEmailScreen;

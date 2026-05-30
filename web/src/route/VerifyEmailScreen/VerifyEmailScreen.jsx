import React, { useState, useEffect } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import { filledActionColors } from '../../theme/buttonContrast';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { useAuth } from '../../context/AuthContext';
import { resendEmailVerification } from '../../api/authEmailApi';

const VerifyEmailScreen = () => {
    const { theme } = useTheme();
    const { colors } = theme;
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
    const interval = setInterval(() => setTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
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
      if (data.dev_code) setCode(String(data.dev_code));
      setTimer(60);
    } catch (err) {
      setError(err?.message || 'Could not resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <NewsBackgroundAnimation />
      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: colors.textSecondary,
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '40px',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={{ marginBottom: '32px' }}>
          <img
            src="/images/whiteLogo.svg"
            alt="TRAK"
            style={{ width: 32, height: 32, filter: 'invert(1)', marginBottom: 24 }}
          />
          <h1 style={{ fontSize: 28, fontWeight: 600, color: colors.textPrimary, margin: '0 0 8px' }}>
            Verify your email
          </h1>
          <p style={{ fontSize: 15, color: colors.textSecondary, margin: 0, lineHeight: 1.5 }}>
            We sent a 6-digit code to{' '}
            <strong style={{ color: colors.textPrimary }}>{email || 'your email'}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: colors.textPrimary, marginBottom: 8 }}>
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            style={{
              width: '100%',
              padding: '11px 14px',
              fontSize: 20,
              letterSpacing: 6,
              textAlign: 'center',
              border: error ? '1px solid #ef4444' : '1px solid #cbd5e1',
              borderRadius: 6,
              marginBottom: 16,
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 16px' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: action.background,
              color: action.foreground,
              border: 'none',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: 16,
            }}
          >
            {loading ? 'Verifying…' : 'Verify email'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={timer > 0 || resendLoading}
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            background: 'transparent',
            color: colors.textPrimary,
            fontSize: 14,
            cursor: timer > 0 || resendLoading ? 'not-allowed' : 'pointer',
            opacity: timer > 0 ? 0.5 : 1,
            marginBottom: 12,
          }}
        >
          {resendLoading
            ? 'Sending…'
            : timer > 0
              ? `Resend code in 0:${timer.toString().padStart(2, '0')}`
              : 'Resend code'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 14, color: colors.textSecondary }}>
          <button
            type="button"
            onClick={() => navigate('/tag-selection', { state: { fromSignup: true } })}
            style={{ border: 'none', background: 'none', color: colors.textPrimary, cursor: 'pointer', fontWeight: 500 }}
          >
            Skip for now
          </button>
        </p>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 15, color: colors.textSecondary }}>
          <Link to="/login" style={{ color: colors.textPrimary, textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailScreen;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { requestPasswordReset, verifyPasswordResetOtp } from '../../api/authPasswordApi';

const ForgotPasswordCodeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state?.email || '').trim().toLowerCase();
  const devCode = location.state?.devCode || null;
  const emailSent = location.state?.emailSent !== false;
  const [code, setCode] = useState(devCode ? String(devCode) : '');
  const [timer, setTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = code.replace(/\D/g, '');
    if (trimmed.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await verifyPasswordResetOtp({ email, code: trimmed });
      navigate('/reset-password', {
        state: {
          email,
          resetToken: res.reset_token,
          fromOtp: true,
        },
      });
    } catch (err) {
      setError(err?.message || 'Invalid or expired code.');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <NewsBackgroundAnimation />
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/forgot-password', { replace: true })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '0',
            border: 'none',
            background: 'transparent',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '40px',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={{ marginBottom: '32px', textAlign: 'left' }}>
          <img
            src="/images/whiteLogo.svg"
            alt="TRAK"
            style={{
              width: '32px',
              height: '32px',
              filter: 'invert(1)',
              marginBottom: '24px',
            }}
          />
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#0f172a',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px',
              lineHeight: '1.2',
            }}
          >
            Enter verification code
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5',
            }}
          >
            {emailSent
              ? 'We sent a 6-digit code to '
              : 'If your account exists, a code was sent to '}
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{email || 'your email'}</span>.
            {emailSent ? ' Check your inbox and spam folder.' : ''}
          </p>
          {devCode ? (
            <p
              style={{
                marginTop: '12px',
                padding: '10px 12px',
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#166534',
              }}
            >
              Dev reset code: <strong>{devCode}</strong>
            </p>
          ) : null}
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#0f172a',
              marginBottom: '8px',
            }}
          >
            6-digit code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '24px',
              letterSpacing: '8px',
              textAlign: 'center',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              marginBottom: '20px',
              boxSizing: 'border-box',
            }}
          />

          {error ? (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 16px 0' }}>{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitLoading || code.replace(/\D/g, '').length !== 6}
            style={{
              width: '100%',
              padding: '12px 20px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: submitLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '20px',
              opacity: code.replace(/\D/g, '').length !== 6 ? 0.6 : 1,
            }}
          >
            {submitLoading ? 'Verifying…' : (
              <>
                Continue
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={async () => {
              if (timer > 0 || !email || resendLoading) return;
              setResendLoading(true);
              try {
                await requestPasswordReset(email);
                setTimer(60);
              } catch {
                setError('Could not resend code. Try again.');
              } finally {
                setResendLoading(false);
              }
            }}
            disabled={timer > 0 || !email || resendLoading}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: timer > 0 || !email ? 'not-allowed' : 'pointer',
              padding: 0,
            }}
          >
            <span
              style={{
                fontSize: '15px',
                color: timer > 0 ? '#94a3b8' : '#0f172a',
                fontWeight: '500',
              }}
            >
              {resendLoading
                ? 'Sending…'
                : timer > 0
                  ? `Resend code in 0:${timer.toString().padStart(2, '0')}`
                  : 'Resend code'}
            </span>
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '15px', color: '#64748b' }}>
            Remember password?{' '}
            <Link to="/login" style={{ color: '#0f172a', fontWeight: 500, textDecoration: 'none' }}>
              Log in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordCodeScreen;

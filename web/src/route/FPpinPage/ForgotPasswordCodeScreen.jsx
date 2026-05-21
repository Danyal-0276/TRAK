import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
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
          onClick={() => navigate(-1)}
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
            Enter your code
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#64748b',
              margin: '0',
              lineHeight: '1.5',
            }}
          >
            We sent a 6-digit code to{' '}
            <span style={{ fontWeight: '600', color: '#0f172a' }}>{email || 'your email'}</span>. Check your inbox
            (and spam), then choose a new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}>
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ''))}
            placeholder="6-digit code"
            style={{
              width: '100%',
              padding: '11px 14px',
              fontSize: '16px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              marginBottom: '20px',
              boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}>
            New password
          </label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              style={{
                width: '100%',
                padding: '11px 44px 11px 14px',
                fontSize: '15px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#64748b',
              }}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#0f172a', marginBottom: '8px' }}>
            Confirm password
          </label>
          <input
            type={showPw ? 'text' : 'password'}
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Repeat password"
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '11px 14px',
              fontSize: '15px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              marginBottom: '16px',
              boxSizing: 'border-box',
            }}
          />

          {error ? (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: '0 0 16px 0' }}>{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitLoading}
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
            }}
          >
            {submitLoading ? 'Saving…' : (
              <>
                Reset password
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
                /* generic messaging */
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
              {resendLoading ? 'Sending…' : timer > 0 ? `Resend code in 0:${timer.toString().padStart(2, '0')}` : 'Resend code'}
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Text from '../../components/ui/Text';
import NewsBackgroundAnimation from '../../components/NewsBackgroundAnimation';
import { requestPasswordReset } from '../../api/authPasswordApi';

const ForgotPasswordCodeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state?.email || '').trim().toLowerCase();
  const [timer, setTimer] = useState(60);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
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
      <div style={{
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

        <div style={{ marginBottom: '48px', textAlign: 'left' }}>
          <img
            src="/images/whiteLogo.svg"
            alt="TRAK"
            style={{
              width: '32px',
              height: '32px',
              filter: 'invert(1)',
              marginBottom: '40px',
            }}
          />
          <h1 style={{
            fontSize: '30px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px',
            lineHeight: '1.2',
          }}
          >
            Check your email
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#64748b',
            margin: '0',
            lineHeight: '1.5',
          }}
          >
            If an account exists for{' '}
            <span style={{ fontWeight: '500', color: '#0f172a' }}>{email || 'that address'}</span>
            , we sent a link to reset your password. Use it in this browser — the reset page will open with the correct token.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/reset-password')}
          style={{
            width: '100%',
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '15px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '24px',
            fontFamily: 'inherit',
          }}
        >
          Open reset page
          <ArrowRight size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button
            type="button"
            onClick={async () => {
              if (timer > 0 || !email || resendLoading) return;
              setResendLoading(true);
              try {
                await requestPasswordReset(email);
                setTimer(60);
              } catch {
                /* still show generic success elsewhere */
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
            <span style={{
              fontSize: '15px',
              color: timer > 0 ? '#94a3b8' : '#0f172a',
              fontWeight: '500',
            }}
            >
              {resendLoading ? 'Sending…' : timer > 0 ? `Resend email in 0:${timer.toString().padStart(2, '0')}` : 'Resend reset email'}
            </span>
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text variant="body" color="#64748b" style={{ fontSize: '15px' }}>
            Remember password?{' '}
            <Link to="/login" style={{ color: '#0f172a', fontWeight: 500, textDecoration: 'none' }}>
              Log in
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordCodeScreen;

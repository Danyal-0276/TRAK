import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthPrimaryButton, AuthSecondaryButton } from '../../components/auth/AuthForm';

const OpeningScreen = () => {
  const navigate = useNavigate();
  const { user, loading, isAdmin } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'admin' || isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    } else if (user) {
      navigate('/newsfeed', { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="trak-welcome-page">
      <div
        className="trak-welcome-hero"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? 'none' : 'translateY(12px)',
          transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="trak-welcome-logo">T</div>
          <h1 className="trak-welcome-title">TRAK</h1>
          <p
            style={{
              marginTop: 16,
              fontSize: 15,
              color: 'var(--trak-ink3)',
              fontFamily: 'var(--trak-font-body)',
              letterSpacing: '0.04em',
            }}
          >
            News intelligence, curated for you
          </p>
        </div>
      </div>

      <div
        className="trak-welcome-sheet"
        style={{
          opacity: ready ? 1 : 0,
          transform: ready ? 'none' : 'translateY(24px)',
          transition: 'all 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
        }}
      >
        <div className="trak-welcome-actions">
          <p>
            Welcome to TRAK — discover trending stories, scored credibility, and a feed built around
            what you care about.
          </p>
          <AuthPrimaryButton
            type="button"
            showArrow
            onClick={() => navigate('/signup')}
          >
            Create account
          </AuthPrimaryButton>
          <AuthSecondaryButton type="button" onClick={() => navigate('/login')}>
            Sign in
          </AuthSecondaryButton>
        </div>
      </div>
    </div>
  );
};

export default OpeningScreen;

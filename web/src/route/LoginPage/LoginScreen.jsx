import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { startSocialOAuth } from '../../utils/Service/api';
import { useUIFeedback } from '../../components/ui/UIFeedback';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  PasswordInputStyles,
  AuthField,
  AuthInput,
  AuthPasswordInput,
  AuthPrimaryButton,
  AuthDivider,
  AuthSocialButtons,
  AuthFooter,
} from '../../components/auth/AuthForm';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, completeSocialLogin, loginWithGoogle } = useAuth();
  const { error: showError } = useUIFeedback();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  useEffect(() => {
    const ticket = searchParams.get('social_ticket');
    if (!ticket) return;
    const consume = async () => {
      setLoading(true);
      try {
        const userData = await completeSocialLogin(ticket);
        navigate(userData.role === 'admin' ? '/admin/dashboard' : '/newsfeed', { replace: true });
      } catch (error) {
        setErrors((prev) => ({ ...prev, password: error.message || 'Social login completion failed' }));
      } finally {
        setLoading(false);
      }
    };
    consume();
  }, [searchParams, completeSocialLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      setLoading(false);
      return;
    }
    if (!password) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      setLoading(false);
      return;
    }
    try {
      const userData = await login(email, password);
      navigate(userData.role === 'admin' ? '/admin/dashboard' : '/newsfeed');
    } catch (error) {
      setErrors((prev) => ({ ...prev, password: error.message || 'Invalid email or password' }));
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (key) => {
    setSocialLoading(key);
    try {
      if (key === 'google') {
        const userData = await loginWithGoogle();
        navigate(userData.role === 'admin' ? '/admin/dashboard' : '/newsfeed', { replace: true });
        return;
      }
      if (['apple', 'facebook'].includes(key)) {
        startSocialOAuth(key);
        return;
      }
      throw new Error('This social provider is not available yet.');
    } catch (error) {
      showError(error.message || 'Social login failed');
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <>
      <PasswordInputStyles />
      <AuthLayout
        title="Sign in to your account"
        subtitle="Enter your email and password to continue"
        footer={
          <AuthFooter>
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="trak-auth-link">
              Sign up
            </Link>
          </AuthFooter>
        }
      >
        <form onSubmit={handleSubmit}>
          <AuthField label="Email address" error={errors.email} htmlFor="login-email">
            <AuthInput
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />
          </AuthField>

          <div className="trak-auth-field">
            <div className="trak-auth-label-row">
              <label className="trak-auth-label" htmlFor="login-password">
                Password
              </label>
              <Link to="/forgot-password" className="trak-auth-link" style={{ fontSize: 13 }}>
                Forgot password?
              </Link>
            </div>
            <AuthPasswordInput
              id="login-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              show={showPassword}
              onToggleShow={() => setShowPassword(!showPassword)}
            />
            {errors.password && <p className="trak-auth-error">{errors.password}</p>}
          </div>

          <AuthPrimaryButton loading={loading} loadingText="Signing in…">
            Sign in
          </AuthPrimaryButton>
        </form>

        <AuthDivider />
        <AuthSocialButtons onProviderClick={handleSocial} loadingKey={socialLoading} />
      </AuthLayout>
    </>
  );
};

export default LoginScreen;

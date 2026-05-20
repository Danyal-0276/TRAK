import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

export const PasswordInputStyles = () => (
  <style>{`
    input[type="password"]::-webkit-credentials-auto-fill-button,
    input[type="password"]::-ms-reveal,
    input[type="password"]::-ms-clear {
      display: none !important;
    }
  `}</style>
);

export function AuthField({ label, error, children, htmlFor, hint }) {
  return (
    <div className="trak-auth-field">
      {label && (
        <label className="trak-auth-label" htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {hint}
      {children}
      {error && <p className="trak-auth-error">{error}</p>}
    </div>
  );
}

export function AuthInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  className = '',
  ...rest
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className={`trak-input trak-auth-input${error ? ' trak-auth-input-error' : ''} ${className}`.trim()}
      {...rest}
    />
  );
}

export function AuthPasswordInput({
  id,
  value,
  onChange,
  placeholder = 'Enter your password',
  error,
  show,
  onToggleShow,
  autoComplete = 'current-password',
}) {
  return (
    <div className="trak-auth-password-wrap">
      <AuthInput
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={error}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="trak-auth-eye"
        onClick={onToggleShow}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function AuthPrimaryButton({
  children,
  loading,
  loadingText = 'Please wait…',
  type = 'submit',
  onClick,
  disabled,
  showArrow = true,
}) {
  return (
    <button
      type={type}
      className="trak-btn-primary trak-auth-submit"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        loadingText
      ) : (
        <>
          {children}
          {showArrow && <ArrowRight size={18} />}
        </>
      )}
    </button>
  );
}

export function AuthSecondaryButton({ children, onClick, type = 'button' }) {
  return (
    <button type={type} className="trak-btn-secondary" onClick={onClick}>
      {children}
    </button>
  );
}

export function AuthDivider({ text = 'Or continue with' }) {
  return (
    <div className="trak-auth-divider">
      <span>{text}</span>
    </div>
  );
}

export function AuthFooter({ children }) {
  return <div className="trak-auth-footer">{children}</div>;
}

export function AuthLink({ to, children, onClick }) {
  if (onClick) {
    return (
      <button type="button" className="trak-auth-link" onClick={onClick}>
        {children}
      </button>
    );
  }
  return (
    <Link to={to} className="trak-auth-link">
      {children}
    </Link>
  );
}

const SOCIAL_PROVIDERS = [
  {
    name: 'Google',
    key: 'google',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    ),
  },
  {
    name: 'Apple',
    key: 'apple',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    key: 'facebook',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export function AuthSocialButtons({ onProviderClick, loadingKey }) {
  return (
    <div className="trak-auth-social-row">
      {SOCIAL_PROVIDERS.map((provider) => {
        const isLoading = loadingKey === provider.key;
        return (
          <button
            key={provider.key}
            type="button"
            className="trak-auth-social-btn"
            disabled={loadingKey != null}
            onClick={() => onProviderClick(provider.key)}
          >
            {isLoading ? <span className="trak-auth-spinner" /> : provider.icon}
            {isLoading ? 'Signing in…' : provider.name}
          </button>
        );
      })}
    </div>
  );
}

export function AuthSuccessIcon() {
  return (
    <div className="trak-auth-success-icon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="var(--trak-green)" strokeWidth="2" fill="color-mix(in srgb, var(--trak-green) 12%, transparent)" />
        <path d="M8 12l3 3 5-6" stroke="var(--trak-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function AuthOtpInput({ value, onChange, length = 6 }) {
  const digits = value.replace(/\D/g, '').slice(0, length).split('');
  const slots = Array.from({ length }, (_, i) => digits[i] || '');

  return (
    <div className="trak-auth-otp-row">
      {slots.map((d, i) => (
        <span key={i} className={`trak-auth-otp-cell${d ? ' filled' : ''}`}>
          {d}
        </span>
      ))}
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        className="trak-auth-otp-hidden"
        value={value.replace(/\D/g, '').slice(0, length)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, length))}
        maxLength={length}
        aria-label="Verification code"
      />
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import TrakLogo from '../TrakLogo';

/**
 * Shared shell for login, signup, OTP, password reset, and legal pages.
 * Uses TRAK theme CSS variables (light/dark from Settings).
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
  maxWidth = 420,
  wide = false,
  backTo,
  onBack,
  footer,
  className = '',
}) {
  const BackControl = backTo ? (
    <Link to={backTo} className="trak-auth-back">
      <ArrowLeft size={16} />
      Back
    </Link>
  ) : onBack ? (
    <button type="button" className="trak-auth-back" onClick={onBack}>
      <ArrowLeft size={16} />
      Back
    </button>
  ) : null;

  return (
    <div className={`trak-auth-page ${className}`.trim()}>
      <div className="trak-auth-bg" aria-hidden />
      <div
        className={wide ? 'trak-auth-panel-wide' : 'trak-auth-card'}
        style={wide ? undefined : { maxWidth }}
      >
        {BackControl}
        <div className="trak-auth-brand">
          <TrakLogo size={32} variant="auto" />
          <span className="trak-logo-word">
            TR<em>A</em>K
          </span>
        </div>
        {(title || subtitle) && (
          <header className="trak-auth-header">
            {title && <h1 className="trak-auth-title">{title}</h1>}
            {subtitle && <p className="trak-auth-sub">{subtitle}</p>}
          </header>
        )}
        {children}
        {footer}
      </div>
    </div>
  );
}

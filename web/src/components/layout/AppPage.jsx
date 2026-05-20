import React from 'react';

/**
 * Standard main-app page shell (newsfeed, settings, profile, etc.)
 */
export default function AppPage({
  children,
  maxWidth = 1200,
  narrow = false,
  className = '',
}) {
  const width = narrow ? 800 : maxWidth;
  return (
    <div className={`trak-app-page trak-page-enter ${className}`.trim()}>
      <div className="trak-app-page-inner" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle }) {
  return (
    <header className="trak-page-header">
      {title && <h1 className="trak-pg-title">{title}</h1>}
      {subtitle && <p className="trak-pg-sub">{subtitle}</p>}
    </header>
  );
}

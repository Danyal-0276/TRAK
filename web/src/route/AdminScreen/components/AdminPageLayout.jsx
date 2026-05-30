import React from 'react';
import './adminPageLayout.css';

export default function AdminPageLayout({ children, maxWidth = '1400px', className = '' }) {
  return (
    <div
      className={`admin-page${className ? ` ${className}` : ''}`}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}

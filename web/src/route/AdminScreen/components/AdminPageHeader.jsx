import React from 'react';
import './adminPageLayout.css';

export default function AdminPageHeader({ title, description, actions, children }) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header__text">
        <h1 className="admin-page-header__title">{title}</h1>
        {description ? (
          <p className="admin-page-header__description">{description}</p>
        ) : null}
        {children}
      </div>
      {actions ? <div className="admin-page-header__actions">{actions}</div> : null}
    </header>
  );
}

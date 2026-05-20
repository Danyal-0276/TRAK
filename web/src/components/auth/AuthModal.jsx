import React from 'react';
import { X } from 'lucide-react';

export default function AuthModal({ title, onClose, children }) {
  return (
    <div className="trak-auth-modal-overlay" onClick={onClose} role="presentation">
      <div className="trak-auth-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
        <div className="trak-auth-modal-head">
          <h2>{title}</h2>
          <button type="button" className="trak-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="trak-auth-modal-body">{children}</div>
      </div>
    </div>
  );
}

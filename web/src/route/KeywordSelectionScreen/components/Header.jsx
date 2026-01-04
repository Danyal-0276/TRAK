import React from 'react';
import { ChevronLeft } from 'lucide-react';

export function Header({ onBack }) {
    return (
        <div style={{ padding: '10px 20px' }}>
            <button
                onClick={onBack}
                style={{
                    width: 'clamp(36px, 9vw, 40px)',
                    height: 'clamp(36px, 9vw, 40px)',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(30, 41, 59, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '1px solid rgba(30, 41, 59, 0.2)',
                    cursor: 'pointer',
                }}
            >
                <ChevronLeft size={24} color="#1e293b" />
            </button>
        </div>
    );
}


